// Thin client for the backend REST API.
async function call(method, url, body) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'Request failed');
  return j;
}
const qs = o => '?' + new URLSearchParams(o).toString();
const api = {
  login: b => call('POST', '/api/auth/login', b),
  medicines: (q = '', cat = 'All') => call('GET', '/api/medicines' + qs({ q, cat })),
  addMedicine: b => call('POST', '/api/medicines', b),
  setStock: (id, stock) => call('PATCH', '/api/medicines/' + id, { stock }),
  deleteMedicine: id => call('DELETE', '/api/medicines/' + id),
  orders: (f = {}) => call('GET', '/api/orders' + qs(f)),
  placeOrder: b => call('POST', '/api/orders', b),
  orderAction: (id, action) => call('PATCH', '/api/orders/' + id, { action }),
  report: () => call('GET', '/api/report'),
  tickets: (by = '') => call('GET', '/api/tickets' + qs(by ? { by } : {})),
  createTicket: b => call('POST', '/api/tickets', b),
  resolveTicket: id => call('PATCH', '/api/tickets/' + id),
};
