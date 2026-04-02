import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';

const db = new Database('database.sqlite');
bcrypt.hash('123456', 10).then((hash: string) => {
    try {
        db.prepare('INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)').run(
            'nhanvien', 
            hash, 
            'Nhân Viên CSKH', 
            'staff'
        );
        console.log('Tạo xong tài khoản nhanvien');
    } catch (e: any) {
        console.log('Lỗi tạo tk: ', e.message);
    }
});
