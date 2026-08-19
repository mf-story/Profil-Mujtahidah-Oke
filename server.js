'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const PORT = process.env.PORT || 5514;
const ROOT = __dirname;
// Seed copies bundled in the image; live data/uploads may live on a mounted
// volume (Coolify/Docker) via DATA_DIR / UPLOADS_DIR env vars.
const SEED_DIR = path.join(ROOT, 'data');
const SEED_UPLOADS = path.join(ROOT, 'uploads');
const DATA_DIR = process.env.DATA_DIR || SEED_DIR;
const UPLOADS_DIR = process.env.UPLOADS_DIR || SEED_UPLOADS;
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const CONFIG_FILE = path.join(DATA_DIR, 'admin.config.json');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

// Copy seed files into a fresh volume so the first deploy has content.
function seedPersistentStorage() {
  try {
    if (path.resolve(SEED_DIR) !== path.resolve(DATA_DIR)) {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      for (const f of ['content.json', 'articles.json']) {
        const dest = path.join(DATA_DIR, f), src = path.join(SEED_DIR, f);
        if (!fs.existsSync(dest) && fs.existsSync(src)) fs.copyFileSync(src, dest);
      }
    }
    if (path.resolve(SEED_UPLOADS) !== path.resolve(UPLOADS_DIR)) {
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      if (fs.readdirSync(UPLOADS_DIR).length === 0 && fs.existsSync(SEED_UPLOADS)) {
        for (const f of fs.readdirSync(SEED_UPLOADS)) {
          try { fs.copyFileSync(path.join(SEED_UPLOADS, f), path.join(UPLOADS_DIR, f)); } catch { /* ignore */ }
        }
      }
    }
  } catch (e) { console.log('  [seed] ' + e.message); }
}
seedPersistentStorage();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

// ---- Security -------------------------------------------------------------
// Security headers applied to every response (anti-XSS/clickjacking/MitM).
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'X-XSS-Protection': '0',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), interest-cohort=()',
  // Effective once served over HTTPS; browsers ignore it on plain HTTP.
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ')
};
function applySecurity(res) {
  for (const k in SECURITY_HEADERS) res.setHeader(k, SECURITY_HEADERS[k]);
}

function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (xf) return String(xf).split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

// General per-IP rate limiter (mitigates simple floods / basic DDoS).
const rlHits = new Map();
const RL_WINDOW = 60 * 1000, RL_MAX = 300;
function rateLimited(ip) {
  const now = Date.now();
  let e = rlHits.get(ip);
  if (!e || now > e.resetAt) { e = { count: 0, resetAt: now + RL_WINDOW }; rlHits.set(ip, e); }
  e.count++;
  return e.count > RL_MAX;
}

// Login brute-force / credential-stuffing protection.
const loginAttempts = new Map();
const LOGIN_MAX_FAILS = 5, LOGIN_LOCK_MS = 15 * 60 * 1000;
function loginLocked(ip) { const a = loginAttempts.get(ip); return !!(a && a.lockedUntil > Date.now()); }
function loginFail(ip) {
  const a = loginAttempts.get(ip) || { fails: 0, lockedUntil: 0 };
  a.fails++;
  if (a.fails >= LOGIN_MAX_FAILS) { a.lockedUntil = Date.now() + LOGIN_LOCK_MS; a.fails = 0; }
  loginAttempts.set(ip, a);
}
function loginReset(ip) { loginAttempts.delete(ip); }

// Verify uploaded bytes really are the declared image type (anti web shell).
function isValidImage(mime, buf) {
  if (!buf || buf.length < 12) return false;
  if (mime === 'image/jpeg') return buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
  if (mime === 'image/png') return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
  if (mime === 'image/gif') return buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38;
  if (mime === 'image/webp') return buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP';
  return false;
}

// Bound memory used by the limiter maps.
const _cleanup = setInterval(() => {
  const now = Date.now();
  for (const [ip, e] of rlHits) if (now > e.resetAt) rlHits.delete(ip);
  for (const [ip, a] of loginAttempts) if ((!a.lockedUntil || now > a.lockedUntil) && !a.fails) loginAttempts.delete(ip);
}, 5 * 60 * 1000);
if (_cleanup.unref) _cleanup.unref();

// ---- Auth ----------------------------------------------------------------
function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync('admin123', salt, 64).toString('hex');
    const cfg = { salt, hash };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
    return cfg;
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

function verifyPassword(password) {
  const cfg = loadConfig();
  const hash = crypto.scryptSync(password, cfg.salt, 64).toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(cfg.hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function setPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ salt, hash }, null, 2));
}

const tokens = new Map(); // token -> expiry ms
const TOKEN_TTL = 8 * 60 * 60 * 1000;

function issueToken() {
  const token = crypto.randomBytes(24).toString('hex');
  tokens.set(token, Date.now() + TOKEN_TTL);
  return token;
}

function validToken(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return false;
  const exp = tokens.get(token);
  if (!exp) return false;
  if (Date.now() > exp) { tokens.delete(token); return false; }
  return true;
}

// ---- Helpers -------------------------------------------------------------
function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

function readBody(req, limit = 64 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('payload too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function safeJoin(base, target) {
  const p = path.normalize(path.join(base, target));
  if (!p.startsWith(base)) return null;
  return p;
}

// ---- Articles helpers ----------------------------------------------------
function readArticles() {
  try {
    if (!fs.existsSync(ARTICLES_FILE)) return [];
    return JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8')) || [];
  } catch { return []; }
}

function writeArticles(list) {
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(list, null, 2));
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || ('tulisan-' + Date.now());
}

function ensureUniqueSlug(all, self, source) {
  const base = slugify(source);
  let slug = base;
  let i = 2;
  while (all.some((a) => a && a !== self && a.slug === slug)) slug = base + '-' + (i++);
  return slug;
}

function estimateReadMinutes(html) {
  const text = String(html).replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function stripBody(a) {
  const { bodyHtml, ...rest } = a;
  return rest;
}

// ---- Analytics (privacy-friendly: visitor IPs are hashed, never stored raw) --
let analytics = loadAnalytics();
let analyticsDirty = false;

function loadAnalytics() {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const a = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
      a.days = a.days || {}; a.pages = a.pages || {}; a.articles = a.articles || {};
      if (!a.salt) a.salt = crypto.randomBytes(12).toString('hex');
      return a;
    }
  } catch { /* ignore corrupt file */ }
  return { totalViews: 0, salt: crypto.randomBytes(12).toString('hex'), days: {}, pages: {}, articles: {} };
}

function flushAnalytics() {
  if (!analyticsDirty) return;
  analyticsDirty = false;
  try { fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics)); } catch { /* ignore */ }
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

function visitorHash(ip) {
  return crypto.createHash('sha256').update(ip + '|' + analytics.salt + '|' + todayStr()).digest('hex').slice(0, 16);
}

function recordView(req, pathKey) {
  const day = todayStr();
  analytics.totalViews = (analytics.totalViews || 0) + 1;
  analytics.pages[pathKey] = (analytics.pages[pathKey] || 0) + 1;
  const d = analytics.days[day] || (analytics.days[day] = { views: 0, visitors: {} });
  d.views++;
  d.visitors[visitorHash(clientIp(req))] = 1;
  // Keep only the most recent 60 days.
  const keys = Object.keys(analytics.days).sort();
  while (keys.length > 60) delete analytics.days[keys.shift()];
  analyticsDirty = true;
}

function recordArticleView(slug) {
  if (!slug) return;
  analytics.articles[slug] = (analytics.articles[slug] || 0) + 1;
  analyticsDirty = true;
}

function buildInsights() {
  const days = analytics.days || {};
  const uniquesOf = (d) => (d && d.visitors ? Object.keys(d.visitors).length : 0);
  const today = todayStr();
  const last = (n) => {
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const dt = new Date(); dt.setDate(dt.getDate() - i);
      const key = dt.toISOString().slice(0, 10);
      const d = days[key];
      out.push({ date: key, views: d ? d.views : 0, uniques: uniquesOf(d) });
    }
    return out;
  };
  const last7 = last(7);
  const last30 = last(30);
  const sum = (arr, k) => arr.reduce((s, x) => s + x[k], 0);
  // unique visitors over 30 days (union of daily hashes)
  const union = new Set();
  last30.forEach((x) => { const d = days[x.date]; if (d && d.visitors) Object.keys(d.visitors).forEach((h) => union.add(h)); });

  const topPages = Object.entries(analytics.pages || {}).map(([p, c]) => ({ path: p, count: c }))
    .sort((a, b) => b.count - a.count).slice(0, 6);

  let articleTitles = {};
  try { readArticles().forEach((a) => { if (a && a.slug) articleTitles[a.slug] = a.title; }); } catch { /* ignore */ }
  const topArticles = Object.entries(analytics.articles || {}).map(([slug, c]) => ({ slug, title: articleTitles[slug] || slug, count: c }))
    .sort((a, b) => b.count - a.count).slice(0, 6);

  let content = {};
  try {
    const cj = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
    content = {
      publikasi: (cj.publications && cj.publications.items || []).length,
      penelitian: (cj.penelitian && cj.penelitian.items || []).length,
      pengabdian: (cj.pengabdian && cj.pengabdian.items || []).length,
      hki: (cj.hki && cj.hki.items || []).length
    };
  } catch { /* ignore */ }
  let articlesCount = 0;
  try { articlesCount = readArticles().length; } catch { /* ignore */ }

  return {
    totalViews: analytics.totalViews || 0,
    today: { views: (days[today] ? days[today].views : 0), uniques: uniquesOf(days[today]) },
    last7,
    last30Views: sum(last30, 'views'),
    last30Uniques: union.size,
    topPages,
    topArticles,
    content,
    articlesCount
  };
}

const _flush = setInterval(flushAnalytics, 10000);
if (_flush.unref) _flush.unref();
process.on('SIGINT', () => { flushAnalytics(); process.exit(0); });
process.on('SIGTERM', () => { flushAnalytics(); process.exit(0); });

// ---- Google Scholar sync ------------------------------------------------
function fetchScholarPage(scholarUrl, cstart) {
  return new Promise((resolve, reject) => {
    let u;
    try { u = new URL(scholarUrl); } catch { return reject(new Error('URL Google Scholar tidak valid')); }
    u.searchParams.set('cstart', String(cstart || 0));
    u.searchParams.set('pagesize', '100');
    const opts = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'id,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml'
      }
    };
    https.get(u, opts, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        r.resume();
        return fetchScholarPage(r.headers.location, cstart).then(resolve, reject);
      }
      if (r.statusCode !== 200) { r.resume(); return reject(new Error('Google Scholar menolak permintaan (kode ' + r.statusCode + ')')); }
      let html = '';
      r.setEncoding('utf8');
      r.on('data', (c) => (html += c));
      r.on('end', () => resolve(html));
    }).on('error', (e) => reject(new Error('Gagal menghubungi Google Scholar: ' + e.message)));
  });
}

async function fetchScholar(scholarUrl) {
  let header = null;
  let all = [];
  for (let cstart = 0; cstart <= 900; cstart += 100) {
    const html = await fetchScholarPage(scholarUrl, cstart);
    const parsed = parseScholar(html);
    if (header === null) header = { citations: parsed.citations, hindex: parsed.hindex, i10: parsed.i10 };
    all = all.concat(parsed.publications);
    if (parsed.publications.length < 100) break;
  }
  return { ...(header || { citations: 0, hindex: 0, i10: 0 }), count: all.length, publications: all };
}

function decodeEntities(s) {
  return String(s)
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&hellip;/g, '…').replace(/&nbsp;/g, ' ');
}

function parseScholar(html) {
  const nums = [...html.matchAll(/gsc_rsb_std[^>]*>([\d,]+)</g)].map((m) => Number(m[1].replace(/,/g, '')));
  if (!nums.length) throw new Error('Tidak dapat membaca data Scholar (mungkin diblokir sementara). Coba lagi nanti.');
  const citations = nums[0] || 0;
  const hindex = nums[2] || 0;
  const i10 = nums[4] || 0;
  const publications = [];
  const rowRe = /<tr class="gsc_a_tr">([\s\S]*?)<\/tr>/g;
  let m;
  while ((m = rowRe.exec(html))) {
    const row = m[1];
    const title = (/class="gsc_a_at"[^>]*>([^<]+)</.exec(row) || [])[1];
    if (!title) continue;
    const grays = [...row.matchAll(/class="gs_gray"[^>]*>([^<]*)</g)].map((x) => x[1].trim());
    const year = (/class="gsc_a_h[^"]*"[^>]*>\s*(\d{4})/.exec(row) || [])[1] || '';
    const cites = (/class="gsc_a_ac[^"]*"[^>]*>\s*(\d+)/.exec(row) || [])[1] || '';
    publications.push({
      title: decodeEntities(title),
      authors: decodeEntities(grays[0] || ''),
      venue: decodeEntities(grays[1] || ''),
      year, cites
    });
  }
  return { citations, hindex, i10, count: publications.length, publications };
}

// Fetch from Scholar and write results into content.json. Shared by the
// admin endpoint and the background auto-sync.
async function syncScholarToContent() {
  const data = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
  const pub = data.publications || {};
  const scholarUrl = pub.scholarUrl || '';
  if (!scholarUrl) { const e = new Error('URL Google Scholar belum diisi (Admin → Publikasi)'); e.code = 'NO_URL'; throw e; }
  const result = await fetchScholar(scholarUrl);
  const ss = pub.stats || [];
  if (ss[0]) ss[0].value = String(result.count);
  if (ss[1]) ss[1].value = String(result.citations);
  if (ss[2]) ss[2].value = String(result.hindex);
  const hs = (data.hero && data.hero.stats) || [];
  if (hs[0]) hs[0].value = String(result.count);
  if (hs[1]) hs[1].value = String(result.citations);
  if (hs[2]) hs[2].value = String(result.hindex);
  pub.items = (result.publications || []).map((p) => {
    const bits = [p.venue, p.year].filter(Boolean).join(', ');
    const cite = p.cites ? ' · ' + p.cites + ' sitasi' : '';
    return { title: p.title, venue: (bits + cite).trim().replace(/^,\s*/, ''), year: p.year || '', link: scholarUrl };
  });
  data.publications = pub;
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2));
  return { count: result.count, citations: result.citations, hindex: result.hindex };
}

// ---- API -----------------------------------------------------------------
async function handleApi(req, res, url) {
  const route = url.pathname;

  if (route === '/api/login' && req.method === 'POST') {
    const ip = clientIp(req);
    if (loginLocked(ip)) return sendJSON(res, 429, { ok: false, error: 'Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.' });
    const body = JSON.parse((await readBody(req, 16 * 1024)).toString('utf8') || '{}');
    if (verifyPassword(String(body.password || ''))) {
      loginReset(ip);
      return sendJSON(res, 200, { ok: true, token: issueToken() });
    }
    loginFail(ip);
    return sendJSON(res, 401, { ok: false, error: 'Kata sandi salah' });
  }

  if (route === '/api/session' && req.method === 'GET') {
    return sendJSON(res, validToken(req) ? 200 : 401, { ok: validToken(req) });
  }

  if (route === '/api/insights' && req.method === 'GET') {
    if (!validToken(req)) return sendJSON(res, 401, { ok: false, error: 'Tidak berwenang' });
    return sendJSON(res, 200, { ok: true, ...buildInsights() });
  }

  if (route === '/api/content' && req.method === 'GET') {
    const raw = fs.readFileSync(CONTENT_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
    return res.end(raw);
  }

  if (route === '/api/content' && req.method === 'POST') {
    if (!validToken(req)) return sendJSON(res, 401, { ok: false, error: 'Tidak berwenang' });
    const body = (await readBody(req, 8 * 1024 * 1024)).toString('utf8');
    let parsed;
    try { parsed = JSON.parse(body); } catch { return sendJSON(res, 400, { ok: false, error: 'JSON tidak valid' }); }
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(parsed, null, 2));
    return sendJSON(res, 200, { ok: true });
  }

  if (route === '/api/password' && req.method === 'POST') {
    if (!validToken(req)) return sendJSON(res, 401, { ok: false, error: 'Tidak berwenang' });
    const body = JSON.parse((await readBody(req, 16 * 1024)).toString('utf8') || '{}');
    const current = String(body.current || '');
    const next = String(body.next || '');
    if (!verifyPassword(current)) return sendJSON(res, 400, { ok: false, error: 'Kata sandi saat ini salah' });
    if (next.length < 6) return sendJSON(res, 400, { ok: false, error: 'Kata sandi baru minimal 6 karakter' });
    setPassword(next);
    return sendJSON(res, 200, { ok: true });
  }

  if (route === '/api/upload' && req.method === 'POST') {
    if (!validToken(req)) return sendJSON(res, 401, { ok: false, error: 'Tidak berwenang' });
    const body = JSON.parse((await readBody(req, 20 * 1024 * 1024)).toString('utf8') || '{}');
    const dataUrl = String(body.dataUrl || '');
    const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!m) return sendJSON(res, 400, { ok: false, error: 'Berkas tidak valid' });
    const mime = m[1];
    const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp' }[mime];
    if (!ext) return sendJSON(res, 400, { ok: false, error: 'Format gambar tidak didukung (hanya JPG/PNG/GIF/WEBP)' });
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 10 * 1024 * 1024) return sendJSON(res, 400, { ok: false, error: 'Ukuran maksimal 10MB' });
    if (!isValidImage(mime, buf)) return sendJSON(res, 400, { ok: false, error: 'Berkas bukan gambar yang sah' });
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const name = 'foto-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex') + ext;
    fs.writeFileSync(path.join(UPLOADS_DIR, name), buf);
    return sendJSON(res, 200, { ok: true, path: 'uploads/' + name });
  }

  // ---- Articles ----
  if (route === '/api/articles' && req.method === 'GET') {
    const all = readArticles();
    const isAdmin = validToken(req);
    const list = (isAdmin ? all : all.filter((a) => a && a.published !== false))
      .map((a) => (isAdmin ? a : stripBody(a)))
      .sort((x, y) => String(y.date || '').localeCompare(String(x.date || '')));
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
    return res.end(JSON.stringify(list));
  }

  if (route === '/api/article' && req.method === 'GET') {
    const slug = url.searchParams.get('slug');
    const found = readArticles().find((a) => a && a.slug === slug);
    if (!found) return sendJSON(res, 404, { ok: false, error: 'Tulisan tidak ditemukan' });
    if (found.published === false && !validToken(req)) return sendJSON(res, 404, { ok: false, error: 'Tulisan tidak ditemukan' });
    if (found.published !== false && !validToken(req)) recordArticleView(found.slug);
    return sendJSON(res, 200, found);
  }

  if (route === '/api/article' && req.method === 'POST') {
    if (!validToken(req)) return sendJSON(res, 401, { ok: false, error: 'Tidak berwenang' });
    let body;
    try { body = JSON.parse((await readBody(req, 5 * 1024 * 1024)).toString('utf8') || '{}'); }
    catch { return sendJSON(res, 400, { ok: false, error: 'JSON tidak valid' }); }
    const all = readArticles();
    const now = new Date().toISOString();
    let art = all.find((a) => a && a.id === body.id);
    if (!art) {
      art = { id: 'a' + Date.now().toString(36) + crypto.randomBytes(2).toString('hex'), createdAt: now };
      all.push(art);
    }
    art.title = String(body.title || 'Tanpa Judul');
    art.slug = ensureUniqueSlug(all, art, body.slug || body.title);
    art.category = String(body.category || 'Opini');
    art.excerpt = String(body.excerpt || '');
    art.cover = String(body.cover || '');
    art.bodyHtml = String(body.bodyHtml || '');
    art.date = String(body.date || art.date || now.slice(0, 10));
    art.readMinutes = estimateReadMinutes(body.bodyHtml || '');
    art.published = body.published !== false;
    art.updatedAt = now;
    writeArticles(all);
    return sendJSON(res, 200, { ok: true, article: art });
  }

  if (route === '/api/article/delete' && req.method === 'POST') {
    if (!validToken(req)) return sendJSON(res, 401, { ok: false, error: 'Tidak berwenang' });
    const body = JSON.parse((await readBody(req, 16 * 1024)).toString('utf8') || '{}');
    let all = readArticles();
    const before = all.length;
    all = all.filter((a) => a && a.id !== body.id);
    if (all.length === before) return sendJSON(res, 404, { ok: false, error: 'Tulisan tidak ditemukan' });
    writeArticles(all);
    return sendJSON(res, 200, { ok: true });
  }

  // ---- Sinkron Google Scholar ----
  if (route === '/api/scholar' && req.method === 'GET') {
    if (!validToken(req)) return sendJSON(res, 401, { ok: false, error: 'Tidak berwenang' });
    try {
      const r = await syncScholarToContent();
      return sendJSON(res, 200, { ok: true, ...r });
    } catch (e) {
      return sendJSON(res, e.code === 'NO_URL' ? 400 : 502, { ok: false, error: e.message });
    }
  }

  return sendJSON(res, 404, { ok: false, error: 'Not found' });
}

// ---- Static --------------------------------------------------------------
const DENY = new Set(['admin.config.json', 'server.js', '.gitignore', 'analytics.json']);

function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  // Uploaded files may live on a separate volume (UPLOADS_DIR).
  let base = ROOT, rel = pathname;
  if (pathname.startsWith('/uploads/')) { base = UPLOADS_DIR; rel = pathname.slice('/uploads/'.length); }
  const filePath = safeJoin(base, rel);
  if (!filePath || DENY.has(path.basename(filePath)) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 Not Found');
  }
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  // Count real page views (public HTML docs only; skip the admin panel).
  if (ext === '.html' && !path.basename(filePath).startsWith('admin')) {
    recordView(req, pathname === '/index.html' ? '/' : pathname);
  }
  const headers = { 'Content-Type': type };
  if (pathname.startsWith('/uploads/')) headers['Cache-Control'] = 'no-cache';
  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
}

// ---- Server --------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  try {
    applySecurity(res);
    const ip = clientIp(req);
    if (rateLimited(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8', 'Retry-After': '60' });
      return res.end(JSON.stringify({ ok: false, error: 'Terlalu banyak permintaan. Coba lagi sebentar.' }));
    }
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    return serveStatic(req, res, url);
  } catch (err) {
    sendJSON(res, 500, { ok: false, error: String(err.message || err) });
  }
});

loadConfig();
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  Portofolio Dosen berjalan di:`);
  console.log(`  → Lokal:    http://localhost:${PORT}`);
  console.log(`  → Admin:    http://localhost:${PORT}/admin.html`);
  console.log(`  (Kata sandi admin awal: admin123)\n`);
});

// Sinkron Google Scholar otomatis di latar belakang (saat mulai + tiap 12 jam).
function autoSyncScholar() {
  syncScholarToContent()
    .then((r) => console.log(`  [Scholar] Auto-sinkron: ${r.count} publikasi, ${r.citations} sitasi, h-index ${r.hindex}.`))
    .catch((e) => { if (e.code !== 'NO_URL') console.log('  [Scholar] Auto-sinkron dilewati: ' + e.message); });
}
setTimeout(autoSyncScholar, 8000);
setInterval(autoSyncScholar, 12 * 60 * 60 * 1000);
