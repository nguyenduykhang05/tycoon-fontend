import db, { setupDatabase } from './database.js';

async function debug() {
  try {
    setupDatabase();
    console.log('--- Database Setup Completed ---');

    console.log('Testing Brand Insert...');
    const insertBrand = db.prepare('INSERT INTO brands (id, name, logo_url, description, origin) VALUES (?, ?, ?, ?, ?)');
    insertBrand.run(999, "Debug Brand", "url", "desc", "Origin");
    console.log('Brand Insert OK');

    console.log('Testing Product Insert...');
    const insertProduct = db.prepare(`
        INSERT INTO products (id, name, price, original_price, discount_percent, image_url, category_name, is_flash_deal, sold_count, brand_id, capacities)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertProduct.run(999, "Debug Product", 100, 200, 50, "img", "Category", 0, 0, 999, null);
    console.log('Product Insert OK');

    // Clean up debug data
    db.prepare('DELETE FROM products WHERE id = 999').run();
    db.prepare('DELETE FROM brands WHERE id = 999').run();
    console.log('--- Debug Cleanup OK ---');

  } catch (error) {
    console.error('!!! SQLITE ERROR !!!');
    console.error(error);
    process.exit(1);
  }
}

debug();
