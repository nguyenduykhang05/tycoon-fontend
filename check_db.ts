import db from './database.js';
console.log("Total Products:", db.prepare('SELECT count(*) as c FROM products').get());
console.log("Flash Deal=0 Products:", db.prepare('SELECT count(*) as c FROM products WHERE is_flash_deal=0').get());
console.log("Products Sample:", db.prepare('SELECT id, name FROM products LIMIT 3').all());
console.log("Brands Sample:", db.prepare('SELECT id, name FROM brands LIMIT 3').all());
