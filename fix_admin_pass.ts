import bcrypt from 'bcrypt';
import db from './database.js';

const hash = await bcrypt.hash('admin123', 10);
db.prepare('UPDATE users SET password=? WHERE role=?').run(hash, 'admin');
const u = db.prepare('SELECT id, username, role FROM users WHERE role=?').get('admin') as any;
console.log('✅ Đã cập nhật mật khẩu admin thành công!');
console.log('Username:', u.username);
console.log('Password: admin123');
