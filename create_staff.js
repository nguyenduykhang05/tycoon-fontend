const db = require('better-sqlite3')('database.sqlite');
const bcrypt = require('bcryptjs');

try {
  const hash = bcrypt.hashSync('123456', 10);
  db.prepare('INSERT INTO users (username, password, full_name, email, role) VALUES (?, ?, ?, ?, ?)').run(
      'nhanvien', 
      hash, 
      'Nhân Viên CSKH', 
      'nhanvien@tycoon.com', 
      'staff'
  );
  console.log('Tạo xong tài khoản nhanvien');
} catch (error) {
  console.error('Lỗi tạo tk:', error.message);
}
