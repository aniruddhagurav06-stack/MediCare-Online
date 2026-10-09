const { load } = require('./db');
exports.summary = () => {
  const d = load(), ok = d.orders.filter(o => !['Rejected', 'Pending verification'].includes(o.state)), sold = {};
  ok.forEach(o => o.items.forEach(i => sold[i.name] = (sold[i.name] || 0) + i.n));
  return { revenue: ok.reduce((s, o) => s + o.total, 0), orders: ok.length,
    pending: d.orders.filter(o => o.state === 'Pending verification').length,
    lowStock: d.meds.filter(m => m.stock < 20).length,
    top: Object.entries(sold).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, units]) => ({ name, units })) };
};
