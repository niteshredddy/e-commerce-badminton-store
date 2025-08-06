const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize SQLite database
function initDb() {
    const db = new sqlite3.Database('badminton_store.db');
    
    // Create products table
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            description TEXT NOT NULL,
            image TEXT NOT NULL,
            weight INTEGER NOT NULL
        )
    `);

    // Create users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            isAdmin BOOLEAN NOT NULL,
            createdAt TEXT NOT NULL
        )
    `);

    // Create orders table
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY,
            customer TEXT NOT NULL,
            items TEXT NOT NULL,
            subtotal REAL NOT NULL,
            shipping REAL NOT NULL,
            tax REAL NOT NULL,
            total REAL NOT NULL,
            status TEXT NOT NULL,
            date TEXT NOT NULL
        )
    `);

    db.close();
}

// Migrate initial data to SQLite
function migrateData() {
    const db = new sqlite3.Database('badminton_store.db');

    // Products data
    const products = [
        [1, "Yonex Astrox 100ZZ", "rackets", 16399, 15, "Flagship racket with Rotational Generator System for maximum power, control, and maneuverability. Perfect for advanced players seeking power and precision in their offensive shots.", "/static/astrox_100zz.jpg", 83],
        [2, "Li-Ning Aeronaut 9000i", "rackets", 14150, 10, "Professional-grade racket with Carbon Fiber technology for excellent stability and control. Suitable for intermediate to advanced players looking for speed and precision.", "/static/aeronaut_9000i.jpg", 85],
        [3, "Yonex Mavis-350 Shuttlecocks", "shuttlecocks", 1200, 50, "Premium nylon shuttlecocks for tournament play. Consistent flight path and durability for competitive matches.", "/static/mavis_350.jpg", 5],
        [4, "Victor A960 Shoes", "footwear", 9265, 20, "Professional badminton shoes with enhanced cushioning and grip. Engineered for quick lateral movements and superior comfort during intense matches.", "/static/victor_a960.jpg", 320],
        [5, "Yonex Men's Team Polo", "apparel", 1399, 30, "Official team polo shirt with moisture-wicking fabric to keep you cool and dry during play. Modern fit for comfort and mobility.", "/static/team_polo.jpg", 180],
        [6, "Grip Tape Pro Pack", "accessories", 440, 100, "Set of 3 premium overgrips with superior absorption and tack. Extends the life of your racket handle and provides excellent grip during play.", "/static/grip_tape.jpg", 30],
        [7, "Hundred Dark Knight Racket", "rackets", 4500, 8, "All-round performance racket with advanced frame design. Perfect balance of power and control for versatile play styles.", "/static/dark_knight.jpg", 82],
        [8, "Li-Ning Number 7 Strings", "accessories", 800, 25, "Tournament-grade string with excellent tension maintenance. Provides optimal power and control for competitive players.", "/static/lining_strings.jpg", 10],
        [9, "Yonex Nanoflare speed 7", "rackets", 2500, 12, "High-performance racket designed for speed and agility. Features Sonic Flare System for rapid shot execution, ideal for defensive players.", "/static/nanoflare_7.jpg", 84],
        [10, "Li-Ning Turbo X 90", "rackets", 1790, 10, "Dynamic racket with AeroTec-Beam System for enhanced aerodynamics and power. Perfect for aggressive players seeking precision.", "/static/turbo_x90.jpg", 86],
        [11, "Yonex aerosena 50", "shuttlecocks", 2500, 40, "Premium feather shuttlecocks for professional play. Offers excellent flight stability and durability for high-level matches.", "/static/aerosena_50.jpg", 5],
        [12, "Hundred max shoes", "footwear", 2500, 60, "Professional badminton shoes with enhanced cushioning and grip. Engineered for quick lateral movements and superior comfort during intense matches.", "/static/hundred_beast.jpg", 20]
    ];

    // Users data
    const users = [
        [1, "Admin User", "admin@badmintonworld.com", "admin123", 1, "2025-01-01T00:00:00.000Z"],
        [2, "John Doe", "john@example.com", "password123", 0, "2025-02-15T00:00:00.000Z"],
        [3, "Jane Smith", "jane@example.com", "password123", 0, "2025-03-10T00:00:00.000Z"]
    ];

    // Orders data
    const orders = [
        [1001, JSON.stringify({"firstName": "John", "lastName": "Doe", "email": "john@example.com", "phone": "555-123-4567", "address": "123 Main St", "city": "Boston", "state": "MA", "zip": "02108"}),
         JSON.stringify([{"id": 1, "name": "Yonex Astrox 100ZZ", "price": 16399, "quantity": 1}, {"id": 3, "name": "Yonex Mavis-350 Shuttlecocks", "price": 1200, "quantity": 2}]),
         17599, 720, 1440, 19559, "delivered", "2025-05-01T10:30:00.000Z"],
        [1002, JSON.stringify({"firstName": "Jane", "lastName": "Smith", "email": "jane@example.com", "phone": "555-987-6543", "address": "456 Oak Ave", "city": "Chicago", "state": "IL", "zip": "60601"}),
         JSON.stringify([{"id": 2, "name": "Li-Ning Aeronaut 9000i", "price": 14150, "quantity": 1}, {"id": 6, "name": "Grip Tape Pro Pack", "price": 440, "quantity": 3}]),
         15370, 510, 1159, 16939, "processing", "2025-05-10T14:45:00.000Z"],
        [1003, JSON.stringify({"firstName": "Mike", "lastName": "Johnson", "email": "mike@example.com", "phone": "555-555-5555", "address": "789 Pine Blvd", "city": "Seattle", "state": "WA", "zip": "98101"}),
         JSON.stringify([{"id": 4, "name": "Victor A960 Shoes", "price": 9265, "quantity": 1}, {"id": 5, "name": "Yonex Men's Team Polo", "price": 1399, "quantity": 2}]),
         11963, 640, 957, 13360, "pending", "2025-05-15T09:15:00.000Z"],
        [1004, JSON.stringify({"firstName": "Alice", "lastName": "Brown", "email": "alice@example.com", "phone": "555-111-2222", "address": "321 Elm St", "city": "Los Angeles", "state": "CA", "zip": "90001"}),
         JSON.stringify([{"id": 7, "name": "Hundred Dark Knight Racket", "price": 4500, "quantity": 1}, {"id": 11, "name": "yonex aerosena 50", "price": 2500, "quantity": 3}]),
         12000, 600, 960, 13560, "shipped", "2025-05-20T12:00:00.000Z"],
        [1005, JSON.stringify({"firstName": "Robert", "lastName": "Wilson", "email": "robert@example.com", "phone": "555-333-4444", "address": "654 Maple Dr", "city": "Miami", "state": "FL", "zip": "33101"}),
         JSON.stringify([{"id": 9, "name": "Yonex Nanoflare speed 7", "price": 2500, "quantity": 2}, {"id": 8, "name": "Li-Ning Number 7 Strings", "price": 800, "quantity": 1}]),
         5800, 450, 464, 6714, "pending", "2025-05-25T15:20:00.000Z"],
        [1006, JSON.stringify({"firstName": "Emma", "lastName": "Davis", "email": "emma@example.com", "phone": "555-666-7777", "address": "987 Cedar Ln", "city": "New York", "state": "NY", "zip": "10001"}),
         JSON.stringify([{"id": 12, "name": "hundred max shoes", "price": 2500, "quantity": 1}, {"id": 5, "name": "Yonex Men's Team Polo", "price": 1399, "quantity": 1}, {"id": 6, "name": "Grip Tape Pro Pack", "price": 440, "quantity": 2}]),
         4779, 500, 382, 5661, "delivered", "2025-06-01T08:45:00.000Z"]
    ];

    // Check if tables are empty before inserting
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (!err && row.count === 0) {
            const stmt = db.prepare(`
                INSERT INTO products (id, name, category, price, stock, description, image, weight)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            products.forEach(product => stmt.run(product));
            stmt.finalize();
        }
    });

    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (!err && row.count === 0) {
            const stmt = db.prepare(`
                INSERT INTO users (id, name, email, password, isAdmin, createdAt)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            users.forEach(user => stmt.run(user));
            stmt.finalize();
        }
    });

    db.get("SELECT COUNT(*) as count FROM orders", (err, row) => {
        if (!err && row.count === 0) {
            const stmt = db.prepare(`
                INSERT INTO orders (id, customer, items, subtotal, shipping, tax, total, status, date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            orders.forEach(order => stmt.run(order));
            stmt.finalize();
        }
    });

    db.close();
}

// Helper functions
function findUserByEmail(email, callback) {
    const db = new sqlite3.Database('badminton_store.db');
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        db.close();
        callback(err, row);
    });
}

function findUserById(userId, callback) {
    const db = new sqlite3.Database('badminton_store.db');
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
        db.close();
        callback(err, row);
    });
}

function findProductById(productId, callback) {
    const db = new sqlite3.Database('badminton_store.db');
    db.get("SELECT * FROM products WHERE id = ?", [productId], (err, row) => {
        db.close();
        callback(err, row);
    });
}

// Initialize database and migrate data
initDb();
setTimeout(migrateData, 100); // Small delay to ensure tables are created

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pro', 'badmintonworldapp.html'));
});

app.get('/api/products', (req, res) => {
    const db = new sqlite3.Database('badminton_store.db');
    db.all("SELECT * FROM products", (err, rows) => {
        db.close();
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    findProductById(productId, (err, product) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: "Product not found" });
        }
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    findUserByEmail(email, (err, user) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (user && user.password === password) {
            const userData = { ...user };
            delete userData.password;
            res.json({ success: true, user: userData });
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    });
});

app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    findUserByEmail(email, (err, existingUser) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (existingUser) {
            res.status(400).json({ success: false, message: "Email already registered" });
        } else {
            const db = new sqlite3.Database('badminton_store.db');
            db.get("SELECT MAX(id) as maxId FROM users", (err, row) => {
                if (err) {
                    db.close();
                    res.status(500).json({ error: err.message });
                } else {
                    const newId = (row.maxId || 0) + 1;
                    const createdAt = new Date().toISOString();
                    db.run(`
                        INSERT INTO users (id, name, email, password, isAdmin, createdAt)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, [newId, name, email, password, 0, createdAt], function(err) {
                        db.close();
                        if (err) {
                            res.status(500).json({ error: err.message });
                        } else {
                            const userData = { id: newId, name, email, isAdmin: false, createdAt };
                            res.json({ success: true, user: userData });
                        }
                    });
                }
            });
        }
    });
});

app.get('/api/orders', (req, res) => {
    const db = new sqlite3.Database('badminton_store.db');
    db.all("SELECT * FROM orders", (err, rows) => {
        db.close();
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            const orders = rows.map(order => ({
                ...order,
                customer: JSON.parse(order.customer),
                items: JSON.parse(order.items)
            }));
            res.json(orders);
        }
    });
});

app.post('/api/orders', (req, res) => {
    const { customer, items, subtotal, shipping, tax, total } = req.body;
    if (!customer || !items) {
        return res.status(400).json({ success: false, message: "Invalid order data" });
    }

    const db = new sqlite3.Database('badminton_store.db');
    db.get("SELECT MAX(id) as maxId FROM orders", (err, row) => {
        if (err) {
            db.close();
            res.status(500).json({ error: err.message });
        } else {
            const newId = (row.maxId || 1000) + 1;
            const date = new Date().toISOString();
            db.run(`
                INSERT INTO orders (id, customer, items, subtotal, shipping, tax, total, status, date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [newId, JSON.stringify(customer), JSON.stringify(items), subtotal, shipping, tax, total, "pending", date], function(err) {
                db.close();
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    const newOrder = { id: newId, customer, items, subtotal, shipping, tax, total, status: "pending", date };
                    res.json({ success: true, order: newOrder });
                }
            });
        }
    });
});

app.get('/api/users', (req, res) => {
    const db = new sqlite3.Database('badminton_store.db');
    db.all("SELECT id, name, email, isAdmin, createdAt FROM users", (err, rows) => {
        db.close();
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.put('/api/users/:id/role', (req, res) => {
    const userId = req.params.id;
    const { isAdmin } = req.body;
    
    const db = new sqlite3.Database('badminton_store.db');
    db.run("UPDATE users SET isAdmin = ? WHERE id = ?", [isAdmin ? 1 : 0, userId], function(err) {
        if (err) {
            db.close();
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            db.close();
            res.status(404).json({ success: false, message: "User not found" });
        } else {
            db.get("SELECT id, name, email, isAdmin, createdAt FROM users WHERE id = ?", [userId], (err, user) => {
                db.close();
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json({ success: true, user });
                }
            });
        }
    });
});

app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    
    const db = new sqlite3.Database('badminton_store.db');
    db.run("DELETE FROM users WHERE id = ?", [userId], function(err) {
        db.close();
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ success: false, message: "User not found" });
        } else {
            res.json({ success: true });
        }
    });
});

app.get('/api/placeholder/:width/:height', (req, res) => {
    const { width, height } = req.params;
    res.json({ url: `https://via.placeholder.com/${width}x${height}?text=Badminton+World` });
});

// Serve static files from pro directory
app.use('/static', express.static(path.join(__dirname, 'pro', 'static')));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});