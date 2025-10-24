console.log("Server is starting...");

require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // 🔥 ADD: สำหรับสร้าง Token จริง

const app = express();

// ---------- Config ----------
const port = process.env.PORT || 8000;
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "demo_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// ---------- Middlewares ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// simple logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ---------- DB Pool ----------
// (แทนที่บล็อก IIFE เดิมทั้งหมดด้วยฟังก์ชัน init() นี้)
let pool;
async function init() {
  try {
    pool = await mysql.createPool(dbConfig);
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log("✅ Connected to MySQL (XAMPP) successfully.");

    // ---------- Start server หลัง DB พร้อม ----------
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ MySQL connection error:", err.message);
    process.exit(1);
  }
}
init();

// ---------- Routes ----------
app.get("", (req, res) => {
  res.send("Hello World!");
});

// สร้างผู้ใช้ใหม่ -> บันทึกลง MySQL (รองรับ user / Entrepreneur)
app.post("/registers", async (req, res) => {
  try {
    const { username, email, password, role, usertype } = req.body || {};

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "username, email, password เป็นฟิลด์บังคับ" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // รับได้ทั้ง role/usertype จากฟรอนต์ และแมปเป็น "user" หรือ "Entrepreneur"
    const raw = (role ?? usertype ?? "user");
    const r = String(raw).trim().toLowerCase();
    const finalUsertype = r === "entrepreneur" ? "Entrepreneur" : "user";

    const sql = `
      INSERT INTO users (username, email, password_hash, usertype)
      VALUES (?, ?, ?, ?)
    `;
    const params = [username, email, passwordHash, finalUsertype];

    const [result] = await pool.execute(sql, params);

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: result.insertId,
        username,
        email,
        usertype: finalUsertype,
      },
    });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "อีเมลนี้ถูกใช้ไปแล้ว" });
    }
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});



app.post("/users/login", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    // รับได้ทั้ง username หรือ email แต่ต้องมี password เสมอ
    const loginId = (username || email || "").trim();

    if (!loginId || !password) {
      return res.status(400).json({ message: "กรอก username/email และ password ให้ครบ" });
    }

    // หา user จาก DB
    const [rows] = await pool.query(
      "SELECT id, username, email, password_hash, usertype FROM users WHERE username = ? OR email = ? LIMIT 1",
      [loginId, loginId]
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    const u = rows[0];

    // ตรวจรหัสผ่าน
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    // Normalize บทบาท -> 'entrepreneur' | 'user'
    const role = String(u.usertype || "").trim().toLowerCase() === "entrepreneur"
      ? "entrepreneur"
      : "user";

    // สร้าง JWT แล้วเซ็ตเป็น httpOnly cookie (เหมาะกับเซสชัน)
    const token = jwt.sign(
      { sub: u.id, username: u.username, role },
      process.env.JWT_SECRET || "dev-secret-change-me",
      { expiresIn: "7d" }
    );

    res.cookie("session_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      // secure: true,  // เปิดเมื่อลง HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ส่งข้อมูลที่ฟรอนต์ใช้ map บทบาทได้
    return res.json({
      success: true,
      user: {
        id: u.id,
        username: u.username,
        email: u.email,
        usertype: role,
        role, // เผื่อฟรอนต์อ่านค่า role ตรง ๆ
      },
      token, // จะไม่ใช้ก็ได้ เพราะเราเซ็ตคุกกี้แล้ว
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "invalid user id" });
    }

    // ดึงข้อมูลก่อนลบ (ไม่อ้าง created_at/updated_at ถ้าไม่มีคอลัมน์)
    const [rows] = await pool.query(
      `SELECT id, username, email, usertype
       FROM users WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const deletedUser = rows[0];

    const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "User deleted successfully",
      deleted: {
        id: deletedUser.id,
        username: deletedUser.username,
        email: deletedUser.email,
        usertype: deletedUser.usertype,
        role:
          String(deletedUser.usertype || "").toLowerCase() === "entrepreneur"
            ? "entrepreneur"
            : "user",
      },
    });
  } catch (err) {
    logSqlError("Delete user error", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /users — ดึงผู้ใช้ทั้งหมด
app.get("/users", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, email, usertype FROM users ORDER BY id DESC"
    );

    // แปลง usertype ใน DB -> role (lowercase) ให้ฟรอนต์ใช้ง่าย (ถ้าไม่ต้องการ ลบ map ออกได้)
    const users = rows.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      usertype: u.usertype, // เก็บใน DB: "user" หรือ "Entrepreneur"
      role: String(u.usertype || "").toLowerCase() === "entrepreneur" ? "entrepreneur" : "user",
    }));

    return res.json(users);
  } catch (err) {
    console.error("List users error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ PATCH /users/:id — ปลอดภัย ไม่แตะ updated_at, กันคีย์ซ้ำ, log ชัด
app.patch("/users/:id", async (req, res) => {
  try {
    // --- ตรวจ id ---
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "invalid user id" });
    }

    // --- ดึงฟิลด์จาก body ---
    const { username, email, password, role, usertype } = req.body || {};

    // --- ประกอบ SQL แบบไดนามิก ---
    const sets = [];
    const params = [];

    if (username !== undefined) {
      const v = String(username).trim();
      if (!v) return res.status(400).json({ message: "username ห้ามว่าง" });
      sets.push("username = ?");
      params.push(v);
    }

    if (email !== undefined) {
      const v = String(email).trim();
      if (!v) return res.status(400).json({ message: "email ห้ามว่าง" });
      sets.push("email = ?");
      params.push(v);
    }

    if (password !== undefined) {
      const v = String(password);
      if (v.length < 6) {
        return res.status(400).json({ message: "password ต้องอย่างน้อย 6 ตัวอักษร" });
      }
      const hash = await bcrypt.hash(v, 10);
      sets.push("password_hash = ?");
      params.push(hash);
    }

    // รับ role/usertype (normalize → DB เก็บ "user" | "Entrepreneur")
    const normalizeRole = (raw) => {
      const r = String(raw ?? "").trim().toLowerCase();
      if (r === "entrepreneur") return "Entrepreneur";
      if (r === "user") return "user";
      return null;
    };
    if (role !== undefined || usertype !== undefined) {
      const finalRole = normalizeRole(role ?? usertype);
      if (!finalRole) {
        return res.status(400).json({ message: "role/usertype ไม่ถูกต้อง (user | entrepreneur)" });
      }
      sets.push("usertype = ?");
      params.push(finalRole);
    }

    if (sets.length === 0) {
      return res.status(400).json({ message: "ไม่มีฟิลด์ให้อัปเดต" });
    }

    // --- รัน UPDATE ---
    const sql = `UPDATE users SET ${sets.join(", ")} WHERE id = ?`;
    params.push(id);
    const [result] = await pool.execute(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // --- อ่านค่าที่อัปเดตแล้วกลับไป (ไม่แตะ created_at/updated_at) ---
    const [rows] = await pool.query(
      `SELECT id, username, email, usertype FROM users WHERE id = ? LIMIT 1`,
      [id]
    );
    const u = rows[0];

    return res.json({
      message: "User updated",
      user: {
        id: u.id,
        username: u.username,
        email: u.email,
        usertype: u.usertype,
        role: String(u.usertype || "").toLowerCase() === "entrepreneur" ? "entrepreneur" : "user",
      },
    });
  } catch (err) {
    // 🔎 log รายละเอียดเพื่อแก้ได้ไว
    console.error("PATCH /users/:id error:", {
      name: err?.name,
      code: err?.code,
      errno: err?.errno,
      sqlState: err?.sqlState,
      sqlMessage: err?.sqlMessage,
      message: err?.message,
      stack: err?.stack,
    });

    // จับเคสอีเมลซ้ำ (unique constraint)
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "อีเมลนี้ถูกใช้ไปแล้ว" });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
});



// ---------- Start server ----------
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
