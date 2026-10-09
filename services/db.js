// Tiny JSON-file "database" shared by all services.
const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '..', 'backend', 'data', 'db.json');
const seed = { nid: 1, users: [], orders: [], tickets: [], meds: [
  { id: 1, name: 'Paracetamol 500mg', brand: 'Crocin', cat: 'Pain & Fever', price: 30, stock: 120, rx: false },
  { id: 2, name: 'Cetirizine 10mg', brand: 'Okacet', cat: 'Allergy', price: 25, stock: 80, rx: false },
  { id: 3, name: 'ORS Sachet', brand: 'Electral', cat: 'Hydration', price: 22, stock: 200, rx: false },
  { id: 4, name: 'Vitamin C 500mg', brand: 'Celin', cat: 'Vitamins', price: 45, stock: 60, rx: false },
  { id: 5, name: 'Amoxicillin 500mg', brand: 'Mox', cat: 'Antibiotics', price: 110, stock: 40, rx: true },
  { id: 6, name: 'Metformin 500mg', brand: 'Glycomet', cat: 'Diabetes', price: 55, stock: 50, rx: true },
  { id: 7, name: 'Atorvastatin 10mg', brand: 'Atorva', cat: 'Heart', price: 95, stock: 35, rx: true },
  { id: 8, name: 'Digital Thermometer', brand: 'Omron', cat: 'Devices', price: 240, stock: 15, rx: false }] };
const load = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { return JSON.parse(JSON.stringify(seed)); } };
const save = d => { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); };
const fail = (status, message) => Object.assign(new Error(message), { status });
module.exports = { load, save, fail };
