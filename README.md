# 🏸 Badminton World

![Python](https://img.shields.io/badge/Python-3.10-blue.svg)
![Flask](https://img.shields.io/badge/Backend-Flask-black.svg?logo=flask)
![Vue.js](https://img.shields.io/badge/Frontend-Vue.js-4FC08D.svg?logo=vue.js)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg?logo=sqlite)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

**Badminton World** is a modern e-commerce platform built for badminton enthusiasts. It offers a seamless shopping experience, complete with product browsing, shopping cart, checkout flow, and an admin dashboard — all within a responsive, dynamic interface powered by Flask and Vue.js.

---

## ✨ Features

### 🛍️ Customer Experience
- Browse and search premium badminton gear
- Add products to cart and checkout securely
- View product details and track orders
- Responsive design for mobile and desktop

### 🧑‍💼 Admin Dashboard
- View key metrics: users, orders, revenue
- Add/edit/delete products
- Manage users and roles
- Monitor orders and update status
- View product analytics and user activity

---

## 🧰 Tech Stack

| Layer       | Technology     |
|-------------|----------------|
| Frontend    | Vue.js, HTML5, CSS3 |
| Backend     | Flask, Flask-CORS  |
| Database    | SQLite (Python's `sqlite3`) |
| Styling     | Google Fonts, Font Awesome |
| HTTP Client | Axios          |

---

## 🚀 Getting Started

### 🖥️ Backend Setup (Flask)


# Install dependencies
pip install flask flask-cors

# Run the backend server
python app.py

### project structure
badminton-world/
├── app.py                  # Backend: Flask application
├── badmintonworldapp.html # Frontend: Vue.js SPA
├── static/                 # Product images, logos, etc.
└── badminton_store.db      # SQLite DB (generated on first run)
