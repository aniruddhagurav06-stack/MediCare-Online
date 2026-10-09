const { load, save, fail } = require('./db');
exports.list = (q = '', cat = 'All') => load().meds.filter(m =>
  (cat === 'All' || m.cat === cat) && (m.name + m.brand).toLowerCase().includes(q.toLowerCase()));
exports.add = b => {
  if (!b.name || !(+b.price > 0)) throw fail(400, 'Name and price are required');
  const d = load(), m = { id: Date.now(), name: b.name, brand: b.brand || '-', cat: b.cat || 'General', price: +b.price, stock: +b.stock || 0, rx: !!b.rx };
  d.meds.push(m); save(d); return m;
};
exports.setStock = (id, stock) => {
  const d = load(), m = d.meds.find(m => m.id == id); if (!m) throw fail(404, 'Medicine not found');
  m.stock = Math.max(0, +stock || 0); save(d); return m;
};
exports.remove = id => { const d = load(); d.meds = d.meds.filter(m => m.id != id); save(d); return { ok: true }; };
// Used by orderService: deduct stock in memory, or throw if any item is short.
exports.reserve = (d, items) => items.map(i => {
  const m = d.meds.find(m => m.id == i.id); if (!m) throw fail(404, 'Medicine not found');
  if (!(i.n >= 1) || m.stock < i.n) throw fail(409, `Only ${m.stock} of ${m.name} in stock`);
  m.stock -= i.n; return { id: m.id, name: m.name, price: m.price, n: i.n, rx: m.rx };
});
exports.release = (d, items) => items.forEach(i => { const m = d.meds.find(m => m.id == i.id); if (m) m.stock += i.n; });
