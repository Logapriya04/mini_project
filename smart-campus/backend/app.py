import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Connect to SQLite DB
conn = sqlite3.connect('smart_campus.db', check_same_thread=False)
cursor = conn.cursor()

# Create table if not exists
cursor.execute("""
CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    category TEXT,
    description TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
conn.commit()

# Admin credentials
ADMIN_EMAIL = "admin@sigc.edu"
ADMIN_PASSWORD = "admin123"  # simple password, change if needed

# Submit complaint (Students)
@app.route("/submit", methods=["POST"])
def submit():
    data = request.json
    email = data["email"]
    if not email.endswith("@sigc.edu"):
        return jsonify({"error": "Only SIGC emails allowed"}), 400

    cursor.execute("INSERT INTO complaints (email, category, description) VALUES (?,?,?)",
                   (email, data["category"], data["description"]))
    conn.commit()
    return jsonify({"message": "Complaint submitted successfully"})

# Track complaints (Students)
@app.route("/track/<email>")
def track(email):
    cursor.execute("SELECT * FROM complaints WHERE email=?", (email,))
    rows = cursor.fetchall()
    keys = [description[0] for description in cursor.description]
    data = [dict(zip(keys,row)) for row in rows]
    return jsonify(data)

# Admin view all complaints
@app.route("/admin")
def admin_view():
    cursor.execute("SELECT * FROM complaints")
    rows = cursor.fetchall()
    keys = [description[0] for description in cursor.description]
    data = [dict(zip(keys,row)) for row in rows]
    return jsonify(data)

# Update complaint status (Admin only)
@app.route("/update", methods=["PUT"])
def update():
    data = request.json
    # Admin verification
    if "admin_email" not in data or "admin_password" not in data:
        return jsonify({"error":"Unauthorized"}), 403

    if data["admin_email"] != ADMIN_EMAIL or data["admin_password"] != ADMIN_PASSWORD:
        return jsonify({"error":"Unauthorized"}), 403

    cursor.execute("UPDATE complaints SET status=? WHERE id=?",
                   (data["status"], data["id"]))
    conn.commit()
    return jsonify({"message": "Status updated"})

if __name__ == "__main__":
    app.run(debug=True)
