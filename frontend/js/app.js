// UI layer: renders each role's screens from API data.
let role = 'Customer', tab = 'shop', cart = {}, q = '', cat = 'All', rxFile = '', user = null, meds = [];
const ROLES = ['Customer', 'Pharmacist', 'Admin', 'Delivery Partner'];
const TABS = { Customer: [['shop', 'Medicines'], ['cart', 'Cart'], ['orders', 'My orders'], ['help', 'Support']],
  Pharmacist: [['verify', 'Verification queue']], Admin: [['inv', 'Inventory'], ['rep', 'Sales report'], ['tix', 'Support tickets']],
  'Delivery Partner': [['del', 'Deliveries']] };
const STEPS = ['Confirmed', 'Packed', 'Shipped', 'Delivered'];
const $ = s => document.querySelector(s), g = id => $('#' + id) ? $('#' + id).value.trim() : '';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const toast = t => { const e = $('#toast'); e.textContent = t; e.classList.add('show'); setTimeout(() => e.classList.remove('show'), 2400); };
const M = id => meds.find(m => m.id == id);
const cartItems = () => Object.entries(cart).map(([id, n]) => ({ m: M(id), n })).filter(i => i.m);
const total = () => cartItems().reduce((s, i) => s + i.m.price * i.n, 0), needsRx = () => cartItems().some(i => i.m.rx);

const stat = o => o.state === 'Pending verification' ? '<span class="tag warn">Awaiting pharmacist</span>' : o.state === 'Rejected' ? '<span class="tag no">Rejected</span>' : `<span class="tag">${o.state}</span>`;
const steps = o => { const i = STEPS.indexOf(o.state); return i < 0 ? '' : '<div class="steps">' + STEPS.map((s, k) => `<span class="${k <= i ? 'done' : ''}">${s}</span>`).join('') + '</div>'; };
const ordCard = (o, extra = '') => `<div class="card" style="margin-bottom:10px"><b>Order #${o.id}</b> ${stat(o)} <span style="float:right;font-weight:800">₹${o.total}</span>
<div style="color:var(--mut);font-size:13px">${esc(o.customer)} · ${o.items.map(i => esc(i.name) + ' ×' + i.n).join(', ')} · ${o.pay} (${o.payStatus})</div>${steps(o)}${extra}</div>`;
const empty = t => `<div class="empty">${t}</div>`;

const SCREENS = {
  async shop() {
    meds = await api.medicines(q, cat); const all = await api.medicines(); const cats = ['All', ...new Set(all.map(m => m.cat))];
    return `<div class="row"><input id="q" placeholder="Search by name or brand" value="${esc(q)}"><select id="cat">${cats.map(c => `<option ${c === cat ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
    <div class="grid">${meds.map(m => `<div class="card med"><h3>${esc(m.name)}${m.rx ? '<span class="rx">Rx</span>' : ''}</h3><p>${esc(m.brand)} · ${esc(m.cat)}</p>
    <div class="price">₹${m.price}</div><p>${m.stock > 0 ? m.stock + ' in stock' : 'Out of stock'}</p><div style="margin-top:10px"><button class="btn" data-a="add" data-v="${m.id}" ${m.stock < 1 ? 'disabled' : ''}>Add to cart</button></div></div>`).join('') || empty('No medicines match your search.')}</div>`;
  },
  async cart() {
    meds = await api.medicines(); const it = cartItems(); if (!it.length) return empty('Your cart is empty. Search for a medicine to add it.');
    return `<div class="card scroll"><table><tr><th>Medicine</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr>${it.map(({ m, n }) => `<tr><td>${esc(m.name)}${m.rx ? '<span class="rx">Rx</span>' : ''}</td><td>₹${m.price}</td>
    <td><button class="btn alt" data-a="dec" data-v="${m.id}">−</button> ${n} <button class="btn alt" data-a="add" data-v="${m.id}">+</button></td><td>₹${m.price * n}</td><td><button class="btn alt" data-a="rm" data-v="${m.id}">Remove</button></td></tr>`).join('')}
    <tr><td colspan="3"><b>Total</b></td><td colspan="2"><b>₹${total()}</b></td></tr></table></div>
    <div class="card" style="margin-top:12px"><h2>Checkout</h2>${needsRx() ? `<div class="row"><div><label>Prescription required for Rx items (PDF/JPG/PNG)</label><input type="file" id="rx" accept=".pdf,.jpg,.jpeg,.png">${rxFile ? '<small>Attached: ' + esc(rxFile) + '</small>' : ''}</div></div>` : ''}
    <div class="row"><textarea id="addr" rows="2" placeholder="Delivery address"></textarea><select id="pay"><option>UPI</option><option>Debit Card</option><option>Credit Card</option><option>Net Banking</option><option>Cash on Delivery</option></select></div>
    <button class="btn" data-a="order">Pay and place order</button></div>`;
  },
  async orders() { const o = (await api.orders({ customer: user.name })).reverse(); return o.length ? o.map(x => ordCard(x, x.rx ? `<small>Prescription: ${esc(x.rx)}</small>` : '')).join('') : empty('No orders yet.'); },
  async help() {
    const t = await api.tickets(user.name);
    return `<div class="card"><h2>Raise a support ticket</h2><div class="row"><input id="tsub" placeholder="Subject"></div><div class="row"><textarea id="tmsg" rows="3" placeholder="Describe your issue"></textarea></div><button class="btn" data-a="ticket">Submit ticket</button></div>
    ${t.map(x => `<div class="card" style="margin-top:10px"><b>${esc(x.sub)}</b> <span class="tag">${x.status}</span><p style="margin:4px 0 0;color:var(--mut)">${esc(x.msg)}</p></div>`).join('')}`;
  },
  async verify() {
    const o = await api.orders({ state: 'Pending verification' });
    return o.length ? o.map(x => ordCard(x, `<small>Prescription file: ${esc(x.rx || 'none')}</small><div style="margin-top:8px"><button class="btn" data-a="appr" data-v="${x.id}">Approve</button> <button class="btn bad" data-a="rej" data-v="${x.id}">Reject</button></div>`)).join('') : empty('No prescriptions waiting for review.');
  },
  async inv() {
    meds = await api.medicines();
    return `<div class="card scroll"><table><tr><th>Medicine</th><th>Category</th><th>Price</th><th>Stock</th><th>Rx</th><th>Update stock</th><th></th></tr>${meds.map(m => `<tr><td>${esc(m.name)}</td><td>${esc(m.cat)}</td><td>₹${m.price}</td><td>${m.stock < 20 ? '<span class="tag no">' + m.stock + ' low</span>' : m.stock}</td><td>${m.rx ? 'Yes' : 'No'}</td>
    <td><input type="number" min="0" id="st${m.id}" value="${m.stock}" style="width:80px"> <button class="btn alt" data-a="stock" data-v="${m.id}">Save</button></td><td><button class="btn alt" data-a="delmed" data-v="${m.id}">Delete</button></td></tr>`).join('')}</table></div>
    <div class="card" style="margin-top:12px"><h2>Add medicine</h2><div class="row"><input id="nn" placeholder="Name"><input id="nb" placeholder="Brand"><input id="nc" placeholder="Category"></div>
    <div class="row"><input id="np" type="number" min="1" placeholder="Price ₹"><input id="ns" type="number" min="0" placeholder="Stock"><select id="nr"><option value="0">No prescription</option><option value="1">Prescription required</option></select></div><button class="btn" data-a="addmed">Add medicine</button></div>`;
  },
  async rep() {
    const r = await api.report();
    return `<div class="stats"><div class="card"><b>₹${r.revenue}</b>Revenue</div><div class="card"><b>${r.orders}</b>Orders fulfilled or active</div><div class="card"><b>${r.pending}</b>Awaiting verification</div><div class="card"><b>${r.lowStock}</b>Low-stock items</div></div>
    <div class="card"><h2>Top-selling medicines</h2>${r.top.length ? '<table>' + r.top.map(t => `<tr><td>${esc(t.name)}</td><td>${t.units} units</td></tr>`).join('') + '</table>' : empty('No sales yet. Place an order as a customer.')}</div>`;
  },
  async tix() {
    const t = await api.tickets();
    return t.length ? t.map(x => `<div class="card" style="margin-bottom:10px"><b>${esc(x.sub)}</b> <span class="tag">${x.status}</span><p style="margin:4px 0;color:var(--mut)">${esc(x.by)}: ${esc(x.msg)}</p>${x.status === 'Open' ? `<button class="btn alt" data-a="close" data-v="${x.id}">Mark resolved</button>` : ''}</div>`).join('') : empty('No support tickets.');
  },
  async del() {
    const o = (await api.orders()).filter(o => STEPS.includes(o.state) && o.state !== 'Delivered');
    return o.length ? o.map(x => ordCard(x, `<button class="btn" data-a="next" data-v="${x.id}">Mark as ${STEPS[STEPS.indexOf(x.state) + 1]}</button>`)).join('') : empty('No orders to deliver right now.');
  },
};

async function render() {
  $('#roles').innerHTML = ROLES.map(r => `<button class="${r === role ? 'on' : ''}" data-a="role" data-v="${r}">${r}</button>`).join('');
  let html;
  try {
    if (role === 'Customer' && !user) html = `<div class="card" style="max-width:380px;margin:30px auto"><h2>Sign in</h2><p style="color:var(--mut)">Register or log in to order medicines.</p>
      <div class="row"><input id="uname" placeholder="Full name"></div><div class="row"><input id="umob" placeholder="Mobile number" inputmode="numeric"></div><button class="btn" data-a="login">Register / Log in</button></div>`;
    else html = `<nav class="tabs">${TABS[role].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-a="tab" data-v="${k}">${l}${k === 'cart' && Object.keys(cart).length ? ' (' + Object.keys(cart).length + ')' : ''}</button>`).join('')}</nav>` + await SCREENS[tab]();
  } catch (e) { html = empty('Cannot reach the server. Start it with "npm start". ' + esc(e.message)); }
  const keep = document.activeElement && document.activeElement.id === 'q', v = keep ? $('#q').value : '';
  $('#app').innerHTML = html; if (keep) { const e = $('#q'); e.focus(); e.setSelectionRange(v.length, v.length); }
}
document.addEventListener('input', e => { if (e.target.id === 'q') { q = e.target.value; render(); } });
document.addEventListener('change', e => {
  if (e.target.id === 'cat') { cat = e.target.value; render(); }
  if (e.target.id === 'rx') { rxFile = e.target.files[0] ? e.target.files[0].name : ''; render(); }
});
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a, v = b.dataset.v;
  try {
    if (a === 'role') { role = v; tab = TABS[v][0][0]; }
    else if (a === 'tab') tab = v;
    else if (a === 'login') { user = await api.login({ name: g('uname'), mobile: g('umob') }); tab = 'shop'; }
    else if (a === 'add') { const m = M(v); if ((cart[v] || 0) >= m.stock) throw new Error('Only ' + m.stock + ' in stock'); cart[v] = (cart[v] || 0) + 1; toast(m.name + ' added to cart'); }
    else if (a === 'dec') { if (--cart[v] < 1) delete cart[v]; }
    else if (a === 'rm') delete cart[v];
    else if (a === 'order') {
      if (needsRx() && !rxFile) throw new Error('Upload a prescription for Rx medicines');
      await api.placeOrder({ customer: user.name, addr: g('addr'), pay: g('pay'), rx: rxFile, items: Object.entries(cart).map(([id, n]) => ({ id: +id, n })) });
      cart = {}; rxFile = ''; tab = 'orders'; toast('Order placed');
    }
    else if (a === 'appr') { await api.orderAction(v, 'approve'); toast('Order approved'); }
    else if (a === 'rej') { await api.orderAction(v, 'reject'); toast('Order rejected, stock restored'); }
    else if (a === 'next') { await api.orderAction(v, 'next'); toast('Status updated'); }
    else if (a === 'ticket') { await api.createTicket({ by: user.name, sub: g('tsub'), msg: g('tmsg') }); toast('Ticket submitted'); }
    else if (a === 'close') await api.resolveTicket(v);
    else if (a === 'stock') { await api.setStock(v, g('st' + v)); toast('Stock updated'); }
    else if (a === 'delmed') { await api.deleteMedicine(v); delete cart[v]; toast('Medicine deleted'); }
    else if (a === 'addmed') { await api.addMedicine({ name: g('nn'), brand: g('nb'), cat: g('nc'), price: g('np'), stock: g('ns'), rx: g('nr') === '1' }); toast('Medicine added'); }
  } catch (err) { toast(err.message); }
  render();
});
render();
