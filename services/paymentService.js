// Simulated payment gateway.
const METHODS = ['UPI', 'Debit Card', 'Credit Card', 'Net Banking', 'Cash on Delivery'];
exports.METHODS = METHODS;
exports.process = (method, amount) => {
  if (!METHODS.includes(method)) return { ok: false, message: 'Unsupported payment method' };
  return { ok: true, txnId: 'TXN' + Date.now(), status: method === 'Cash on Delivery' ? 'Pay on delivery' : 'Paid', amount };
};
