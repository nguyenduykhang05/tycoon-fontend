// @ts-nocheck
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'database.sqlite');
const db = new Database(DB_PATH);

export function setupDatabase() {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  console.log('SQLite connected at', DB_PATH);

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      points INTEGER DEFAULT 0,
      tier TEXT DEFAULT 'Bronze',
      full_name TEXT,
      gender TEXT,
      dob TEXT,
      phone TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo_url TEXT,
      description TEXT,
      origin TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL NOT NULL,
      discount_percent REAL NOT NULL,
      image_url TEXT NOT NULL,
      category_name TEXT NOT NULL,
      is_flash_deal INTEGER DEFAULT 0,
      sold_count INTEGER DEFAULT 0,
      delivery_time TEXT DEFAULT '2H',
      brand_id INTEGER REFERENCES brands(id),
      capacities TEXT,
      avg_rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      province TEXT NOT NULL,
      district TEXT,
      type TEXT,
      phone TEXT,
      shop_hours TEXT,
      clinic_hours TEXT,
      booking_url TEXT,
      lat REAL,
      lng REAL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      product_id INTEGER REFERENCES products(id),
      service_id INTEGER,
      rating INTEGER NOT NULL,
      comment TEXT,
      image_urls TEXT,
      is_verified_purchase INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      thumbnail_url TEXT,
      category TEXT DEFAULT 'Chung',
      author_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS spa_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      duration_minutes INTEGER DEFAULT 60,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS spa_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      service_id INTEGER REFERENCES spa_services(id),
      branch_id INTEGER REFERENCES stores(id),
      booking_time TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      province TEXT NOT NULL,
      district TEXT,
      is_default INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      total_amount REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      final_amount REAL NOT NULL,
      delivery_type TEXT DEFAULT 'standard',
      payment_method TEXT DEFAULT 'cash',
      payment_status TEXT DEFAULT 'pending',
      order_status TEXT DEFAULT 'processing',
      address_id INTEGER REFERENCES addresses(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id),
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER NOT NULL,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS wishlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      product_id INTEGER REFERENCES products(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS vouchers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_amount REAL NOT NULL,
      min_order_value REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS warranties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      product_id INTEGER REFERENCES products(id),
      serial_numbers TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      staff_id INTEGER REFERENCES users(id),
      status TEXT DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER REFERENCES chat_sessions(id),
      sender_id INTEGER REFERENCES users(id),
      sender_role TEXT,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export default db;
