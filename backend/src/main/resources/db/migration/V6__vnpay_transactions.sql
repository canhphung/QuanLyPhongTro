-- Giao dịch VNPAY: mỗi link thanh toán là một dòng, khóa chính là vnp_TxnRef.
-- Dùng để đối chiếu số tiền khi VNPAY gọi IPN/trang kết quả và đảm bảo mỗi giao dịch
-- chỉ được ghi nhận vào thanh_toan đúng một lần.
CREATE TABLE vnpay_giao_dich (
  txn_ref VARCHAR(64) NOT NULL PRIMARY KEY,
  hoa_don_id INT NOT NULL,
  tai_khoan_id INT NOT NULL,
  so_tien DECIMAL(19,0) NOT NULL,
  trang_thai VARCHAR(30) NOT NULL,
  het_han DATETIME NOT NULL,
  thanh_toan_id INT NULL,
  ma_giao_dich_vnpay VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_vnpay_hoa_don FOREIGN KEY (hoa_don_id) REFERENCES hoa_don(id),
  CONSTRAINT fk_vnpay_tai_khoan FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id),
  CONSTRAINT fk_vnpay_thanh_toan FOREIGN KEY (thanh_toan_id) REFERENCES thanh_toan(id),
  CONSTRAINT uk_vnpay_thanh_toan UNIQUE (thanh_toan_id),
  CONSTRAINT ck_vnpay_so_tien CHECK (so_tien > 0),
  CONSTRAINT ck_vnpay_trang_thai CHECK (
    trang_thai IN ('CHO_THANH_TOAN','DA_GHI_NHAN','THAT_BAI','CAN_HOAN_TIEN')),
  INDEX idx_vnpay_hoa_don_trang_thai (hoa_don_id, trang_thai)
);
