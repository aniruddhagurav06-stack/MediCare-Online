// Zero-dependency Node server: REST API under /api, static frontend for everything else.
const http = require('http'), fs = require('fs'), path = require('path'), { URL } = require('url');
const handle = require('./routes'), WEB = path.join(__dirname, '..', 'frontend'), PORT = process.env.PORT || 3000;
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
const send = (res, code, data) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname.startsWith('/api/')) {
    let raw = ''; req.on('data', c => raw += c);
    return req.on('end', () => {
      try { send(res, 200, handle(req.method, u.pathname, Object.fromEntries(u.searchParams), raw ? JSON.parse(raw) : {})); }
      catch (e) { send(res, e.status || 500, { error: e.message }); }
    });
  }
  const f = path.join(WEB, u.pathname === '/' ? 'index.html' : u.pathname);
  if (!f.startsWith(WEB) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'text/plain' }); fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log('MediCare Online running at http://localhost:' + PORT));
