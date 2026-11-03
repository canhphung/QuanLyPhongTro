-- Tài khoản quản trị viên mẫu để duyệt tin (CHỈ dùng cho database phát triển, như V3/V4).
-- Đăng nhập: admin@qlpt-demo.test / Demo@123 (cùng mật khẩu với các tài khoản chủ trọ mẫu).
INSERT INTO tai_khoan (email,mat_khau_hash,ho_ten,hoat_dong)
SELECT 'admin@qlpt-demo.test',
  '$2a$10$KO0E0Elw/Bcu364dogGdLuEvfPpmz41aZmN5ST4r.drcFos9YZXbO',
  'Quản trị viên mẫu',TRUE
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tai_khoan WHERE email='admin@qlpt-demo.test');

INSERT IGNORE INTO tai_khoan_vai_tro (tai_khoan_id,vai_tro)
SELECT id,'ADMIN' FROM tai_khoan WHERE email='admin@qlpt-demo.test';
