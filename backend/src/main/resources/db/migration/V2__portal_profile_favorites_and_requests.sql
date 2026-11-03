-- Extend the existing dev domain. No duplicate account/building/listing tables or seed data.
ALTER TABLE tai_khoan ADD COLUMN phone VARCHAR(20) NOT NULL DEFAULT '',
 ADD COLUMN birthday DATE NULL, ADD COLUMN address VARCHAR(500) NOT NULL DEFAULT '';
ALTER TABLE nha_tro ADD COLUMN city VARCHAR(100) NOT NULL DEFAULT '',
 ADD COLUMN district VARCHAR(100) NOT NULL DEFAULT '',
 ADD COLUMN manager VARCHAR(255) NOT NULL DEFAULT '',
 ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE phong ADD COLUMN room_type VARCHAR(50) NOT NULL DEFAULT 'Phòng trọ';
ALTER TABLE tin_dang ADD COLUMN room_type VARCHAR(50) NOT NULL DEFAULT 'Phòng trọ',
 ADD COLUMN city VARCHAR(100) NOT NULL DEFAULT '',
 ADD COLUMN district VARCHAR(100) NOT NULL DEFAULT '', ADD COLUMN amenities TEXT NULL;
CREATE TABLE portal_favorite (
 account_id INT NOT NULL, listing_id INT NOT NULL,
 PRIMARY KEY (account_id,listing_id),
 FOREIGN KEY (account_id) REFERENCES tai_khoan(id),
 FOREIGN KEY (listing_id) REFERENCES tin_dang(id) ON DELETE CASCADE
);
CREATE TABLE portal_viewing_request (
 id INT AUTO_INCREMENT PRIMARY KEY,
 account_id INT NOT NULL, listing_id INT NOT NULL,
 visit_date DATE NOT NULL, visit_time TIME NOT NULL,
 name VARCHAR(255) NOT NULL, phone VARCHAR(20) NOT NULL,
 request_type VARCHAR(30) NOT NULL, note VARCHAR(1000) NOT NULL DEFAULT '',
 status VARCHAR(30) NOT NULL DEFAULT 'Chờ xác nhận',
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (account_id) REFERENCES tai_khoan(id),
 FOREIGN KEY (listing_id) REFERENCES tin_dang(id)
);
CREATE TABLE portal_tenant_invitation (
 tenant_id INT PRIMARY KEY, token_hash CHAR(64) NOT NULL UNIQUE, expires_at DATETIME NOT NULL,
 FOREIGN KEY (tenant_id) REFERENCES nguoi_thue(id)
);
