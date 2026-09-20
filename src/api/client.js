const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const token = localStorage.getItem('nq_auth_token')
  const isFormData = options.body instanceof FormData

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...options.headers,
  }

  let response
  try {
    response = await fetch(url, { ...options, headers })
  } catch (networkErr) {
    const err = new Error('Network request failed')
    err.status = null
    err.body = null
    err.isNetworkError = true
    throw err
  }

  if (!response.ok) {
    let body = null
    try {
      body = await response.json()
    } catch {
      // response wasn't JSON
    }
    const detail = body?.detail || (body ? JSON.stringify(body) : response.statusText)
    const err = new Error(`API error ${response.status}: ${detail}`)
    err.status = response.status
    err.body = body
    throw err
  }

  if (response.status === 204) return null
  return response.json()
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => {
    const isFormData = body instanceof FormData
    return request(path, { method: 'POST', body: isFormData ? body : JSON.stringify(body) })
  },
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
}

// ---- Public endpoints ----
export const publicApi = {
  submitReport: (data) => api.post('/api/nest-reports/', data),
  getSpecies: () => api.get('/api/species/'),
  getVerifiedReports: () => api.get('/api/nest-reports/'),
  getVerifiedReport: (id) => api.get(`/api/nest-reports/${id}/`),
  uploadPhoto: (reportId, file, caption) => {
    const formData = new FormData()
    formData.append('report', reportId)
    formData.append('photo', file)
    if (caption) formData.append('caption', caption)
    return api.post('/api/nest-photos/', formData)
  },
}

// ---- Researcher/Admin endpoints (require researcher token) ----
export const researcherApi = {
  login: (username, password) => api.post('/api/auth/login/', { username, password }),
  logout: () => api.post('/api/auth/logout/', {}),
  listReports: () => api.get('/api/researcher/reports/'),
  getReport: (id) => api.get(`/api/researcher/reports/${id}/`),
  updateStatus: (id, status) => api.patch(`/api/researcher/reports/${id}/status_update/`, { status }),
  addReview: (id, review) => api.post(`/api/researcher/reports/${id}/review/`, review),
  exportReports: () => api.get('/api/researcher/reports/export/'),
  getPhotosForReport: (reportId) => api.get(`/api/nest-photos/?report=${reportId}`),
}