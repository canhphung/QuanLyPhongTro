-- Vòng đời xem/giữ chỗ/thuê phòng.
-- * Yêu cầu xem/thuê: thêm giữ chỗ (tiền cọc giữ chỗ, hạn giữ), liên kết hợp đồng,
--   người xử lý và thời điểm cập nhật; ràng buộc giá trị trạng thái/loại yêu cầu.
-- * Hợp đồng: ghi nhận quyết toán tiền cọc khi kết thúc.
-- * Phòng: thêm trạng thái DA_DAT (đã giữ chỗ / đã ký nhưng chưa tới ngày vào ở).

ALTER TABLE portal_viewing_request
  ADD COLUMN hold_deposit DECIMAL(19,0) NULL,
  ADD COLUMN hold_until DATE NULL,
  ADD COLUMN contract_id INT NULL,
  ADD COLUMN processed_by INT NULL,
  ADD COLUMN updated_at TIMESTAMP NULL,
  ADD CONSTRAINT fk_viewing_request_contract FOREIGN KEY (contract_id) REFERENCES hop_dong(id),
  ADD CONSTRAINT fk_viewing_request_processor FOREIGN KEY (processed_by) REFERENCES tai_khoan(id),
  ADD CONSTRAINT ck_viewing_request_type CHECK (request_type IN ('Xem phòng','Đăng ký thuê')),
  ADD CONSTRAINT ck_viewing_request_status CHECK (status IN (
    'Chờ xác nhận','Đã xác nhận','Đã từ chối','Đã hủy','Đã xem','Khách không đến',
    'Đã giữ chỗ','Đã hủy giữ chỗ','Hết hạn giữ chỗ','Đã lập hợp đồng',
    'Phòng không còn trống','Tin đã ẩn')),
  ADD CONSTRAINT ck_viewing_request_hold_deposit CHECK (hold_deposit IS NULL OR hold_deposit >= 0),
  ADD INDEX idx_viewing_request_listing_status (listing_id, status);

ALTER TABLE hop_dong
  ADD COLUMN tien_coc_hoan_tra DECIMAL(19,0) NULL,
  ADD COLUMN ghi_chu_quyet_toan VARCHAR(500) NULL,
  ADD CONSTRAINT ck_hop_dong_hoan_coc CHECK (
    tien_coc_hoan_tra IS NULL OR (tien_coc_hoan_tra >= 0 AND tien_coc_hoan_tra <= tien_coc));

-- Chuẩn hóa giá trị cũ (TrangThaiPhongConverter từng chấp nhận nhãn tiếng Việt) trước khi ràng buộc.
UPDATE phong SET trang_thai = CASE
    WHEN LOWER(trang_thai) LIKE '%thu%' THEN 'DANG_THUE'
    WHEN LOWER(trang_thai) LIKE '%bảo%' OR LOWER(trang_thai) LIKE '%bao%' THEN 'BAO_TRI'
    WHEN LOWER(trang_thai) LIKE '%ngưng%' OR LOWER(trang_thai) LIKE '%ngung%' THEN 'NGUNG_HOAT_DONG'
    ELSE 'TRONG' END
WHERE trang_thai NOT IN ('TRONG','DANG_THUE','BAO_TRI','NGUNG_HOAT_DONG');

ALTER TABLE phong
  ADD CONSTRAINT ck_phong_trang_thai CHECK (
    trang_thai IN ('TRONG','DA_DAT','DANG_THUE','BAO_TRI','NGUNG_HOAT_DONG'));
