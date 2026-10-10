CREATE TABLE tai_khoan
(
    id            INT auto_increment PRIMARY KEY,
    email         VARCHAR(254) NOT NULL,
    mat_khau_hash VARCHAR(255) NOT NULL,
    ho_ten        VARCHAR(255) NOT NULL,
    hoat_dong     BOOLEAN NOT NULL,
    CONSTRAINT uk_tai_khoan_email UNIQUE (email)
);

CREATE TABLE tai_khoan_vai_tro
(
    tai_khoan_id INT NOT NULL,
    vai_tro      VARCHAR(30) NOT NULL,
    CONSTRAINT uk_tai_khoan_vai_tro UNIQUE (tai_khoan_id, vai_tro),
    CONSTRAINT fk_vai_tro_tai_khoan FOREIGN KEY (tai_khoan_id) REFERENCES
        tai_khoan(id)
);

CREATE TABLE chu_tro
(
    id            INT auto_increment PRIMARY KEY,
    tai_khoan_id  INT NOT NULL,
    ten_hien_thi  VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(20),
    CONSTRAINT uk_chu_tro_tai_khoan UNIQUE (tai_khoan_id),
    CONSTRAINT fk_chu_tro_tai_khoan FOREIGN KEY (tai_khoan_id) REFERENCES
        tai_khoan(id)
);

CREATE TABLE nha_tro
(
    id          INT auto_increment PRIMARY KEY,
    chu_tro_id  INT NOT NULL,
    ten_nha_tro VARCHAR(255) NOT NULL,
    dia_chi     VARCHAR(500) NOT NULL,
    INDEX idx_nha_tro_chu_tro (chu_tro_id),
    CONSTRAINT fk_nha_tro_chu_tro FOREIGN KEY (chu_tro_id) REFERENCES chu_tro(
                                                                              id)
);

CREATE TABLE phong
(
    nha_tro_id INT NOT NULL,
    id         INT auto_increment PRIMARY KEY,
    so_phong   VARCHAR(50) NOT NULL,
    dien_tich  DECIMAL(10, 2) NOT NULL,
    gia_thue   DECIMAL(19, 0) NOT NULL,
    trang_thai VARCHAR(30) NOT NULL,
    CONSTRAINT uk_phong_nha_tro_so_phong UNIQUE (nha_tro_id, so_phong),
    CONSTRAINT fk_phong_nha_tro FOREIGN KEY (nha_tro_id) REFERENCES nha_tro(id)
);

CREATE TABLE nguoi_thue
(
    chu_tro_id         INT NOT NULL,
    tai_khoan_id       INT NULL,
    id                 INT auto_increment PRIMARY KEY,
    ho_ten             VARCHAR(255) NOT NULL,
    cccd               VARCHAR(20) NOT NULL,
    so_dien_thoai      VARCHAR(20),
    ngay_sinh          DATE,
    dia_chi_thuong_tru VARCHAR(500),
    CONSTRAINT uk_nguoi_thue_chu_tro_cccd UNIQUE (chu_tro_id, cccd),
    INDEX idx_nguoi_thue_tai_khoan (tai_khoan_id),
    CONSTRAINT fk_nguoi_thue_chu_tro FOREIGN KEY (chu_tro_id) REFERENCES
        chu_tro(id),
    CONSTRAINT fk_nguoi_thue_tai_khoan FOREIGN KEY (tai_khoan_id) REFERENCES
        tai_khoan(id)
);

CREATE TABLE hop_dong
(
    id                    INT auto_increment PRIMARY KEY,
    phong_id              INT NOT NULL,
    ngay_bat_dau          DATE NOT NULL,
    ngay_ket_thuc         DATE NOT NULL,
    gia_thue_thoa_thuan   DECIMAL(19, 0) NOT NULL,
    tien_coc              DECIMAL(19, 0) NOT NULL,
    trang_thai            VARCHAR(30) NOT NULL,
    ngay_ket_thuc_thuc_te DATE NULL,
    ly_do_ket_thuc        VARCHAR(500) NULL,
    CONSTRAINT fk_hop_dong_phong FOREIGN KEY (phong_id) REFERENCES phong(id)
);

CREATE TABLE thanh_vien_hop_dong
(
    hop_dong_id   INT NOT NULL,
    nguoi_thue_id INT NOT NULL,
    ngay_vao      DATE NOT NULL,
    ngay_roi      DATE,
    la_dai_dien   BOOLEAN NOT NULL,
    PRIMARY KEY (hop_dong_id, nguoi_thue_id),
    CONSTRAINT fk_tvhd_hop_dong FOREIGN KEY (hop_dong_id) REFERENCES hop_dong(
                                                                              id),
    CONSTRAINT fk_tvhd_nguoi_thue FOREIGN KEY (nguoi_thue_id) REFERENCES
        nguoi_thue(id)
);

CREATE TABLE dich_vu
(
    chu_tro_id       INT NOT NULL,
    id               INT auto_increment PRIMARY KEY,
    ten_dich_vu      VARCHAR(255) NOT NULL,
    don_vi_tinh      VARCHAR(50) NOT NULL,
    don_gia_hien_tai DECIMAL(19, 0) NOT NULL,
    tinh_theo_chi_so BOOLEAN NOT NULL,
    dang_hoat_dong   BOOLEAN NOT NULL,
    INDEX idx_dich_vu_chu_tro (chu_tro_id),
    CONSTRAINT fk_dich_vu_chu_tro FOREIGN KEY (chu_tro_id) REFERENCES chu_tro(
                                                                              id)
);

CREATE TABLE hoa_don
(
    id                    INT auto_increment PRIMARY KEY,
    hop_dong_id           INT NOT NULL,
    ky_thanh_toan         DATE NOT NULL,
    ngay_lap              DATE NOT NULL,
    han_thanh_toan        DATE NOT NULL,
    tien_phong            DECIMAL(19, 0) NOT NULL,
    trang_thai            VARCHAR(30) NOT NULL,
    ngay_ket_thuc_thuc_te DATE NULL,
    ly_do_ket_thuc        VARCHAR(500) NULL,
    CONSTRAINT fk_hoa_don_hop_dong FOREIGN KEY (hop_dong_id) REFERENCES
        hop_dong(id),
    CONSTRAINT uk_hoa_don_hop_dong_ky UNIQUE (hop_dong_id, ky_thanh_toan)
);

CREATE TABLE chi_tiet_hoa_don
(
    id         INT auto_increment PRIMARY KEY,
    hoa_don_id INT NOT NULL,
    dich_vu_id INT NOT NULL,
    chi_so_cu  DECIMAL(19, 3),
    chi_so_moi DECIMAL(19, 3),
    so_luong   DECIMAL(19, 3) NOT NULL,
    don_gia    DECIMAL(19, 0) NOT NULL,
    CONSTRAINT fk_cthd_hoa_don FOREIGN KEY (hoa_don_id) REFERENCES hoa_don(id),
    CONSTRAINT fk_cthd_dich_vu FOREIGN KEY (dich_vu_id) REFERENCES dich_vu(id)
);

CREATE TABLE thanh_toan
(
    id              INT auto_increment PRIMARY KEY,
    hoa_don_id      INT NOT NULL,
    ngay_thanh_toan DATETIME NOT NULL,
    so_tien         DECIMAL(19, 0) NOT NULL,
    phuong_thuc     VARCHAR(30) NOT NULL,
    ma_giao_dich    VARCHAR(255),
    CONSTRAINT fk_thanh_toan_hoa_don FOREIGN KEY (hoa_don_id) REFERENCES
        hoa_don(id)
);