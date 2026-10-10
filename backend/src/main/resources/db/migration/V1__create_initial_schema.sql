CREATE TABLE phong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    so_phong VARCHAR(50) NOT NULL,
    dien_tich DECIMAL(10,2) NOT NULL,
    gia_thue DECIMAL(19,0) NOT NULL,
    trang_thai VARCHAR(30) NOT NULL,

    CONSTRAINT uk_phong_so_phong UNIQUE (so_phong)
);

CREATE TABLE nguoi_thue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ho_ten VARCHAR(255) NOT NULL,
    cccd VARCHAR(20) NOT NULL,
    so_dien_thoai VARCHAR(20),
    ngay_sinh DATE,
    dia_chi_thuong_tru VARCHAR(500),

    CONSTRAINT uk_nguoi_thue_cccd UNIQUE (cccd)
);

CREATE TABLE hop_dong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phong_id INT NOT NULL,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    gia_thue_thoa_thuan DECIMAL(19,0) NOT NULL,
    tien_coc DECIMAL(19,0) NOT NULL,
    trang_thai VARCHAR(30) NOT NULL,
    ngay_ket_thuc_thuc_te DATE NULL,
    ly_do_ket_thuc VARCHAR(500) NULL,

    CONSTRAINT fk_hop_dong_phong
        FOREIGN KEY (phong_id) REFERENCES phong(id)
);

CREATE TABLE thanh_vien_hop_dong (
    hop_dong_id INT NOT NULL,
    nguoi_thue_id INT NOT NULL,
    ngay_vao DATE NOT NULL,
    ngay_roi DATE,
    la_dai_dien BOOLEAN NOT NULL,

    PRIMARY KEY (hop_dong_id, nguoi_thue_id),

    CONSTRAINT fk_tvhd_hop_dong
        FOREIGN KEY (hop_dong_id) REFERENCES hop_dong(id),

    CONSTRAINT fk_tvhd_nguoi_thue
        FOREIGN KEY (nguoi_thue_id) REFERENCES nguoi_thue(id)
);

CREATE TABLE dich_vu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_dich_vu VARCHAR(255) NOT NULL,
    don_vi_tinh VARCHAR(50) NOT NULL,
    don_gia_hien_tai DECIMAL(19,0) NOT NULL,
    tinh_theo_chi_so BOOLEAN NOT NULL,
    dang_hoat_dong BOOLEAN NOT NULL
);

CREATE TABLE hoa_don (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hop_dong_id INT NOT NULL,
    ky_thanh_toan DATE NOT NULL,
    ngay_lap DATE NOT NULL,
    han_thanh_toan DATE NOT NULL,
    tien_phong DECIMAL(19,0) NOT NULL,
    trang_thai VARCHAR(30) NOT NULL,
    ngay_ket_thuc_thuc_te DATE NULL,
    ly_do_ket_thuc VARCHAR(500) NULL,

    CONSTRAINT fk_hoa_don_hop_dong
        FOREIGN KEY (hop_dong_id) REFERENCES hop_dong(id),

    CONSTRAINT uk_hoa_don_hop_dong_ky
        UNIQUE (hop_dong_id, ky_thanh_toan)
);

CREATE TABLE chi_tiet_hoa_don (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hoa_don_id INT NOT NULL,
    dich_vu_id INT NOT NULL,
    chi_so_cu DECIMAL(19,3),
    chi_so_moi DECIMAL(19,3),
    so_luong DECIMAL(19,3) NOT NULL,
    don_gia DECIMAL(19,0) NOT NULL,

    CONSTRAINT fk_cthd_hoa_don
        FOREIGN KEY (hoa_don_id) REFERENCES hoa_don(id),

    CONSTRAINT fk_cthd_dich_vu
        FOREIGN KEY (dich_vu_id) REFERENCES dich_vu(id)
);

CREATE TABLE thanh_toan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hoa_don_id INT NOT NULL,
    ngay_thanh_toan DATETIME NOT NULL,
    so_tien DECIMAL(19,0) NOT NULL,
    phuong_thuc VARCHAR(30) NOT NULL,
    ma_giao_dich VARCHAR(255),

    CONSTRAINT fk_thanh_toan_hoa_don
        FOREIGN KEY (hoa_don_id) REFERENCES hoa_don(id)
);