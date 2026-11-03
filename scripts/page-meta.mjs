// Runs after `vite build`. Makes a copy of dist/index.html for the pages that
// need their own link-preview (share) card, so /guide and /map get a title,
// description and image of their own when shared in Messenger, Slack, etc.
// Vercel serves these real files before the "send everything to index.html" rule.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const SITE = 'https://nestquest-frontend.vercel.app'

const PAGES = [
  {
    path: 'guide',
    title: 'Identification guide | NestQuest',
    description: 'Answer a few simple questions about a nest you found and get a likely bird species, with photos and tips.',
    image: 'og-guide.png',
  },
  {
    path: 'map',
    title: 'Nest map | NestQuest',
    description: 'Explore verified nest sightings across New Zealand. Exact locations stay private to protect the birds.',
    image: 'og-map.png',
  },
]

const base = readFileSync('dist/index.html', 'utf8')

function setMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`)
  if (!re.test(html)) throw new Error(`Missing <meta ${attr}="${key}"> in index.html`)
  return html.replace(re, `$1${value}$2`)
}

for (const p of PAGES) {
  const url = `${SITE}/${p.path}`
  let html = base
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${p.title}</title>`)
  html = setMeta(html, 'name', 'description', p.description)
  html = setMeta(html, 'property', 'og:title', p.title)
  html = setMeta(html, 'property', 'og:description', p.description)
  html = setMeta(html, 'property', 'og:image', `${SITE}/${p.image}`)
  html = setMeta(html, 'property', 'og:url', url)
  html = setMeta(html, 'name', 'twitter:title', p.title)
  html = setMeta(html, 'name', 'twitter:description', p.description)
  html = setMeta(html, 'name', 'twitter:image', `${SITE}/${p.image}`)
  mkdirSync(`dist/${p.path}`, { recursive: true })
  writeFileSync(`dist/${p.path}/index.html`, html)
  console.log(`page-meta: wrote dist/${p.path}/index.html`)
}