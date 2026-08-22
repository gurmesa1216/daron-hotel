import db from './db.js'; // Adjust path if your database file is named differently (e.g., './config/db.js')

async function updateCategories() {
  try {
    console.log('Connecting to database...');

    // 1. Clear existing categories
    await db.query('DELETE FROM categories;');

    // 2. Insert multi-language categories
    const categories = [
      'Nyaata/ምግብ',
      'Kansoomanaa/የጾም',
      'Dhugaatii/መጠጥ',
      'Dhugaatii Lallaafaa/ለስላሳ መጠጦች'
    ];

    for (const name of categories) {
      await db.query('INSERT INTO categories (name) VALUES (?);', [name]);
    }

    console.log('Categories updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating categories:', err);
    process.exit(1);
  }
}

updateCategories();