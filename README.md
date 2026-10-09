# MediCare Online – Mini Project

E-commerce software for medicines (Software Engineering, Experiments 1–5).

## Structure
```
medicare-online/
├── frontend/            Browser UI (HTML, CSS, JS) – calls the REST API
│   ├── index.html
│   ├── css/style.css
│   └── js/api.js, app.js
├── backend/             HTTP layer
│   ├── server.js        Node server: /api + serves frontend
│   ├── routes.js        URL -> service mapping
│   ├── test.js          Automated tests for the services
│   └── data/db.json     Created on first run
└── services/            Business logic (no HTTP code)
    ├── db.js            JSON-file storage + seed data
    ├── authService.js        registration / login
    ├── inventoryService.js   medicines, stock reserve/release
    ├── orderService.js       place order, Rx verification, tracking
    ├── paymentService.js     simulated payment gateway
    ├── reportService.js      sales report
    └── supportService.js     support tickets
```

## Run
Requires Node.js 18+ (no npm install needed).
```
npm start      # then open http://localhost:3000
npm test       # backend tests
```

## REST API
| Method | Path | Purpose |
|---|---|---|
| POST | /api/auth/login | Register / log in |
| GET/POST | /api/medicines | Search (q, cat) / add |
| PATCH/DELETE | /api/medicines/:id | Update stock / delete |
| GET/POST | /api/orders | List (customer, state) / place order |
| PATCH | /api/orders/:id | action = approve, reject, next |
| GET | /api/report | Sales report |
| GET/POST | /api/tickets, PATCH /api/tickets/:id | Support |

## Roles
Customer, Pharmacist (verifies prescriptions), Admin (inventory, reports, tickets), Delivery Partner (updates delivery status).
"# MediCare-Online" 
