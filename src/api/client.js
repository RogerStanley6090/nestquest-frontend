const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const token = localStorage.getItem('nq_auth_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.json()
      detail = body.detail || JSON.stringify(body)
    } catch {
      // response wasn't JSON
    }
    throw new Error(`API error ${response.status}: ${detail}`)
  }

  if (response.status === 204) return null
  return response.json()
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
}

// ---- Public endpoints ----
export const publicApi = {
  submitReport: (data) => api.post('/api/nest-reports/', data),
  getSpecies: () => api.get('/api/species/'),
  getVerifiedReports: () => api.get('/api/public/reports/'),
}

// ---- Researcher/Admin endpoints ----
export const researcherApi = {
  login: (email, password) => api.post('/api/auth/login/', { email, password }),
  logout: () => api.post('/api/auth/logout/', {}),
  listReports: () => api.get('/api/researcher/reports/'),
  getReport: (id) => api.get(`/api/researcher/reports/${id}/`),
  updateStatus: (id, status) => api.patch(`/api/researcher/reports/${id}/status/`, { status }),
  addReview: (id, review) => api.post(`/api/researcher/reports/${id}/review/`, review),
  exportReports: () => api.get('/api/researcher/reports/export/'),
}