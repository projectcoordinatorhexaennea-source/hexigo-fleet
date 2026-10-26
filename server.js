'use strict';
// HEXIGO Telematics Backend: Flespi vehicle telemetry proxy with robust IPv4 transport
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Minimal .env loader
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach((l) => {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch (e) {}

const TOKEN = process.env.FLESPI_TOKEN;
const BASE = (process.env.FLESPI_BASE || 'https://flespi.io').replace(/\/$/, '');
const PORT = Number(process.env.PORT) || 3000;
const PASSWORD = process.env.DASHBOARD_PASSWORD || '';
const PUBLIC = path.join(__dirname, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json'
};

if (!TOKEN) {
  console.error('Missing FLESPI_TOKEN. Copy .env.example to .env and set it.');
  process.exit(1);
}

// Resilient IPv4 DNS Lookup for flespi.io to prevent Windows IPv6 DNS timeouts
const FLESPI_IPS = ['185.213.2.20', '185.213.2.120'];
let ipIndex = 0;

function flespiLookup(hostname, options, callback) {
  if (typeof options === 'function') { callback = options; options = {}; }
  const ip = FLESPI_IPS[ipIndex % FLESPI_IPS.length];
  if (options && options.all) {
    callback(null, FLESPI_IPS.map(addr => ({ address: addr, family: 4 })));
  } else {
    callback(null, ip, 4);
  }
}

function requestFlespi(pathAndQuery) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'flespi.io',
      port: 443,
      path: pathAndQuery,
      method: 'GET',
      headers: {
        Authorization: 'FlespiToken ' + TOKEN,
        Accept: 'application/json'
      },
      lookup: flespiLookup,
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let body;
        try { body = JSON.parse(data); } catch (e) { body = { errors: [{ reason: data.slice(0, 200) }] }; }
        if (res.statusCode >= 400) {
          const reason = (body.errors && body.errors[0] && body.errors[0].reason) || res.statusMessage;
          const err = new Error(reason);
          err.status = res.statusCode;
          return reject(err);
        }
        resolve(body);
      });
    });

    req.on('timeout', () => {
      req.destroy();
      ipIndex++;
      reject(new Error('Flespi request timed out'));
    });

    req.on('error', (err) => {
      ipIndex++;
      reject(err);
    });

    req.end();
  });
}

const cache = new Map();
async function flespi(pathAndQuery, ttl = 3000) {
  const hit = cache.get(pathAndQuery);
  if (hit && Date.now() - hit.t < ttl) return hit.body;
  try {
    const body = await requestFlespi(pathAndQuery);
    cache.set(pathAndQuery, { t: Date.now(), body });
    if (cache.size > 200) cache.delete(cache.keys().next().value);
    return body;
  } catch (err) {
    console.error('Flespi proxy note:', err.message);
    if (hit) return hit.body;
    throw err;
  }
}

const send = (res, code, obj) => {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache'
  });
  res.end(JSON.stringify(obj));
};

const validId = (s) => /^(all|\d+(,\d+)*)$/.test(s);

function authorised(req) {
  if (!PASSWORD) return true;
  const h = req.headers.authorization || '';
  if (!h.startsWith('Basic ')) return false;
  const pass = Buffer.from(h.slice(6), 'base64').toString().split(':').slice(1).join(':');
  return pass === PASSWORD;
}

async function api(req, res, url) {
  const p = url.pathname;
  let m;
  try {
    if (p === '/api/health') return send(res, 200, { ok: true, flespi_ips: FLESPI_IPS });

    if (p === '/api/devices') {
      const b = await flespi('/gw/devices/all?fields=id,name,device_type_id,telemetry', 2000);
      return send(res, 200, b);
    }

    if (p === '/api/channels') {
      return send(res, 200, await flespi('/gw/channels/all?fields=id,name,protocol_name,enabled', 5000));
    }

    if ((m = p.match(/^\/api\/devices\/([^/]+)\/telemetry$/)) && validId(m[1])) {
      return send(res, 200, await flespi('/gw/devices/' + m[1] + '/telemetry/all', 2000));
    }

    if ((m = p.match(/^\/api\/devices\/(\d+)\/messages$/))) {
      const count = Math.min(Math.max(parseInt(url.searchParams.get('count'), 10) || 150, 1), 1000);
      const q = { count, reverse: true };
      const from = parseInt(url.searchParams.get('from'), 10), to = parseInt(url.searchParams.get('to'), 10);
      if (from) q.from = from;
      if (to) q.to = to;
      const data = encodeURIComponent(JSON.stringify(q));
      return send(res, 200, await flespi('/gw/devices/' + m[1] + '/messages?data=' + data, 3000));
    }

    if (p === '/api/raw') {
      const target = url.searchParams.get('path') || '';
      if (!/^\/gw\/[A-Za-z0-9/_,.:-]*$/.test(target)) return send(res, 400, { error: 'path must start with /gw/' });
      const data = url.searchParams.get('data');
      return send(res, 200, await flespi(target + (data ? '?data=' + encodeURIComponent(data) : '')));
    }

    return send(res, 404, { error: 'Not found' });
  } catch (e) {
    return send(res, e.status || 502, { error: e.message || 'Upstream error' });
  }
}

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (!authorised(req)) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="HEXIGO"' });
    return res.end('Authentication required');
  }

  const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  if (req.method !== 'GET') { res.writeHead(405); return res.end(); }
  if (url.pathname.startsWith('/api/')) return api(req, res, url);

  let file = path.normalize(path.join(PUBLIC, url.pathname === '/' ? 'index.html' : url.pathname));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }

  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(PORT, '0.0.0.0', () => console.log('HEXIGO running on http://0.0.0.0:' + PORT));
