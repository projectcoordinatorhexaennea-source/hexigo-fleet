'use strict';
// Run from the RoadWatch (or backend) folder:  node check-token.js
// Checks the token in .env against flespi without printing the full token.
const fs = require('fs');
const path = require('path');

let env = {};
for (const dir of [process.cwd(), __dirname]) {
  try {
    fs.readFileSync(path.join(dir, '.env'), 'utf8').split(/\r?\n/).forEach((l) => {
      const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
    console.log('Read .env from', dir);
    break;
  } catch (e) { /* try next folder */ }
}
const token = env.FLESPI_TOKEN || process.env.FLESPI_TOKEN || '';
const base = (env.FLESPI_BASE || process.env.FLESPI_BASE || 'https://flespi.io').replace(/\/$/, '');

if (!token) { console.log('No FLESPI_TOKEN found. Create a .env file next to server.js with FLESPI_TOKEN=...'); process.exit(1); }
console.log('Token length:', token.length, '(flespi tokens are 64 characters)');
console.log('Token starts with', token.slice(0, 2) + '... and ends with ...' + token.slice(-4));
if (/\s/.test(token)) console.log('WARNING: the token contains a space or line break. Remove it.');
console.log('Server:', base, '\n');

async function call(p) {
  const res = await fetch(base + p, { headers: { Authorization: 'FlespiToken ' + token }, signal: AbortSignal.timeout(15000) });
  let body = {}; try { body = await res.json(); } catch (e) {}
  return { status: res.status, body };
}

(async () => {
  try {
    const a = await call('/auth/info');
    if (a.status !== 200) {
      console.log('1) Token check FAILED:', a.status, (a.body.errors && a.body.errors[0] && a.body.errors[0].reason) || '');
      console.log('   flespi does not accept this token. Copy it again from the panel (Tokens > copy icon) into .env.');
      return;
    }
    const t = (a.body.result || [])[0] || {};
    console.log('1) Token check OK. Type:', t.access && t.access.type, '| expires:', t.access && t.access.ttl ? 'TTL ' + t.access.ttl + 's' : 'not set');
    const d = await call('/gw/devices/all?fields=id,name');
    if (d.status === 200) console.log('2) Devices readable. Found', (d.body.result || []).length, 'device(s).');
    else console.log('2) Devices NOT readable:', d.status, (d.body.errors && d.body.errors[0] && d.body.errors[0].reason) || '',
      '\n   The token is valid but lacks permission. Add an ACL rule with read (GET) access to the gw module, or use a Master token.');
  } catch (e) {
    console.log('Could not reach flespi:', e.message, '\nCheck your internet connection, proxy or VPN.');
  }
})();
