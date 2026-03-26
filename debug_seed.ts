import db from './database.js';

try {
    console.log('SEEDING DATABASE (DEBUG)...');
    db.exec('PRAGMA foreign_keys = OFF;');
    
    // Test a simple insert that might fail
    const insertReview = db.prepare('INSERT INTO reviews (user_id, product_id, rating, comment, image_urls, is_verified_purchase) VALUES (?, ?, ?, ?, ?, ?)');
    insertReview.run(3, 1, 5, "Test", "url1||url2", 1);
    console.log('Review insert success');

    const insertCategory = db.prepare('INSERT INTO categories (id, name, icon_url, parent_id) VALUES (?, ?, ?, ?)');
    insertCategory.run(100, 'Test Cat', 'icon', null);
    console.log('Category insert success');

    const insertProduct = db.prepare('INSERT INTO products (id, name, price, original_price, discount_percent, image_url, category_name, is_flash_deal, brand_id, sold_count, capacities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    insertProduct.run(100, 'Test Prod', 100, 200, 50, 'img', 'Cat', 0, null, 0, '[]');
    console.log('Product insert success');

} catch (e) {
    console.error('FULL ERROR:', e);
}
