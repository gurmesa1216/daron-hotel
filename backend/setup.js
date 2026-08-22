const pool = require('./db');

async function seedDB() {
  try {
    console.log('Ensuring tables exist and seeding default data...');

    // 1. Create Tables safely (won't delete existing ones)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(50) DEFAULT ''
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS dishes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        portion VARCHAR(100),
        image_url TEXT,
        gallery JSON,
        rating DECIMAL(3, 2) DEFAULT 0.00,
        prep_time_minutes INT DEFAULT 0,
        restaurant VARCHAR(255) DEFAULT 'Daron Hotel Kitchen',
        available BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        delivery_address TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        subtotal DECIMAL(10, 2) NOT NULL,
        delivery_fee DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2) DEFAULT 0.00,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        dish_id INT,
        quantity INT NOT NULL,
        price_at_order DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE SET NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `);

    // 2. Insert Initial Categories
    await pool.query(`
      INSERT INTO categories (id, name, icon) VALUES 
      (1, 'Traditional', '🍲'), 
      (2, 'Drinks', '🥤'), 
      (3, 'Desserts', '🍰')
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    // 3. Insert Initial Dishes (so /api/dishes is not empty)
    await pool.query(`
      INSERT INTO dishes (category_id, name, description, price, portion, image_url, rating, prep_time_minutes, available) VALUES 
      (1, 'Doro Wat', 'Traditional Ethiopian spicy chicken stew served with Injera.', 450.00, 'Single', 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg', 4.8, 25, TRUE),
      (1, 'Special Kitfo', 'Minced beef seasoned in mitmita and niter kibbeh.', 500.00, 'Full', 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg', 4.9, 20, TRUE),
      (2, 'Tej (Honey Wine)', 'Traditional fermented honey wine.', 150.00, '500ml', 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg', 4.7, 5, TRUE)
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    // 4. Insert Admin
    await pool.query(`
      INSERT INTO admins (username, password) VALUES ('admin', 'admin123')
      ON DUPLICATE KEY UPDATE username=VALUES(username);
    `);

    console.log('Database updated and seeded safely!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDB();