// ═══════════════════════════════════════════════════════
// Daron Hotel — Express Server (with Cloudinary Storage)
// ═══════════════════════════════════════════════════════
require('dotenv').config(); // Load variables from .env
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ── 1. Configure Cloudinary ──
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ── 2. Configure Multer with Limits & Cloudinary Storage ──
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "daron_hotel_dishes",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file limit
});

const app = express();
app.use(cors());
app.use(express.json());

// ── Helper: Extract detailed error message for responses & logs ──
function getErrorMessage(err) {
  if (!err) return "Unknown Error";
  return err.message || err.sqlMessage || err.code || String(err);
}

// ── Helper: map DB row → dish shape the frontend expects ──
function mapDish(row, req) {
  const protocol = req && req.get('x-forwarded-proto') 
    ? req.get('x-forwarded-proto') 
    : (req ? req.protocol : 'https');

  // Uses Render's dynamic hostname if req is missing, avoiding hardcoded cross-client URLs
  const defaultHost = process.env.RENDER_EXTERNAL_HOSTNAME || 'daron-hotel-1.onrender.com';
  const host = req ? req.get('host') : defaultHost;
  const baseUrl = `${protocol}://${host}`;

  let imageUrl = "";
  if (row.image_url) {
    if (row.image_url.startsWith('http://')) {
      imageUrl = row.image_url.replace('http://', 'https://');
    } else if (row.image_url.startsWith('https://')) {
      imageUrl = row.image_url;
    } else {
      imageUrl = `${baseUrl}${encodeURI(row.image_url)}`;
    }
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category_name || 'Nyaata/ምግብ',
    categoryId: row.category_id,
    price: Number(row.price),
    portion: row.portion,
    image: imageUrl,
    gallery:
      typeof row.gallery === "string"
      ? JSON.parse(row.gallery || "[]")
      : row.gallery || [],
    rating: Number(row.rating),
    prepTime: row.prep_time_minutes,
    restaurant: row.restaurant || "Daron Hotel Kitchen",
    available: Boolean(row.available),
    description: row.description,
  };
}

// ════════ ROOT & HEALTH ROUTES ════════
app.get('/', (req, res) => {
  res.send('Daron Hotel API is up and running!');
});

app.get('/api', (req, res) => {
  res.json({ message: "Daron Hotel API v1 is active", status: "OK" });
});

// Health check endpoint for UptimeRobot
app.get('/api/health', async (req, res) => {
  try {
    // Ping MySQL connection to verify DB health
    await pool.query('SELECT 1');
    res.status(200).json({ status: "ok", message: "Server and database are healthy!" });
  } catch (err) {
    console.error("Health check error:", err);
    res.status(500).json({ status: "error", error: getErrorMessage(err) });
  }
});

// ════════ SETUP CATEGORIES ROUTE (COMMENTED OUT) ════════
/*
app.get('/api/setup-categories', async (req, res) => {
  try {
    // Disable foreign key checks temporarily to wipe old categories safely
    await pool.query('SET FOREIGN_KEY_CHECKS = 0;');
    await pool.query('TRUNCATE TABLE categories;');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1;');

    const newCategories = [
      'Nyaata/ምግብ',
      'Kansoomanaa/የጾም',
      'Dhugaatii/መጠጥ',
      'Dhugaatii Lallaafaa/ለስላሳ መጠጦች'
    ];

    for (const name of newCategories) {
      await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
    }

    res.json({ success: true, message: 'Database updated with new categories successfully!' });
  } catch (err) {
    console.error("Setup Categories Error:", err);
    res.status(500).json({ success: false, error: getErrorMessage(err) });
  }
});
*/

// ════════ CATEGORIES ════════

app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error("GET /api/categories error:", err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// ════════ DISHES ════════

app.get('/api/dishes', async (req, res) => {
  try {
    const { category } = req.query;
    const showAll = req.query.all === 'true';

    let sql = `
      SELECT d.*, c.name AS category_name
      FROM dishes d
      LEFT JOIN categories c ON d.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (!showAll) {
      sql += ' AND d.available = TRUE';
    }
    if (category && category !== 'all') {
      sql += ' AND c.name = ?';
      params.push(category);
    }
    sql += ' ORDER BY d.id';

    const [rows] = await pool.query(sql, params);
    res.json(rows.map(row => mapDish(row, req)));
  } catch (err) {
    console.error("GET /api/dishes error:", err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

app.get('/api/dishes/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, c.name AS category_name
       FROM dishes d
       LEFT JOIN categories c ON d.category_id = c.id
       WHERE d.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Dish not found' });
    res.json(mapDish(rows[0], req));
  } catch (err) {
    console.error(`GET /api/dishes/${req.params.id} error:`, err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

app.post("/api/dishes", (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      console.error("Cloudinary Upload Error:", err);
      return res.status(500).json({ error: "Image upload failed: " + getErrorMessage(err) });
    }

    try {
      const {
        name,
        category_id,
        description,
        price,
        portion,
        rating,
        prep_time_minutes,
        restaurant,
        available
      } = req.body;

      const image_url = req.file ? req.file.path : null;

      const [result] = await pool.query(
        `INSERT INTO dishes (category_id, name, description, price, \`portion\`, image_url, gallery, rating, prep_time_minutes, restaurant, available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          category_id || null,
          name,
          description || "",
          Number(price),
          portion || "",
          image_url,
          JSON.stringify([]),
          Number(rating || 0),
          Number(prep_time_minutes || 0),
          restaurant || "Daron Hotel Kitchen",
          available ? 1 : 0
        ]
      );

      return res.status(201).json({ id: result.insertId, message: 'Dish added successfully' });
    } catch (dbErr) {
      console.error("Database Error on POST /api/dishes:", dbErr);
      return res.status(500).json({ error: getErrorMessage(dbErr) });
    }
  });
});

app.put('/api/dishes/:id', async (req, res) => {
  try {
    const allowed = [
      'category_id', 'name', 'description', 'price', 'portion',
      'image_url', 'gallery', 'rating', 'prep_time_minutes', 'restaurant', 'available'
    ];
    const updates = [];
    const params = [];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(key === 'gallery' ? JSON.stringify(req.body[key]) : req.body[key]);
      }
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    params.push(req.params.id);

    await pool.query(`UPDATE dishes SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Dish updated' });
  } catch (err) {
    console.error(`PUT /api/dishes/${req.params.id} error:`, err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

app.patch('/api/dishes/:id/availability', async (req, res) => {
  try {
    const { available } = req.body;
    await pool.query('UPDATE dishes SET available = ? WHERE id = ?', [available, req.params.id]);
    res.json({ message: 'Availability updated' });
  } catch (err) {
    console.error(`PATCH /api/dishes/${req.params.id}/availability error:`, err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

app.delete("/api/dishes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM order_items WHERE dish_id=?", [id]);
    await pool.query("DELETE FROM dishes WHERE id=?", [id]);

    res.json({ success: true, message: "Dish deleted successfully" });
  } catch (error) {
    console.error("DELETE DISH ERROR:", error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// ════════ ORDERS ════════

app.get('/api/orders', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const [items] = await pool.query(
      `SELECT oi.*, d.name AS dish_name
       FROM order_items oi
       LEFT JOIN dishes d ON oi.dish_id = d.id`
    );
    const result = orders.map((o) => ({
      ...o,
      items: items
        .filter((i) => i.order_id === o.id)
        .map((i) => ({ name: i.dish_name, qty: i.quantity, price: Number(i.price_at_order) })),
    }));
    res.json(result);
  } catch (err) {
    console.error("GET /api/orders error:", err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

app.post('/api/orders', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { user_id, items, subtotal, delivery_fee, discount, total } = req.body;

    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, subtotal, delivery_fee, discount, total, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [user_id || null, subtotal, delivery_fee, discount || 0, total]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items (order_id, dish_id, quantity, price_at_order)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.dish_id, item.qty, item.price]
      );
    }

    await conn.commit();
    res.status(201).json({ id: orderId, message: 'Order placed' });
  } catch (err) {
    await conn.rollback();
    console.error("POST /api/orders error:", err);
    res.status(500).json({ error: getErrorMessage(err) });
  } finally {
    conn.release();
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    console.error(`PATCH /api/orders/${req.params.id}/status error:`, err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// ════════ USERS ════════

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, delivery_address } = req.body;
    const userAddress = delivery_address || 'Dukem';
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      await pool.query(
        'UPDATE users SET name = ?, delivery_address = ? WHERE email = ?',
        [name, userAddress, email]
      );
      res.json({ id: existing[0].id, message: 'User updated' });
    } else {
      const [result] = await pool.query(
        'INSERT INTO users (name, email, delivery_address) VALUES (?, ?, ?)',
        [name, email, userAddress]
      );
      res.status(201).json({ id: result.insertId, message: 'User created' });
    }
  } catch (err) {
    console.error("POST /api/users error:", err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// ════════ ADMIN STATS & AUTH ════════

app.get('/api/stats', async (req, res) => {
  try {
    const [revenueRow] = await pool.query('SELECT COALESCE(SUM(total), 0) AS total FROM orders');
    const [orderCount] = await pool.query('SELECT COUNT(*) AS count FROM orders');
    const [pendingRow] = await pool.query("SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'");
    const [dishRow] = await pool.query('SELECT COUNT(*) AS count FROM dishes');
    const [availRow] = await pool.query('SELECT COUNT(*) AS count FROM dishes WHERE available = TRUE');

    res.json({
      totalRevenue: Number(revenueRow[0].total),
      totalOrders: orderCount[0].count,
      pendingOrders: pendingRow[0].count,
      totalDishes: dishRow[0].count,
      availableDishes: availRow[0].count,
    });
  } catch (err) {
    console.error("GET /api/stats error:", err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query(
      "SELECT * FROM admins WHERE username=? AND password=?",
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    res.json({
      success: true,
      admin: {
        id: rows[0].id,
        username: rows[0].username
      }
    });
  } catch (err) {
    console.error("POST /api/admin/login error:", err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// ════════ START SERVER ════════

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Daron Hotel API running on port ${PORT}`);
});