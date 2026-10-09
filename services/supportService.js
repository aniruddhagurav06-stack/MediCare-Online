const { load, save, fail } = require('./db');
exports.list = by => load().tickets.filter(t => !by || t.by === by);
exports.create = b => {
  if (!b.by || !b.sub || !b.msg) throw fail(400, 'Subject and message are required');
  const d = load(), t = { id: Date.now(), by: b.by, sub: b.sub, msg: b.msg, status: 'Open' }; d.tickets.push(t); save(d); return t;
};
exports.resolve = id => { const d = load(), t = d.tickets.find(t => t.id == id); if (!t) throw fail(404, 'Ticket not found'); t.status = 'Resolved'; save(d); return t; };
