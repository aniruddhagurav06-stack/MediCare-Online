const { load, save, fail } = require('./db');
exports.login = ({ name, mobile }) => {
  if (!name || !/^\d{10}$/.test(mobile || '')) throw fail(400, 'Enter a name and a 10-digit mobile number');
  const d = load(); let u = d.users.find(u => u.mobile === mobile);
  if (!u) { u = { name: name.trim(), mobile }; d.users.push(u); save(d); }
  return u;
};
