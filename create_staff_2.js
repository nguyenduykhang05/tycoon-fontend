import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';

try {
  const db = new Database('database.sqlite');
  const hash = await bcrypt.hash('123456', 10);
  db.prepare('INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)').run(
      'nhanvien', 
      hash, 
      'Nhân Viên CSKH', 
      'staff'
  );
  console.log('Tạo xong tài khoản nhanvien2');
} catch (error) {
  console.error('Lỗi tạo tk:', error.message);
}
