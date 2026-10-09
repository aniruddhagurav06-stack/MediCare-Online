const { load, save, fail } = require('./db');
const inventory = require('./inventoryService'), payment = require('./paymentService');
const STEPS = ['Confirmed', 'Packed', 'Shipped', 'Delivered'];
exports.STEPS = STEPS;
exports.place = b => {
  if (!b.customer) throw fail(401, 'Please log in first');
  if (!b.addr) throw fail(400, 'Delivery address is required');
  if (!Array.isArray(b.items) || !b.items.length) throw fail(400, 'Cart is empty');
  const d = load(), items = inventory.reserve(d, b.items);   // not saved unless every step succeeds
  const needsRx = items.some(i => i.rx);
  if (needsRx && !b.rx) throw fail(400, 'Upload a prescription for Rx medicines');
  const total = items.reduce((s, i) => s + i.price * i.n, 0);
  const pay = payment.process(b.pay, total); if (!pay.ok) throw fail(400, pay.message);
  const o = { id: d.nid++, customer: b.customer, addr: b.addr, pay: b.pay, payStatus: pay.status, txnId: pay.txnId, total,
    rx: needsRx ? b.rx : '', state: needsRx ? 'Pending verification' : 'Confirmed', items };
  d.orders.push(o); save(d); return o;
};
exports.list = ({ customer, state } = {}) => load().orders.filter(o => (!customer || o.customer === customer) && (!state || o.state === state));
exports.act = (id, action) => {
  const d = load(), o = d.orders.find(o => o.id == id); if (!o) throw fail(404, 'Order not found');
  if (action === 'approve' && o.state === 'Pending verification') o.state = 'Confirmed';
  else if (action === 'reject' && o.state === 'Pending verification') { o.state = 'Rejected'; inventory.release(d, o.items); }
  else if (action === 'next' && STEPS.includes(o.state) && o.state !== 'Delivered') o.state = STEPS[STEPS.indexOf(o.state) + 1];
  else throw fail(409, `Cannot ${action} an order that is ${o.state}`);
  save(d); return o;
};
