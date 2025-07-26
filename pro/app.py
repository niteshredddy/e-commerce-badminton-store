from flask import Flask, jsonify, request, send_from_directory, abort
from flask_cors import CORS
import sqlite3
import datetime
import json

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('badminton_store.db')
    cursor = conn.cursor()

    # Create products table
    cursor.execute('''
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
    ''')

    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            isAdmin BOOLEAN NOT NULL,
            createdAt TEXT NOT NULL
        )
    ''')

    # Create orders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY,
            customer TEXT NOT NULL,  -- JSON string
            items TEXT NOT NULL,     -- JSON string
            subtotal REAL NOT NULL,
            shipping REAL NOT NULL,
            tax REAL NOT NULL,
            total REAL NOT NULL,
            status TEXT NOT NULL,
            date TEXT NOT NULL
        )
    ''')

    conn.commit()
    conn.close()

# Migrate initial data to SQLite
def migrate_data():
    conn = sqlite3.connect('badminton_store.db')
    cursor = conn.cursor()

    # Products data
    products = [
        (1, "Yonex Astrox 100ZZ", "rackets", 16399, 15, "Flagship racket with Rotational Generator System for maximum power, control, and maneuverability. Perfect for advanced players seeking power and precision in their offensive shots.", "/static/astrox_100zz.jpg", 83),
        (2, "Li-Ning Aeronaut 9000i", "rackets", 14150, 10, "Professional-grade racket with Carbon Fiber technology for excellent stability and control. Suitable for intermediate to advanced players looking for speed and precision.", "/static/aeronaut_9000i.jpg", 85),
        (3, "Yonex Mavis-350 Shuttlecocks", "shuttlecocks", 1200, 50, "Premium nylon shuttlecocks for tournament play. Consistent flight path and durability for competitive matches.", "/static/mavis_350.jpg", 5),
        (4, "Victor A960 Shoes", "footwear", 9265, 20, "Professional badminton shoes with enhanced cushioning and grip. Engineered for quick lateral movements and superior comfort during intense matches.", "/static/victor_a960.jpg", 320),
        (5, "Yonex Men's Team Polo", "apparel", 1399, 30, "Official team polo shirt with moisture-wicking fabric to keep you cool and dry during play. Modern fit for comfort and mobility.", "/static/team_polo.jpg", 180),
        (6, "Grip Tape Pro Pack", "accessories", 440, 100, "Set of 3 premium overgrips with superior absorption and tack. Extends the life of your racket handle and provides excellent grip during play.", "/static/grip_tape.jpg", 30),
        (7, "Hundred Dark Knight Racket", "rackets", 4500, 8, "All-round performance racket with advanced frame design. Perfect balance of power and control for versatile play styles.", "/static/dark_knight.jpg", 82),
        (8, "Li-Ning Number 7 Strings", "accessories", 800, 25, "Tournament-grade string with excellent tension maintenance. Provides optimal power and control for competitive players.", "/static/lining_strings.jpg", 10),
        (9, "Yonex Nanoflare speed 7", "rackets", 2500, 12, "High-performance racket designed for speed and agility. Features Sonic Flare System for rapid shot execution, ideal for defensive players.", "/static/nanoflare_7.jpg", 84),
        (10, "Li-Ning Turbo X 90", "rackets", 1790, 10, "Dynamic racket with AeroTec-Beam System for enhanced aerodynamics and power. Perfect for aggressive players seeking precision.", "/static/turbo_x90.jpg", 86),
        (11, "Yonex aerosena 50", "shuttlecocks", 2500, 40, "Premium feather shuttlecocks for professional play. Offers excellent flight stability and durability for high-level matches.", "/static/aerosena_50.jpg", 5),
        (12, "Hundred max shoes", "footwear", 2500, 60, "Professional badminton shoes with enhanced cushioning and grip. Engineered for quick lateral movements and superior comfort during intense matches.", "/static/hundred_beast.jpg", 20)
    ]

    # Users data
    users = [
        (1, "Admin User", "admin@badmintonworld.com", "admin123", True, "2025-01-01T00:00:00.000Z"),
        (2, "John Doe", "john@example.com", "password123", False, "2025-02-15T00:00:00.000Z"),
        (3, "Jane Smith", "jane@example.com", "password123", False, "2025-03-10T00:00:00.000Z")
    ]

    # Orders data
    orders = [
        (1001, json.dumps({"firstName": "John", "lastName": "Doe", "email": "john@example.com", "phone": "555-123-4567", "address": "123 Main St", "city": "Boston", "state": "MA", "zip": "02108"}),
         json.dumps([{"id": 1, "name": "Yonex Astrox 100ZZ", "price": 16399, "quantity": 1}, {"id": 3, "name": "Yonex Mavis-350 Shuttlecocks", "price": 1200, "quantity": 2}]),
         17599, 720, 1440, 19559, "delivered", "2025-05-01T10:30:00.000Z"),
        (1002, json.dumps({"firstName": "Jane", "lastName": "Smith", "email": "jane@example.com", "phone": "555-987-6543", "address": "456 Oak Ave", "city": "Chicago", "state": "IL", "zip": "60601"}),
         json.dumps([{"id": 2, "name": "Li-Ning Aeronaut 9000i", "price": 14150, "quantity": 1}, {"id": 6, "name": "Grip Tape Pro Pack", "price": 440, "quantity": 3}]),
         15370, 510, 1159, 16939, "processing", "2025-05-10T14:45:00.000Z"),
        (1003, json.dumps({"firstName": "Mike", "lastName": "Johnson", "email": "mike@example.com", "phone": "555-555-5555", "address": "789 Pine Blvd", "city": "Seattle", "state": "WA", "zip": "98101"}),
         json.dumps([{"id": 4, "name": "Victor A960 Shoes", "price": 9265, "quantity": 1}, {"id": 5, "name": "Yonex Men's Team Polo", "price": 1399, "quantity": 2}]),
         11963, 640, 957, 13360, "pending", "2025-05-15T09:15:00.000Z"),
        (1004, json.dumps({"firstName": "Alice", "lastName": "Brown", "email": "alice@example.com", "phone": "555-111-2222", "address": "321 Elm St", "city": "Los Angeles", "state": "CA", "zip": "90001"}),
         json.dumps([{"id": 7, "name": "Hundred Dark Knight Racket", "price": 4500, "quantity": 1}, {"id": 11, "name": "yonex aerosena 50", "price": 2500, "quantity": 3}]),
         12000, 600, 960, 13560, "shipped", "2025-05-20T12:00:00.000Z"),
        (1005, json.dumps({"firstName": "Robert", "lastName": "Wilson", "email": "robert@example.com", "phone": "555-333-4444", "address": "654 Maple Dr", "city": "Miami", "state": "FL", "zip": "33101"}),
         json.dumps([{"id": 9, "name": "Yonex Nanoflare speed 7", "price": 2500, "quantity": 2}, {"id": 8, "name": "Li-Ning Number 7 Strings", "price": 800, "quantity": 1}]),
         5800, 450, 464, 6714, "pending", "2025-05-25T15:20:00.000Z"),
        (1006, json.dumps({"firstName": "Emma", "lastName": "Davis", "email": "emma@example.com", "phone": "555-666-7777", "address": "987 Cedar Ln", "city": "New York", "state": "NY", "zip": "10001"}),
         json.dumps([{"id": 12, "name": "hundred max shoes", "price": 2500, "quantity": 1}, {"id": 5, "name": "Yonex Men's Team Polo", "price": 1399, "quantity": 1}, {"id": 6, "name": "Grip Tape Pro Pack", "price": 440, "quantity": 2}]),
         4779, 500, 382, 5661, "delivered", "2025-06-01T08:45:00.000Z")
    ]

    # Check if tables are empty before inserting
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        cursor.executemany('''
            INSERT INTO products (id, name, category, price, stock, description, image, weight)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', products)

    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.executemany('''
            INSERT INTO users (id, name, email, password, isAdmin, createdAt)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', users)

    cursor.execute("SELECT COUNT(*) FROM orders")
    if cursor.fetchone()[0] == 0:
        cursor.executemany('''
            INSERT INTO orders (id, customer, items, subtotal, shipping, tax, total, status, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', orders)

    conn.commit()
    conn.close()

# Helper functions to interact with SQLite
def get_db_connection():
    conn = sqlite3.connect('badminton_store.db')
    conn.row_factory = sqlite3.Row
    return conn

def find_user_by_email(email):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def find_user_by_id(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def find_product_by_id(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    product = cursor.fetchone()
    conn.close()
    return dict(product) if product else None

def find_order_by_id(order_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order = cursor.fetchone()
    if order:
        order_dict = dict(order)
        order_dict['customer'] = json.loads(order_dict['customer'])
        order_dict['items'] = json.loads(order_dict['items'])
        conn.close()
        return order_dict
    conn.close()
    return None

# Initialize database and migrate data
init_db()
migrate_data()

@app.route('/')
def serve_index():
    return send_from_directory('.', 'BadmintonWorldApp.html')

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products")
    products = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(products)

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = find_product_by_id(product_id)
    if product:
        return jsonify(product)
    else:
        return jsonify({"error": "Product not found"}), 404

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user = find_user_by_email(email)
    if user and user['password'] == password:
        user_data = user.copy()
        user_data.pop('password')
        return jsonify({"success": True, "user": user_data})
    else:
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if find_user_by_email(email):
        return jsonify({"success": False, "message": "Email already registered"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(id) FROM users")
    max_id = cursor.fetchone()[0]
    new_id = (max_id or 0) + 1
    new_user = {
        "id": new_id,
        "name": name,
        "email": email,
        "password": password,
        "isAdmin": False,
        "createdAt": datetime.datetime.utcnow().isoformat() + 'Z'
    }
    cursor.execute('''
        INSERT INTO users (id, name, email, password, isAdmin, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (new_id, name, email, password, False, new_user['createdAt']))
    conn.commit()
    conn.close()
    
    user_data = new_user.copy()
    user_data.pop('password')
    return jsonify({"success": True, "user": user_data})

@app.route('/api/orders', methods=['GET'])
def get_orders():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders")
    orders = [dict(row) for row in cursor.fetchall()]
    for order in orders:
        order['customer'] = json.loads(order['customer'])
        order['items'] = json.loads(order['items'])
    conn.close()
    return jsonify(orders)

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.json
    customer = data.get('customer')
    items = data.get('items')
    subtotal = data.get('subtotal')
    shipping = data.get('shipping')
    tax = data.get('tax')
    total = data.get('total')
    if not customer or not items:
        return jsonify({"success": False, "message": "Invalid order data"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(id) FROM orders")
    max_id = cursor.fetchone()[0]
    new_id = (max_id or 1000) + 1
    new_order = {
        "id": new_id,
        "customer": customer,
        "items": items,
        "subtotal": subtotal,
        "shipping": shipping,
        "tax": tax,
        "total": total,
        "status": "pending",
        "date": datetime.datetime.utcnow().isoformat() + 'Z'
    }
    cursor.execute('''
        INSERT INTO orders (id, customer, items, subtotal, shipping, tax, total, status, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (new_id, json.dumps(customer), json.dumps(items), subtotal, shipping, tax, total, "pending", new_order['date']))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "order": new_order})

@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, isAdmin, createdAt FROM users")
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(users)

@app.route('/api/users/<int:user_id>/role', methods=['PUT'])
def update_user_role(user_id):
    data = request.json
    is_admin = data.get('isAdmin')
    user = find_user_by_id(user_id)
    if user:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET isAdmin = ? WHERE id = ?", (bool(is_admin), user_id))
        conn.commit()
        conn.close()
        user['isAdmin'] = bool(is_admin)
        user_copy = user.copy()
        user_copy.pop('password', None)
        return jsonify({"success": True, "user": user_copy})
    else:
        return jsonify({"success": False, "message": "User not found"}), 404

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = find_user_by_id(user_id)
    if user:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "message": "User not found"}), 404

@app.route('/api/placeholder/<int:width>/<int:height>')
def placeholder_image(width, height):
    return jsonify({"url": f"https://via.placeholder.com/{width}x{height}?text=Badminton+World"})

if __name__ == '__main__':
    app.run(debug=True)