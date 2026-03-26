// @ts-nocheck
import express, { Request, Response } from 'express';
import db, { setupDatabase } from './database.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();
setupDatabase();

const app = express();
const PORT = 3001;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'tycoon_super_secret_key_2026';

const authenticateToken = (req: Request, res: Response, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Access denied: No token provided' });
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
        (req as any).user = decoded;
        next();
    });
};

const isAdmin = (req: Request, res: Response, next: any) => {
    if ((req as any).user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied: Admin required' });
    }
    next();
};

// Helper: get products with brand info and ratings
const getProducts = (where = '', params: any[] = []) => {
    const sql = `
        SELECT p.*, b.name as joined_brand_name, b.logo_url as joined_brand_logo, b.origin as joined_brand_origin,
               COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.id) as review_count
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN reviews r ON r.product_id = p.id
        ${where}
        GROUP BY p.id
    `;
    return db.prepare(sql).all(...params);
};

// 1. Products API
app.get('/api/products', (req: Request, res: Response) => {
    try {
        const { is_flash_deal, category_name } = req.query;
        let where = 'WHERE 1=1';
        const params: any[] = [];
        if (is_flash_deal === '1') { where += ' AND p.is_flash_deal = 1'; }
        if (is_flash_deal === '0') { where += ' AND p.is_flash_deal = 0'; }
        if (category_name) { where += ' AND LOWER(p.category_name) = LOWER(?)'; params.push(category_name); }
        const products = getProducts(where, params);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json({ success: true, data: products });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/api/products/search', (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        if (!q || String(q).trim() === '') return res.json({ success: true, data: [] });
        const keyword = `%${String(q).trim()}%`;
        const products = getProducts('WHERE p.name LIKE ? OR p.category_name LIKE ?', [keyword, keyword]);
        res.json({ success: true, data: products });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/api/products/best-sellers', (req: Request, res: Response) => {
    try {
        const { category_name, limit } = req.query;
        let where = 'WHERE 1=1';
        const params: any[] = [];
        if (category_name) { where += ' AND LOWER(p.category_name) = LOWER(?)'; params.push(category_name); }
        const sql = `
            SELECT p.*, b.name as joined_brand_name, b.logo_url as joined_brand_logo, b.origin as joined_brand_origin,
                   COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.id) as review_count
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN reviews r ON r.product_id = p.id
            ${where}
            GROUP BY p.id
            ORDER BY p.sold_count DESC
            LIMIT ?
        `;
        params.push(Number(limit) || 10);
        res.json({ success: true, data: db.prepare(sql).all(...params) });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// 3. Stores
app.get('/api/stores', (req: Request, res: Response) => {
    try {
        const { province, district } = req.query;
        let where = 'WHERE 1=1';
        const params: any[] = [];
        if (province) { where += ' AND province = ?'; params.push(province); }
        if (district) { where += ' AND district = ?'; params.push(district); }
        res.json({ success: true, data: db.prepare(`SELECT * FROM stores ${where}`).all(...params) });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// 4. Warranties
app.post('/api/warranties', (req: Request, res: Response) => {
    const { phone, product_id, serial_numbers, notes } = req.body;
    if (!phone || !product_id) return res.status(400).json({ success: false, message: 'Missing fields' });
    try {
        const result = db.prepare('INSERT INTO warranties (phone, product_id, serial_numbers, notes) VALUES (?, ?, ?, ?)').run(phone, product_id, serial_numbers, notes);
        res.json({ success: true, data: { id: result.lastInsertRowid } });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// 5. Auth
app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { username, password, full_name, gender, dob } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Missing credentials' });
    try {
        const existing = db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?)').get(username);
        if (existing) return res.status(409).json({ success: false, message: 'Account exists' });
        const hash = await bcrypt.hash(password, 10);
        const result = db.prepare('INSERT INTO users (username, password, full_name, gender, dob) VALUES (?, ?, ?, ?, ?)').run(username, hash, full_name, gender, dob);
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as any;
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...safeUser } = user;
        res.json({ success: true, data: safeUser, token, message: 'Registered successfully' });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
    const username = req.body.username?.trim();
    const password = req.body.password;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Missing credentials' });
    try {
        const user = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(username) as any;
        if (!user) return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại trong hệ thống' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác' });
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...safeUser } = user;
        res.json({ success: true, data: safeUser, token, message: 'Login successful' });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/api/auth/profile/:username', authenticateToken, (req: Request, res: Response) => {
    try {
        const user = db.prepare('SELECT id, username, role, points, tier, full_name, gender, dob, phone FROM users WHERE username = ?').get(req.params.username) as any;
        if (user) res.json({ success: true, data: user });
        else res.status(404).json({ success: false, message: 'User not found' });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

app.put('/api/auth/profile', authenticateToken, (req: Request, res: Response) => {
    const { username, full_name, gender, dob } = req.body;
    try {
        db.prepare('UPDATE users SET full_name=?, gender=?, dob=? WHERE username=?').run(full_name, gender, dob, username);
        const user = db.prepare('SELECT id, username, role, points, tier, full_name, gender, dob, phone FROM users WHERE username=?').get(username);
        res.json({ success: true, message: 'Updated successfully', data: user });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

app.put('/api/auth/change-password', authenticateToken, async (req: Request, res: Response) => {
    const { username, old_password, new_password } = req.body;
    try {
        const user = db.prepare('SELECT * FROM users WHERE username=?').get(username) as any;
        if (!user || !(await bcrypt.compare(old_password, user.password))) {
            return res.status(401).json({ success: false, message: 'Old password incorrect' });
        }
        const hash = await bcrypt.hash(new_password, 10);
        db.prepare('UPDATE users SET password=? WHERE username=?').run(hash, username);
        res.json({ success: true, message: 'Password updated' });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// 6 & 7. Spa
app.get('/api/spa/services', (_req, res) => {
    try {
        res.json({ success: true, data: db.prepare('SELECT * FROM spa_services').all() });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/spa/bookings', (req: Request, res: Response) => {
    const { user_id, service_id, branch_id, booking_time } = req.body;
    try {
        const result = db.prepare('INSERT INTO spa_bookings (user_id, service_id, branch_id, booking_time) VALUES (?, ?, ?, ?)').run(user_id, service_id, branch_id, booking_time);
        res.json({ success: true, data: { id: result.lastInsertRowid } });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/api/spa/bookings/user', (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
        const bookings = db.prepare(`
            SELECT sb.*, ss.name as service_name, ss.category, ss.price, ss.duration_minutes, st.name as branch_name
            FROM spa_bookings sb
            LEFT JOIN spa_services ss ON sb.service_id = ss.id
            LEFT JOIN stores st ON sb.branch_id = st.id
            WHERE sb.user_id = ?
            ORDER BY sb.created_at DESC
        `).all(user_id);
        res.json({ success: true, data: bookings });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// 8. Orders Checkout
app.post('/api/orders/checkout', authenticateToken, (req: Request, res: Response) => {
    const { user_id, items, voucher_code, delivery_type, payment_method, address_id } = req.body;
    if (!user_id || !items) return res.status(400).json({ success: false, message: 'Invalid data' });
    try {
        let totalAmount = 0;
        const processedItems: any[] = [];
        for (const item of items) {
            const product = db.prepare('SELECT * FROM products WHERE id=?').get(item.product_id) as any;
            if (!product) throw new Error(`Product ${item.product_id} not found`);
            totalAmount += product.price * item.quantity;
            processedItems.push({ ...item, price: product.price });
        }
        let discountAmount = 0;
        if (voucher_code) {
            const voucher = db.prepare('SELECT * FROM vouchers WHERE code=?').get(voucher_code) as any;
            if (!voucher) throw new Error('Invalid voucher');
            if (totalAmount < voucher.min_order_value) throw new Error(`Minimum order value is ${voucher.min_order_value}`);
            discountAmount = voucher.discount_amount;
        }
        const finalAmount = Math.max(0, totalAmount - discountAmount);
        let paymentQR = null;
        if (payment_method === 'qr') {
            paymentQR = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PAY_${finalAmount}`;
        }
        const orderResult = db.prepare('INSERT INTO orders (user_id, total_amount, discount_amount, final_amount, delivery_type, payment_method, address_id) VALUES (?, ?, ?, ?, ?, ?, ?)').run(user_id, totalAmount, discountAmount, finalAmount, delivery_type, payment_method, address_id);
        const orderId = orderResult.lastInsertRowid;
        const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
        for (const i of processedItems) insertItem.run(orderId, i.product_id, i.quantity, i.price);
        const points = Math.floor(finalAmount / 10000);
        db.prepare('UPDATE users SET points = points + ? WHERE id=?').run(points, user_id);
        res.json({ success: true, data: { order_id: orderId, final_amount: finalAmount, payment_qr: paymentQR, points_earned: points } });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/api/orders/my-orders', authenticateToken, (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
        const orders = db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC').all(user_id) as any[];
        const formatted = orders.map((o: any) => {
            const items = db.prepare(`
                SELECT oi.*, p.name, p.image_url FROM order_items oi
                JOIN products p ON oi.product_id = p.id WHERE oi.order_id=?
            `).all(o.id) as any[];
            return {
                ...o,
                product_names: items.map((i: any) => i.name).join('||'),
                images: items.map((i: any) => i.image_url).join('||'),
                quantities: items.map((i: any) => i.quantity).join('||')
            };
        });
        res.json({ success: true, data: formatted });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Addresses
app.get('/api/addresses', (req: Request, res: Response) => {
    try {
        res.json({ success: true, data: db.prepare('SELECT * FROM addresses WHERE user_id=? ORDER BY is_default DESC').all(req.query.user_id) });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
app.post('/api/addresses', (req: Request, res: Response) => {
    const { user_id, full_name, phone, address, province, district, is_default } = req.body;
    try {
        if (is_default) db.prepare('UPDATE addresses SET is_default=0 WHERE user_id=?').run(user_id);
        const result = db.prepare('INSERT INTO addresses (user_id, full_name, phone, address, province, district, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)').run(user_id, full_name, phone, address, province, district, is_default ? 1 : 0);
        res.json({ success: true, data: db.prepare('SELECT * FROM addresses WHERE id=?').get(result.lastInsertRowid) });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
app.put('/api/addresses/:id/default', (req: Request, res: Response) => {
    try {
        db.prepare('UPDATE addresses SET is_default=0 WHERE user_id=?').run(req.body.user_id);
        db.prepare('UPDATE addresses SET is_default=1 WHERE id=?').run(req.params.id);
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
app.delete('/api/addresses/:id', (req: Request, res: Response) => {
    try {
        db.prepare('DELETE FROM addresses WHERE id=?').run(req.params.id);
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Wishlist
app.get('/api/wishlist', (req: Request, res: Response) => {
    try {
        const items = db.prepare(`
            SELECT w.*, p.id as product_id, p.name, p.price, p.original_price, p.discount_percent, p.image_url, p.category_name, p.sold_count, p.is_flash_deal
            FROM wishlists w JOIN products p ON w.product_id = p.id WHERE w.user_id=?
        `).all(req.query.user_id);
        res.json({ success: true, data: items });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
app.post('/api/wishlist', (req: Request, res: Response) => {
    try {
        db.prepare('INSERT OR IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)').run(req.body.user_id, req.body.product_id);
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
app.delete('/api/wishlist/:product_id', (req: Request, res: Response) => {
    try {
        db.prepare('DELETE FROM wishlists WHERE user_id=? AND product_id=?').run(req.body.user_id, req.params.product_id);
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Reviews
app.get('/api/reviews', (req: Request, res: Response) => {
    const { product_id, service_id } = req.query;
    try {
        let where = 'WHERE 1=1';
        const params: any[] = [];
        if (product_id) { where += ' AND r.product_id=?'; params.push(product_id); }
        if (service_id) { where += ' AND r.service_id=?'; params.push(service_id); }
        const reviews = db.prepare(`
            SELECT r.*, u.full_name, u.username FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id ${where} ORDER BY r.created_at DESC
        `).all(...params);
        res.json({ success: true, data: reviews });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
app.post('/api/reviews', (req: Request, res: Response) => {
    const { user_id, product_id, service_id, rating, comment, image_urls, is_verified_purchase } = req.body;
    try {
        const result = db.prepare('INSERT INTO reviews (user_id, product_id, service_id, rating, comment, image_urls, is_verified_purchase) VALUES (?, ?, ?, ?, ?, ?, ?)').run(user_id, product_id, service_id, rating, comment, image_urls, is_verified_purchase ? 1 : 0);
        res.json({ success: true, data: { id: result.lastInsertRowid } });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Blogs
app.get('/api/blogs', (req: Request, res: Response) => {
    try {
        const category = req.query.category;
        let where = '';
        const params: any[] = [];
        if (category && category !== 'Tất cả') { where = 'WHERE category=?'; params.push(category); }
        res.json({ success: true, data: db.prepare(`SELECT * FROM blogs ${where} ORDER BY created_at DESC`).all(...params) });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
app.get('/api/blogs/:slug', (req: Request, res: Response) => {
    try {
        const blog = db.prepare(`
            SELECT b.*, u.full_name as author_name FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id WHERE b.slug=?
        `).get(req.params.slug);
        if (blog) res.json({ success: true, data: blog });
        else res.status(404).json({ success: false, message: 'Not found' });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Brands
app.get('/api/brands', (_req, res) => {
    try {
        res.json({ success: true, data: db.prepare('SELECT * FROM brands').all() });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Hot searches
app.get('/api/hot-searches', (_req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({ success: true, data: ['Kem chống nắng', 'Tẩy trang', 'Serum', 'Sữa rửa mặt', 'Nước hoa', 'Kérastase'] });
});

// Admin APIs
app.get('/api/admin/products', authenticateToken, isAdmin, (_req, res) => {
    try {
        const products = db.prepare(`
            SELECT p.*, b.name as brand_name FROM products p
            LEFT JOIN brands b ON p.brand_id = b.id ORDER BY p.id DESC
        `).all();
        res.json({ success: true, data: products });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/admin/products', authenticateToken, isAdmin, (req, res) => {
    const { name, price, original_price, discount_percent, image_url, category_name, is_flash_deal, sold_count, brand_id, capacities } = req.body;
    try {
        const result = db.prepare('INSERT INTO products (name, price, original_price, discount_percent, image_url, category_name, is_flash_deal, sold_count, brand_id, capacities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(name, price, original_price, discount_percent, image_url, category_name, is_flash_deal ? 1 : 0, sold_count || 0, brand_id, capacities);
        res.json({ success: true, data: { id: result.lastInsertRowid } });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

app.put('/api/admin/products/:id', authenticateToken, isAdmin, (req, res) => {
    const { name, price, original_price, discount_percent, image_url, category_name, is_flash_deal, sold_count, brand_id, capacities } = req.body;
    try {
        db.prepare('UPDATE products SET name=?, price=?, original_price=?, discount_percent=?, image_url=?, category_name=?, is_flash_deal=?, sold_count=?, brand_id=?, capacities=? WHERE id=?').run(name, price, original_price, discount_percent, image_url, category_name, is_flash_deal ? 1 : 0, sold_count, brand_id, capacities, req.params.id);
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete('/api/admin/products/:id', authenticateToken, isAdmin, (req, res) => {
    try {
        db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// AI Chat
app.post('/api/ai/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.json({ success: true, data: { response: "Đây là phản hồi mẫu vì chưa cấu hình GEMINI_API_KEY." } });
        }
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Bạn là trợ lý AI chuyên gia làm đẹp của Tycoon. Khách: ${message}`,
        });
        res.json({ success: true, data: { response: response.text } });
    } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Flash deal settings (admin)
app.get('/api/admin/settings/flash-deal', (_req, res) => {
    res.json({ success: true, data: { end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() } });
});

app.listen(PORT, () => {
    console.log(`Backend API Server is running on http://localhost:${PORT}`);
});
