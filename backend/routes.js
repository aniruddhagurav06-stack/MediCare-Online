// Maps HTTP routes to service calls. No business logic lives here.
const { fail } = require('../services/db');
const auth = require('../services/authService'), inv = require('../services/inventoryService'),
  orders = require('../services/orderService'), report = require('../services/reportService'), support = require('../services/supportService');
const R = [
  ['POST', '/api/auth/login', ({ body }) => auth.login(body)],
  ['GET', '/api/medicines', ({ query }) => inv.list(query.q, query.cat)],
  ['POST', '/api/medicines', ({ body }) => inv.add(body)],
  ['PATCH', '/api/medicines/:id', ({ p, body }) => inv.setStock(p.id, body.stock)],
  ['DELETE', '/api/medicines/:id', ({ p }) => inv.remove(p.id)],
  ['GET', '/api/orders', ({ query }) => orders.list(query)],
  ['POST', '/api/orders', ({ body }) => orders.place(body)],
  ['PATCH', '/api/orders/:id', ({ p, body }) => orders.act(p.id, body.action)],
  ['GET', '/api/report', () => report.summary()],
  ['GET', '/api/tickets', ({ query }) => support.list(query.by)],
  ['POST', '/api/tickets', ({ body }) => support.create(body)],
  ['PATCH', '/api/tickets/:id', ({ p }) => support.resolve(p.id)],
];
module.exports = (method, path, query, body) => {
  const seg = path.split('/');
  for (const [m, pat, fn] of R) {
    const ps = pat.split('/'); if (m !== method || ps.length !== seg.length) continue;
    const p = {};
    if (ps.every((s, i) => s[0] === ':' ? (p[s.slice(1)] = seg[i], true) : s === seg[i])) return fn({ p, query, body });
  }
  throw fail(404, 'Route not found');
};
