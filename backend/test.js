// Run with: npm test  (uses a temporary copy of the database)
const assert = require('assert'), fs = require('fs'), f = require('path').join(__dirname, 'data', 'db.json');
const had = fs.existsSync(f) ? fs.readFileSync(f) : null; if (had) fs.unlinkSync(f);
const inv = require('../services/inventoryService'), ord = require('../services/orderService'), rep = require('../services/reportService');
try {
  const o1 = ord.place({ customer: 'Test', addr: 'X', pay: 'UPI', items: [{ id: 1, n: 2 }] });
  assert.equal(o1.state, 'Confirmed'); assert.equal(o1.total, 60); assert.equal(inv.list('para')[0].stock, 118);
  assert.throws(() => ord.place({ customer: 'Test', addr: 'X', pay: 'UPI', items: [{ id: 5, n: 1 }] }), /prescription/);
  assert.equal(inv.list('amox')[0].stock, 40, 'failed order must not change stock');
  const o2 = ord.place({ customer: 'Test', addr: 'X', pay: 'Cash on Delivery', rx: 'rx.pdf', items: [{ id: 5, n: 3 }] });
  assert.equal(o2.state, 'Pending verification'); assert.equal(inv.list('amox')[0].stock, 37);
  ord.act(o2.id, 'reject'); assert.equal(inv.list('amox')[0].stock, 40, 'reject restores stock');
  assert.throws(() => ord.place({ customer: 'T', addr: 'X', pay: 'UPI', items: [{ id: 8, n: 99 }] }), /in stock/);
  ['next', 'next', 'next'].forEach(a => ord.act(o1.id, a)); assert.equal(ord.list({ customer: 'Test' })[0].state, 'Delivered');
  assert.throws(() => ord.act(o1.id, 'next'));
  assert.equal(rep.summary().revenue, 60);
  console.log('All backend tests passed');
} finally { if (fs.existsSync(f)) fs.unlinkSync(f); if (had) fs.writeFileSync(f, had); }
