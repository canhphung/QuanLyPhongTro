-- Development sample data for the current V1/V2 schema.
-- Uses reserved IDs 900001-900020 in each entity table; keep this range free.
-- Run only against a development database, never a production database.

DROP TEMPORARY TABLE IF EXISTS seed_demo_numbers;
CREATE TEMPORARY TABLE seed_demo_numbers (n INT PRIMARY KEY);
INSERT INTO seed_demo_numbers (n) VALUES
  (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),
  (11),(12),(13),(14),(15),(16),(17),(18),(19),(20);

INSERT INTO tai_khoan
  (id,email,mat_khau_hash,ho_ten,hoat_dong,phone,birthday,address)
SELECT 900000+n,CONCAT('owner',LPAD(n,2,'0'),'@qlpt-demo.test'),
  '$2a$10$KO0E0Elw/Bcu364dogGdLuEvfPpmz41aZmN5ST4r.drcFos9YZXbO',
  CONCAT('Chủ trọ mẫu ',LPAD(n,2,'0')),TRUE,
  CONCAT('090',LPAD(1000000+n,7,'0')),
  DATE_ADD('1980-01-01',INTERVAL (n*300) DAY),
  CONCAT('Địa chỉ mẫu ',n,', Việt Nam')
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE
  email=VALUES(email),mat_khau_hash=VALUES(mat_khau_hash),ho_ten=VALUES(ho_ten),
  hoat_dong=VALUES(hoat_dong),phone=VALUES(phone),birthday=VALUES(birthday),
  address=VALUES(address);

INSERT INTO tai_khoan_vai_tro (tai_khoan_id,vai_tro)
SELECT 900000+n,'CHU_TRO' FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE vai_tro=VALUES(vai_tro);

INSERT INTO chu_tro (id,tai_khoan_id,ten_hien_thi,so_dien_thoai)
SELECT 900000+n,900000+n,CONCAT('Chủ trọ mẫu ',LPAD(n,2,'0')),
  CONCAT('090',LPAD(1000000+n,7,'0'))
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE
  tai_khoan_id=VALUES(tai_khoan_id),ten_hien_thi=VALUES(ten_hien_thi),
  so_dien_thoai=VALUES(so_dien_thoai);

INSERT INTO nha_tro
  (id,chu_tro_id,ten_nha_tro,dia_chi,city,district,manager,active)
SELECT 900000+n,900000+n,CONCAT('Nhà trọ mẫu ',LPAD(n,2,'0')),
  CASE MOD(n-1,5)
    WHEN 0 THEN CONCAT('12 Đường số ',n,', Quận 1')
    WHEN 1 THEN CONCAT('25 Nguyễn Văn Cừ, Quận ',MOD(n,12)+1)
    WHEN 2 THEN CONCAT('8 Lê Lợi, Quận Hải Châu')
    WHEN 3 THEN CONCAT('31 Trần Phú, Quận Ninh Kiều')
    ELSE CONCAT('16 Phan Chu Trinh, Thành phố Thủ Đức')
  END,
  CASE MOD(n-1,5)
    WHEN 0 THEN 'TP. Hồ Chí Minh'
    WHEN 1 THEN 'TP. Hồ Chí Minh'
    WHEN 2 THEN 'Đà Nẵng'
    WHEN 3 THEN 'Cần Thơ'
    ELSE 'TP. Hồ Chí Minh'
  END,
  CASE MOD(n-1,5)
    WHEN 0 THEN 'Quận 1'
    WHEN 1 THEN CONCAT('Quận ',MOD(n,12)+1)
    WHEN 2 THEN 'Hải Châu'
    WHEN 3 THEN 'Ninh Kiều'
    ELSE 'Thủ Đức'
  END,
  CONCAT('Chủ trọ mẫu ',LPAD(n,2,'0')),TRUE
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE
  chu_tro_id=VALUES(chu_tro_id),ten_nha_tro=VALUES(ten_nha_tro),
  dia_chi=VALUES(dia_chi),city=VALUES(city),district=VALUES(district),
  manager=VALUES(manager),active=VALUES(active);

INSERT INTO phong
  (id,nha_tro_id,so_phong,dien_tich,gia_thue,trang_thai,room_type)
SELECT 900000+n,900000+n,CONCAT(LPAD(n,2,'0'),'01'),
  18+MOD(n,7)*2,2500000+n*100000,'TRONG',
  CASE MOD(n-1,3)
    WHEN 0 THEN 'Phòng trọ'
    WHEN 1 THEN 'Studio'
    ELSE 'Căn hộ mini'
  END
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE
  nha_tro_id=VALUES(nha_tro_id),so_phong=VALUES(so_phong),
  dien_tich=VALUES(dien_tich),gia_thue=VALUES(gia_thue),
  trang_thai=VALUES(trang_thai),room_type=VALUES(room_type);

INSERT INTO nguoi_thue
  (id,chu_tro_id,tai_khoan_id,ho_ten,cccd,so_dien_thoai,ngay_sinh,dia_chi_thuong_tru)
SELECT 900000+n,900000+n,NULL,CONCAT('Người thuê mẫu ',LPAD(n,2,'0')),
  CONCAT('079',LPAD(n,9,'0')),CONCAT('091',LPAD(2000000+n,7,'0')),
  DATE_ADD('1990-01-01',INTERVAL n*250 DAY),
  CONCAT('Địa chỉ thường trú mẫu ',n,', Việt Nam')
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE
  chu_tro_id=VALUES(chu_tro_id),tai_khoan_id=VALUES(tai_khoan_id),
  ho_ten=VALUES(ho_ten),cccd=VALUES(cccd),so_dien_thoai=VALUES(so_dien_thoai),
  ngay_sinh=VALUES(ngay_sinh),dia_chi_thuong_tru=VALUES(dia_chi_thuong_tru);

INSERT INTO hop_dong
  (id,phong_id,ngay_bat_dau,ngay_ket_thuc,gia_thue_thoa_thuan,tien_coc,
   trang_thai,ngay_ket_thuc_thuc_te,ly_do_ket_thuc)
SELECT 900000+n,900000+n,DATE_SUB(CURDATE(),INTERVAL 365 DAY),
  DATE_SUB(CURDATE(),INTERVAL n DAY),2500000+n*100000,5000000+n*200000,
  'DA_KET_THUC',DATE_SUB(CURDATE(),INTERVAL n DAY),'Hợp đồng mẫu đã kết thúc'
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE
  phong_id=VALUES(phong_id),ngay_bat_dau=VALUES(ngay_bat_dau),
  ngay_ket_thuc=VALUES(ngay_ket_thuc),gia_thue_thoa_thuan=VALUES(gia_thue_thoa_thuan),
  tien_coc=VALUES(tien_coc),trang_thai=VALUES(trang_thai),
  ngay_ket_thuc_thuc_te=VALUES(ngay_ket_thuc_thuc_te),
  ly_do_ket_thuc=VALUES(ly_do_ket_thuc);

INSERT INTO thanh_vien_hop_dong
  (hop_dong_id,nguoi_thue_id,ngay_vao,ngay_roi,la_dai_dien)
SELECT 900000+n,900000+n,DATE_SUB(CURDATE(),INTERVAL 365 DAY),
  DATE_SUB(CURDATE(),INTERVAL n DAY),TRUE
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE
  ngay_vao=VALUES(ngay_vao),ngay_roi=VALUES(ngay_roi),
  la_dai_dien=VALUES(la_dai_dien);

INSERT INTO dich_vu
  (id,chu_tro_id,ten_dich_vu,don_vi_tinh,don_gia_hien_tai,tinh_theo_chi_so,dang_hoat_dong)
SELECT 900000+n,900000+n,'Điện','kWh',3500,TRUE,TRUE
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE
  chu_tro_id=VALUES(chu_tro_id),ten_dich_vu=VALUES(ten_dich_vu),
  don_vi_tinh=VALUES(don_vi_tinh),don_gia_hien_tai=VALUES(don_gia_hien_tai),
  tinh_theo_chi_so=VALUES(tinh_theo_chi_so),dang_hoat_dong=VALUES(dang_hoat_dong);

INSERT INTO hoa_don
  (id,hop_dong_id,ky_thanh_toan,ngay_lap,han_thanh_toan,tien_phong,trang_thai)
SELECT 900000+n,900000+n,DATE_SUB(CURDATE(),INTERVAL (n+60) DAY),
  DATE_SUB(CURDATE(),INTERVAL (n+60) DAY),
  DATE_ADD(DATE_SUB(CURDATE(),INTERVAL (n+60) DAY),INTERVAL 10 DAY),
  2500000+n*100000,'DA_THANH_TOAN'
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE
  hop_dong_id=VALUES(hop_dong_id),ky_thanh_toan=VALUES(ky_thanh_toan),
  ngay_lap=VALUES(ngay_lap),han_thanh_toan=VALUES(han_thanh_toan),
  tien_phong=VALUES(tien_phong),trang_thai=VALUES(trang_thai);

INSERT INTO chi_tiet_hoa_don
  (id,hoa_don_id,dich_vu_id,chi_so_cu,chi_so_moi,so_luong,don_gia)
SELECT 900000+n,900000+n,900000+n,100+n*3,130+n*3,30,3500
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE
  hoa_don_id=VALUES(hoa_don_id),dich_vu_id=VALUES(dich_vu_id),
  chi_so_cu=VALUES(chi_so_cu),chi_so_moi=VALUES(chi_so_moi),
  so_luong=VALUES(so_luong),don_gia=VALUES(don_gia);

INSERT INTO thanh_toan
  (id,hoa_don_id,ngay_thanh_toan,so_tien,phuong_thuc,ma_giao_dich)
SELECT 900000+n,900000+n,
  DATE_ADD(DATE_SUB(CURDATE(),INTERVAL (n+60) DAY),INTERVAL 2 DAY),
  2500000+n*100000+105000,
  CASE MOD(n-1,3)
    WHEN 0 THEN 'CHUYEN_KHOAN'
    WHEN 1 THEN 'TIEN_MAT'
    ELSE 'VI_DIEN_TU'
  END,
  CONCAT('DEMO-TRX-',LPAD(n,4,'0'))
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE
  hoa_don_id=VALUES(hoa_don_id),ngay_thanh_toan=VALUES(ngay_thanh_toan),
  so_tien=VALUES(so_tien),phuong_thuc=VALUES(phuong_thuc),
  ma_giao_dich=VALUES(ma_giao_dich);

INSERT INTO tin_dang
  (id,phong_id,phien_ban,tieu_de,mo_ta,gia_thue,dien_tich,dia_chi,
   so_dien_thoai_lien_he,trang_thai,ly_do,ngay_tao,ngay_cap_nhat,
   ngay_gui_duyet,ngay_duyet,room_type,city,district,amenities)
SELECT 900000+n,900000+n,1,
  CONCAT('Phòng ',CASE MOD(n-1,3)
    WHEN 0 THEN 'trọ'
    WHEN 1 THEN 'studio'
    ELSE 'mini đầy đủ tiện nghi'
  END,' thoáng sáng mẫu ',LPAD(n,2,'0')),
  CONCAT('Phòng sạch sẽ, cửa sổ thoáng, có khu bếp và nhà vệ sinh riêng. '
    ,'Hình ảnh minh họa được lưu ngay trong dự án. Mã phòng mẫu ',LPAD(n,2,'0'),'.'),
  2500000+n*100000,18+MOD(n,7)*2,
  (SELECT dia_chi FROM nha_tro WHERE id=900000+n),
  CONCAT('090',LPAD(1000000+n,7,'0')),'DA_DUYET',NULL,
  DATE_SUB(NOW(),INTERVAL 30 DAY),DATE_SUB(NOW(),INTERVAL 2 DAY),
  DATE_SUB(NOW(),INTERVAL 3 DAY),DATE_SUB(NOW(),INTERVAL 2 DAY),
  CASE MOD(n-1,3)
    WHEN 0 THEN 'Phòng trọ'
    WHEN 1 THEN 'Studio'
    ELSE 'Căn hộ mini'
  END,
  (SELECT city FROM nha_tro WHERE id=900000+n),
  (SELECT district FROM nha_tro WHERE id=900000+n),
  CONCAT('Wi-Fi',CHAR(10),'Điều hòa',CHAR(10),'Khu bếp',CHAR(10),'Nhà vệ sinh riêng')
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE
  phong_id=VALUES(phong_id),phien_ban=VALUES(phien_ban),
  tieu_de=VALUES(tieu_de),mo_ta=VALUES(mo_ta),gia_thue=VALUES(gia_thue),
  dien_tich=VALUES(dien_tich),dia_chi=VALUES(dia_chi),
  so_dien_thoai_lien_he=VALUES(so_dien_thoai_lien_he),
  trang_thai=VALUES(trang_thai),ly_do=VALUES(ly_do),
  ngay_tao=VALUES(ngay_tao),ngay_cap_nhat=VALUES(ngay_cap_nhat),
  ngay_gui_duyet=VALUES(ngay_gui_duyet),ngay_duyet=VALUES(ngay_duyet),
  room_type=VALUES(room_type),city=VALUES(city),district=VALUES(district),
  amenities=VALUES(amenities);

INSERT INTO tin_dang_anh (tin_dang_id,thu_tu,url)
SELECT 900000+n,0,
  CONCAT('/images/demo/room-real-',LPAD(MOD(n-1,4)+1,2,'0'),'.jpg')
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE url=VALUES(url);

INSERT INTO lich_su_tin_dang
  (id,tin_dang_id,nguoi_thuc_hien_id,phien_ban,hanh_dong,ly_do,thoi_diem)
SELECT 900000+n,900000+n,900000+n,1,'DUYET',NULL,
  DATE_SUB(NOW(),INTERVAL 3 DAY)
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE
  tin_dang_id=VALUES(tin_dang_id),nguoi_thuc_hien_id=VALUES(nguoi_thuc_hien_id),
  phien_ban=VALUES(phien_ban),hanh_dong=VALUES(hanh_dong),
  ly_do=VALUES(ly_do),thoi_diem=VALUES(thoi_diem);

INSERT INTO portal_favorite (account_id,listing_id)
SELECT 900000+n,900000+MOD(n,20)+1 FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE listing_id=VALUES(listing_id);

INSERT INTO portal_viewing_request
  (id,account_id,listing_id,visit_date,visit_time,name,phone,request_type,note,status,created_at)
SELECT 900000+n,900000+n,900000+MOD(n,20)+1,
  DATE_ADD(CURDATE(),INTERVAL n DAY),
  MAKETIME(9+MOD(n,8),0,0),
  CONCAT('Khách xem phòng mẫu ',LPAD(n,2,'0')),
  CONCAT('093',LPAD(3000000+n,7,'0')),
  'Xem phòng','Yêu cầu xem phòng mẫu','Chờ xác nhận',NOW()
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE
  account_id=VALUES(account_id),listing_id=VALUES(listing_id),
  visit_date=VALUES(visit_date),visit_time=VALUES(visit_time),
  name=VALUES(name),phone=VALUES(phone),request_type=VALUES(request_type),
  note=VALUES(note),status=VALUES(status),created_at=VALUES(created_at);

INSERT INTO portal_tenant_invitation (tenant_id,token_hash,expires_at)
SELECT 900000+n,SHA2(CONCAT('expired-demo-invitation-',n),256),
  DATE_SUB(NOW(),INTERVAL 1 DAY)
FROM seed_demo_numbers
ON DUPLICATE KEY UPDATE
  token_hash=VALUES(token_hash),expires_at=VALUES(expires_at);
