-- Normalize V3 sample IDs into each table's next available AUTO_INCREMENT range.
-- Consolidate all sample properties under owner01 so one demo account demonstrates
-- the complete owner-management workflow. Development databases only.

DROP TEMPORARY TABLE IF EXISTS seed_demo_id_map;
CREATE TEMPORARY TABLE seed_demo_id_map (
  table_name VARCHAR(40) NOT NULL,
  old_id INT NOT NULL,
  new_id INT NOT NULL,
  PRIMARY KEY (table_name, old_id),
  UNIQUE KEY uk_seed_demo_target (table_name, new_id)
);

INSERT INTO seed_demo_id_map
SELECT 'tai_khoan',id,
  (SELECT COALESCE(MAX(id),0) FROM tai_khoan WHERE id NOT BETWEEN 900001 AND 900020)
    + ROW_NUMBER() OVER (ORDER BY id)
FROM tai_khoan WHERE id BETWEEN 900001 AND 900020;
INSERT INTO seed_demo_id_map
SELECT 'chu_tro',id,
  (SELECT COALESCE(MAX(id),0) FROM chu_tro WHERE id NOT BETWEEN 900001 AND 900020)
    + ROW_NUMBER() OVER (ORDER BY id)
FROM chu_tro WHERE id BETWEEN 900001 AND 900020;
INSERT INTO seed_demo_id_map
SELECT 'nha_tro',id,
  (SELECT COALESCE(MAX(id),0) FROM nha_tro WHERE id NOT BETWEEN 900001 AND 900020)
    + ROW_NUMBER() OVER (ORDER BY id)
FROM nha_tro WHERE id BETWEEN 900001 AND 900020;
INSERT INTO seed_demo_id_map
SELECT 'phong',id,
  (SELECT COALESCE(MAX(id),0) FROM phong WHERE id NOT BETWEEN 900001 AND 900020)
    + ROW_NUMBER() OVER (ORDER BY id)
FROM phong WHERE id BETWEEN 900001 AND 900020;
INSERT INTO seed_demo_id_map
SELECT 'nguoi_thue',id,
  (SELECT COALESCE(MAX(id),0) FROM nguoi_thue WHERE id NOT BETWEEN 900001 AND 900020)
    + ROW_NUMBER() OVER (ORDER BY id)
FROM nguoi_thue WHERE id BETWEEN 900001 AND 900020;
INSERT INTO seed_demo_id_map
SELECT 'hop_dong',id,
  (SELECT COALESCE(MAX(id),0) FROM hop_dong WHERE id NOT BETWEEN 900001 AND 900020)
    + ROW_NUMBER() OVER (ORDER BY id)
FROM hop_dong WHERE id BETWEEN 900001 AND 900020;
INSERT INTO seed_demo_id_map
SELECT 'dich_vu',id,
  (SELECT COALESCE(MAX(id),0) FROM dich_vu WHERE id NOT BETWEEN 900001 AND 900020)
    + ROW_NUMBER() OVER (ORDER BY id)
FROM dich_vu WHERE id BETWEEN 900001 AND 900020;
INSERT INTO seed_demo_id_map
SELECT 'hoa_don',id,
  (SELECT COALESCE(MAX(id),0) FROM hoa_don WHERE id NOT BETWEEN 900001 AND 900020)
    + ROW_NUMBER() OVER (ORDER BY id)
FROM hoa_don WHERE id BETWEEN 900001 AND 900020;
INSERT INTO seed_demo_id_map
SELECT 'chi_tiet_hoa_don',id,
  (SELECT COALESCE(MAX(id),0) FROM chi_tiet_hoa_don WHERE id NOT BETWEEN 900001 AND 900020)
    + ROW_NUMBER() OVER (ORDER BY id)
FROM chi_tiet_hoa_don WHERE id BETWEEN 900001 AND 900020;
INSERT INTO seed_demo_id_map
SELECT 'thanh_toan',id,
  (SELECT COALESCE(MAX(id),0) FROM thanh_toan WHERE id NOT BETWEEN 900001 AND 900020)
    + ROW_NUMBER() OVER (ORDER BY id)
FROM thanh_toan WHERE id BETWEEN 900001 AND 900020;
INSERT INTO seed_demo_id_map
SELECT 'tin_dang',id,
  (SELECT COALESCE(MAX(id),0) FROM tin_dang WHERE id NOT BETWEEN 900001 AND 900020)
    + ROW_NUMBER() OVER (ORDER BY id)
FROM tin_dang WHERE id BETWEEN 900001 AND 900020;
INSERT INTO seed_demo_id_map
SELECT 'lich_su_tin_dang',id,
  (SELECT COALESCE(MAX(id),0) FROM lich_su_tin_dang WHERE id NOT BETWEEN 900001 AND 900020)
    + ROW_NUMBER() OVER (ORDER BY id)
FROM lich_su_tin_dang WHERE id BETWEEN 900001 AND 900020;
INSERT INTO seed_demo_id_map
SELECT 'portal_viewing_request',id,
  (SELECT COALESCE(MAX(id),0) FROM portal_viewing_request WHERE id NOT BETWEEN 900001 AND 900020)
    + ROW_NUMBER() OVER (ORDER BY id)
FROM portal_viewing_request WHERE id BETWEEN 900001 AND 900020;

SET FOREIGN_KEY_CHECKS=0;

UPDATE tai_khoan_vai_tro r JOIN seed_demo_id_map m
  ON m.table_name='tai_khoan' AND m.old_id=r.tai_khoan_id
SET r.tai_khoan_id=m.new_id;
UPDATE chu_tro c JOIN seed_demo_id_map m
  ON m.table_name='tai_khoan' AND m.old_id=c.tai_khoan_id
SET c.tai_khoan_id=m.new_id;
UPDATE nguoi_thue t JOIN seed_demo_id_map m
  ON m.table_name='tai_khoan' AND m.old_id=t.tai_khoan_id
SET t.tai_khoan_id=m.new_id;
UPDATE lich_su_tin_dang h JOIN seed_demo_id_map m
  ON m.table_name='tai_khoan' AND m.old_id=h.nguoi_thuc_hien_id
SET h.nguoi_thuc_hien_id=m.new_id;
UPDATE portal_favorite f JOIN seed_demo_id_map m
  ON m.table_name='tai_khoan' AND m.old_id=f.account_id
SET f.account_id=m.new_id;
UPDATE portal_viewing_request r JOIN seed_demo_id_map m
  ON m.table_name='tai_khoan' AND m.old_id=r.account_id
SET r.account_id=m.new_id;

UPDATE nha_tro b JOIN seed_demo_id_map m
  ON m.table_name='chu_tro' AND m.old_id=b.chu_tro_id
SET b.chu_tro_id=m.new_id;
UPDATE nguoi_thue t JOIN seed_demo_id_map m
  ON m.table_name='chu_tro' AND m.old_id=t.chu_tro_id
SET t.chu_tro_id=m.new_id;
UPDATE dich_vu d JOIN seed_demo_id_map m
  ON m.table_name='chu_tro' AND m.old_id=d.chu_tro_id
SET d.chu_tro_id=m.new_id;

UPDATE phong p JOIN seed_demo_id_map m
  ON m.table_name='nha_tro' AND m.old_id=p.nha_tro_id
SET p.nha_tro_id=m.new_id;

UPDATE hop_dong h JOIN seed_demo_id_map m
  ON m.table_name='phong' AND m.old_id=h.phong_id
SET h.phong_id=m.new_id;
UPDATE tin_dang l JOIN seed_demo_id_map m
  ON m.table_name='phong' AND m.old_id=l.phong_id
SET l.phong_id=m.new_id;

UPDATE thanh_vien_hop_dong t JOIN seed_demo_id_map m
  ON m.table_name='nguoi_thue' AND m.old_id=t.nguoi_thue_id
SET t.nguoi_thue_id=m.new_id;
UPDATE portal_tenant_invitation i JOIN seed_demo_id_map m
  ON m.table_name='nguoi_thue' AND m.old_id=i.tenant_id
SET i.tenant_id=m.new_id;

UPDATE thanh_vien_hop_dong t JOIN seed_demo_id_map m
  ON m.table_name='hop_dong' AND m.old_id=t.hop_dong_id
SET t.hop_dong_id=m.new_id;
UPDATE hoa_don i JOIN seed_demo_id_map m
  ON m.table_name='hop_dong' AND m.old_id=i.hop_dong_id
SET i.hop_dong_id=m.new_id;

UPDATE chi_tiet_hoa_don c JOIN seed_demo_id_map m
  ON m.table_name='dich_vu' AND m.old_id=c.dich_vu_id
SET c.dich_vu_id=m.new_id;
UPDATE chi_tiet_hoa_don c JOIN seed_demo_id_map m
  ON m.table_name='hoa_don' AND m.old_id=c.hoa_don_id
SET c.hoa_don_id=m.new_id;
UPDATE thanh_toan t JOIN seed_demo_id_map m
  ON m.table_name='hoa_don' AND m.old_id=t.hoa_don_id
SET t.hoa_don_id=m.new_id;

UPDATE tin_dang_anh a JOIN seed_demo_id_map m
  ON m.table_name='tin_dang' AND m.old_id=a.tin_dang_id
SET a.tin_dang_id=m.new_id;
UPDATE lich_su_tin_dang h JOIN seed_demo_id_map m
  ON m.table_name='tin_dang' AND m.old_id=h.tin_dang_id
SET h.tin_dang_id=m.new_id;
UPDATE portal_favorite f JOIN seed_demo_id_map m
  ON m.table_name='tin_dang' AND m.old_id=f.listing_id
SET f.listing_id=m.new_id;
UPDATE portal_viewing_request r JOIN seed_demo_id_map m
  ON m.table_name='tin_dang' AND m.old_id=r.listing_id
SET r.listing_id=m.new_id;

UPDATE tai_khoan t JOIN seed_demo_id_map m
  ON m.table_name='tai_khoan' AND m.old_id=t.id
SET t.id=m.new_id;
UPDATE chu_tro t JOIN seed_demo_id_map m
  ON m.table_name='chu_tro' AND m.old_id=t.id
SET t.id=m.new_id;
UPDATE nha_tro t JOIN seed_demo_id_map m
  ON m.table_name='nha_tro' AND m.old_id=t.id
SET t.id=m.new_id;
UPDATE phong t JOIN seed_demo_id_map m
  ON m.table_name='phong' AND m.old_id=t.id
SET t.id=m.new_id;
UPDATE nguoi_thue t JOIN seed_demo_id_map m
  ON m.table_name='nguoi_thue' AND m.old_id=t.id
SET t.id=m.new_id;
UPDATE hop_dong t JOIN seed_demo_id_map m
  ON m.table_name='hop_dong' AND m.old_id=t.id
SET t.id=m.new_id;
UPDATE dich_vu t JOIN seed_demo_id_map m
  ON m.table_name='dich_vu' AND m.old_id=t.id
SET t.id=m.new_id;
UPDATE hoa_don t JOIN seed_demo_id_map m
  ON m.table_name='hoa_don' AND m.old_id=t.id
SET t.id=m.new_id;
UPDATE chi_tiet_hoa_don t JOIN seed_demo_id_map m
  ON m.table_name='chi_tiet_hoa_don' AND m.old_id=t.id
SET t.id=m.new_id;
UPDATE thanh_toan t JOIN seed_demo_id_map m
  ON m.table_name='thanh_toan' AND m.old_id=t.id
SET t.id=m.new_id;
UPDATE tin_dang t JOIN seed_demo_id_map m
  ON m.table_name='tin_dang' AND m.old_id=t.id
SET t.id=m.new_id;
UPDATE lich_su_tin_dang t JOIN seed_demo_id_map m
  ON m.table_name='lich_su_tin_dang' AND m.old_id=t.id
SET t.id=m.new_id;
UPDATE portal_viewing_request t JOIN seed_demo_id_map m
  ON m.table_name='portal_viewing_request' AND m.old_id=t.id
SET t.id=m.new_id;

SET FOREIGN_KEY_CHECKS=1;

DROP TEMPORARY TABLE IF EXISTS seed_demo_profiles;
CREATE TEMPORARY TABLE seed_demo_profiles (
  n INT PRIMARY KEY,
  owner_name VARCHAR(100) NOT NULL,
  tenant_name VARCHAR(100) NOT NULL,
  building_name VARCHAR(150) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  address VARCHAR(300) NOT NULL
);
INSERT INTO seed_demo_profiles VALUES
  (1,'Nguyễn Minh Anh','Trần Ngọc Mai','Nhà trọ An Nhiên','TP. Hồ Chí Minh','Bình Thạnh','18/5 Nguyễn Gia Trí, Phường 25, Bình Thạnh'),
  (2,'Trần Quốc Bảo','Lê Hoàng Yến','Khu trọ Hẻm Xanh','TP. Hồ Chí Minh','Gò Vấp','42/8 Phạm Văn Chiêu, Phường 9, Gò Vấp'),
  (3,'Lê Thanh Hương','Phạm Gia Hân','Nhà trọ Mộc Miên','TP. Hồ Chí Minh','Thủ Đức','15 Đường 11, Phường Linh Chiểu, TP. Thủ Đức'),
  (4,'Phạm Đức Long','Võ Minh Thư','Căn hộ mini Bình Minh','TP. Hồ Chí Minh','Tân Bình','76/3 Bạch Đằng, Phường 2, Tân Bình'),
  (5,'Võ Thị Thu Hà','Nguyễn Hoàng Nam','Nhà trọ Gió Mát','TP. Hồ Chí Minh','Quận 7','29/12 Lâm Văn Bền, Phường Tân Quy, Quận 7'),
  (6,'Đặng Hoàng Nam','Đỗ Khánh Linh','Khu trọ Cây Bàng','TP. Hồ Chí Minh','Quận 3','11/6 Nguyễn Thiện Thuật, Phường 2, Quận 3'),
  (7,'Bùi Ngọc Lan','Lý Quốc Huy','Nhà trọ Hoa Giấy','TP. Hồ Chí Minh','Quận 10','38/2 Thành Thái, Phường 12, Quận 10'),
  (8,'Phan Minh Tuấn','Mai Phương Thảo','Khu trọ Nắng Mai','TP. Hồ Chí Minh','Phú Nhuận','21/9 Phan Xích Long, Phường 2, Phú Nhuận'),
  (9,'Hoàng Thị Kim Oanh','Ngô Đức Anh','Nhà trọ Tân Bình','TP. Hồ Chí Minh','Bình Tân','55/4 Tên Lửa, Phường Bình Trị Đông B, Bình Tân'),
  (10,'Nguyễn Văn Khánh','Đinh Thị Bích Ngọc','Căn hộ nhỏ Tân Phú','TP. Hồ Chí Minh','Tân Phú','92/7 Lũy Bán Bích, Phường Tân Thới Hòa, Tân Phú'),
  (11,'Lý Thị Mỹ Dung','Trương Gia Bảo','Nhà trọ Sông Hàn','Đà Nẵng','Hải Châu','24/6 Nguyễn Chí Thanh, Phường Thạch Thang, Hải Châu'),
  (12,'Trương Quốc Hưng','Huỳnh Ngọc Trâm','Khu trọ Sơn Trà','Đà Nẵng','Sơn Trà','51/3 Ngô Quyền, Phường An Hải Bắc, Sơn Trà'),
  (13,'Đỗ Thị Thanh Vân','Phan Nhật Minh','Nhà trọ Biển Xanh','Đà Nẵng','Liên Chiểu','17/5 Nguyễn Lương Bằng, Phường Hòa Khánh Bắc, Liên Chiểu'),
  (14,'Huỳnh Minh Đức','Đặng Thùy Dương','Khu trọ Cầu Rồng','Đà Nẵng','Ngũ Hành Sơn','33/8 Lê Văn Hiến, Phường Khuê Mỹ, Ngũ Hành Sơn'),
  (15,'Ngô Thị Bảo Châu','Bùi Anh Khoa','Nhà trọ Bến Ninh Kiều','Cần Thơ','Ninh Kiều','46/2 Mậu Thân, Phường Xuân Khánh, Ninh Kiều'),
  (16,'Đinh Văn Phúc','Cao Mỹ Linh','Nhà trọ Cầu Giấy','Hà Nội','Cầu Giấy','28/4 Trần Thái Tông, Phường Dịch Vọng Hậu, Cầu Giấy'),
  (17,'Cao Thị Hồng Nhung','Vương Tuấn Kiệt','Khu trọ Đống Đa','Hà Nội','Đống Đa','63/5 Chùa Láng, Phường Láng Thượng, Đống Đa'),
  (18,'Vương Quốc Thịnh','Đoàn Ngọc Ánh','Nhà trọ Thanh Xuân','Hà Nội','Thanh Xuân','19/7 Nguyễn Trãi, Phường Thanh Xuân Trung, Thanh Xuân'),
  (19,'Dương Thị Phương','Lâm Hoài An','Căn hộ mini Hà Đông','Hà Nội','Hà Đông','35/6 Tô Hiệu, Phường Nguyễn Trãi, Hà Đông'),
  (20,'Mai Hoàng Sơn','Tạ Minh Châu','Nhà trọ Thủ Đức','TP. Hồ Chí Minh','Thủ Đức','88/9 Võ Văn Ngân, Phường Bình Thọ, TP. Thủ Đức');

UPDATE tai_khoan a
JOIN seed_demo_id_map m ON m.table_name='tai_khoan' AND m.new_id=a.id
JOIN seed_demo_profiles p ON p.n=m.old_id-900000
SET a.ho_ten=p.owner_name,
    a.phone=CONCAT('090',LPAD(9000000+p.n,7,'0')),
    a.address=(SELECT b.address FROM seed_demo_profiles b WHERE b.n=p.n);

UPDATE chu_tro c
JOIN seed_demo_id_map m ON m.table_name='tai_khoan' AND m.new_id=c.tai_khoan_id
JOIN seed_demo_profiles p ON p.n=m.old_id-900000
SET c.ten_hien_thi=p.owner_name,
    c.so_dien_thoai=CONCAT('090',LPAD(9000000+p.n,7,'0'));

UPDATE nha_tro b
JOIN seed_demo_id_map m ON m.table_name='nha_tro' AND m.new_id=b.id
JOIN seed_demo_profiles p ON p.n=m.old_id-900000
SET b.ten_nha_tro=p.building_name,
    b.dia_chi=p.address,
    b.city=p.city,
    b.district=p.district,
    b.manager=(SELECT owner_name FROM seed_demo_profiles WHERE n=1),
    b.chu_tro_id=(SELECT new_id FROM seed_demo_id_map WHERE table_name='chu_tro' AND old_id=900001),
    b.active=TRUE;

UPDATE nguoi_thue t
JOIN seed_demo_id_map m ON m.table_name='nguoi_thue' AND m.new_id=t.id
JOIN seed_demo_profiles p ON p.n=m.old_id-900000
SET t.ho_ten=p.tenant_name,
    t.cccd=CONCAT('079',LPAD(900000000+p.n,9,'0')),
    t.so_dien_thoai=CONCAT('093',LPAD(9000000+p.n,7,'0')),
    t.ngay_sinh=DATE_ADD('1995-01-01',INTERVAL (p.n*170) DAY),
    t.dia_chi_thuong_tru=CONCAT('Địa chỉ mẫu ',p.n,', ',p.district,', ',p.city),
    t.chu_tro_id=(SELECT new_id FROM seed_demo_id_map WHERE table_name='chu_tro' AND old_id=900001);

UPDATE phong r
JOIN seed_demo_id_map m ON m.table_name='phong' AND m.new_id=r.id
JOIN seed_demo_profiles p ON p.n=m.old_id-900000
SET r.so_phong=CONCAT(LPAD(p.n,2,'0'),IF(p.n<=6,'02','01')),
    r.dien_tich=18+MOD(p.n*3,15),
    r.gia_thue=2400000+p.n*145000,
    r.trang_thai=IF(p.n<=6,'DANG_THUE','TRONG'),
    r.room_type=CASE MOD(p.n,3)
      WHEN 0 THEN 'Phòng trọ'
      WHEN 1 THEN 'Studio'
      ELSE 'Căn hộ mini'
    END;

UPDATE hop_dong h
JOIN seed_demo_id_map m ON m.table_name='hop_dong' AND m.new_id=h.id
JOIN seed_demo_profiles p ON p.n=m.old_id-900000
SET h.ngay_bat_dau=DATE_SUB(CURDATE(),INTERVAL (180+p.n*7) DAY),
    h.ngay_ket_thuc=IF(p.n<=6,DATE_ADD(CURDATE(),INTERVAL 180 DAY),
      DATE_SUB(CURDATE(),INTERVAL p.n DAY)),
    h.gia_thue_thoa_thuan=2400000+p.n*145000,
    h.tien_coc=(2400000+p.n*145000)*2,
    h.trang_thai=IF(p.n<=6,'DANG_HIEU_LUC','DA_KET_THUC'),
    h.ngay_ket_thuc_thuc_te=IF(p.n<=6,NULL,DATE_SUB(CURDATE(),INTERVAL p.n DAY)),
    h.ly_do_ket_thuc=IF(p.n<=6,NULL,'Hợp đồng mẫu đã hết hạn');

UPDATE thanh_vien_hop_dong t
JOIN seed_demo_id_map m ON m.table_name='hop_dong' AND m.new_id=t.hop_dong_id
JOIN seed_demo_profiles p ON p.n=m.old_id-900000
SET t.ngay_vao=DATE_SUB(CURDATE(),INTERVAL (180+p.n*7) DAY),
    t.ngay_roi=IF(p.n<=6,NULL,DATE_SUB(CURDATE(),INTERVAL p.n DAY)),
    t.la_dai_dien=TRUE;

UPDATE dich_vu d
JOIN seed_demo_id_map m ON m.table_name='dich_vu' AND m.new_id=d.id
JOIN seed_demo_profiles p ON p.n=m.old_id-900000
SET d.ten_dich_vu=CONCAT('Điện · ',p.building_name),
    d.don_vi_tinh='kWh',
    d.don_gia_hien_tai=3500,
    d.tinh_theo_chi_so=TRUE,
    d.dang_hoat_dong=TRUE,
    d.chu_tro_id=(SELECT new_id FROM seed_demo_id_map WHERE table_name='chu_tro' AND old_id=900001);

UPDATE hoa_don i
JOIN seed_demo_id_map m ON m.table_name='hoa_don' AND m.new_id=i.id
JOIN seed_demo_profiles p ON p.n=m.old_id-900000
SET i.ky_thanh_toan=DATE_SUB(STR_TO_DATE(DATE_FORMAT(CURDATE(),'%Y-%m-01'),'%Y-%m-%d'),
      INTERVAL MOD(p.n,4) MONTH),
    i.ngay_lap=DATE_SUB(STR_TO_DATE(DATE_FORMAT(CURDATE(),'%Y-%m-01'),'%Y-%m-%d'),
      INTERVAL MOD(p.n,4) MONTH),
    i.han_thanh_toan=DATE_ADD(DATE_SUB(STR_TO_DATE(DATE_FORMAT(CURDATE(),'%Y-%m-01'),'%Y-%m-%d'),
      INTERVAL MOD(p.n,4) MONTH),INTERVAL 10 DAY),
    i.tien_phong=2400000+p.n*145000,
    i.trang_thai='DA_THANH_TOAN';

UPDATE chi_tiet_hoa_don c
JOIN seed_demo_id_map m ON m.table_name='hoa_don' AND m.new_id=c.hoa_don_id
JOIN seed_demo_profiles p ON p.n=m.old_id-900000
SET c.chi_so_cu=100+p.n*11,
    c.chi_so_moi=130+p.n*11,
    c.so_luong=30,
    c.don_gia=3500;

UPDATE thanh_toan t
JOIN seed_demo_id_map m ON m.table_name='hoa_don' AND m.new_id=t.hoa_don_id
JOIN seed_demo_profiles p ON p.n=m.old_id-900000
JOIN hoa_don i ON i.id=t.hoa_don_id
SET t.ngay_thanh_toan=DATE_ADD(i.ky_thanh_toan,INTERVAL 5 DAY),
    t.so_tien=i.tien_phong+105000,
    t.phuong_thuc=CASE MOD(p.n,3)
      WHEN 0 THEN 'CHUYEN_KHOAN'
      WHEN 1 THEN 'TIEN_MAT'
      ELSE 'VI_DIEN_TU'
    END,
    t.ma_giao_dich=CONCAT('DEMO-TRX-',LPAD(p.n,4,'0'));

UPDATE tin_dang l
JOIN seed_demo_id_map m ON m.table_name='tin_dang' AND m.new_id=l.id
JOIN seed_demo_profiles p ON p.n=m.old_id-900000
JOIN phong r ON r.id=l.phong_id
SET l.tieu_de=CONCAT(p.building_name,' · Phòng ',r.so_phong,' thoáng sáng'),
    l.mo_ta=CONCAT('Phòng ',r.so_phong,' tại ',p.address,
      '. Diện tích ',r.dien_tich,' m², giá thuê ',FORMAT(r.gia_thue,0,'vi_VN'),
      ' đồng/tháng. Có khu bếp, nhà vệ sinh riêng, cửa sổ thoáng và chỗ để xe. ',
      'Nội thất, chi phí dịch vụ và tình trạng phòng cần xác nhận với chủ trọ.'),
    l.gia_thue=r.gia_thue,
    l.dien_tich=r.dien_tich,
    l.dia_chi=p.address,
    l.so_dien_thoai_lien_he=CONCAT('090',LPAD(9000000+p.n,7,'0')),
    l.trang_thai='DA_DUYET',
    l.ly_do=NULL,
    l.ngay_tao=DATE_SUB(NOW(),INTERVAL (30+p.n) DAY),
    l.ngay_cap_nhat=NOW(),
    l.ngay_gui_duyet=DATE_SUB(NOW(),INTERVAL (28+p.n) DAY),
    l.ngay_duyet=DATE_SUB(NOW(),INTERVAL (27+p.n) DAY),
    l.room_type=r.room_type,
    l.city=p.city,
    l.district=p.district,
    l.amenities=CONCAT('Wi-Fi',CHAR(10),'Điều hòa',CHAR(10),'Khu bếp',CHAR(10),'Nhà vệ sinh riêng');

UPDATE portal_viewing_request v
JOIN seed_demo_id_map m ON m.table_name='portal_viewing_request' AND m.new_id=v.id
JOIN seed_demo_profiles p ON p.n=m.old_id-900000
JOIN seed_demo_id_map l ON l.table_name='tin_dang' AND l.new_id=v.listing_id
SET v.name=p.tenant_name,
    v.phone=CONCAT('093',LPAD(9000000+p.n,7,'0')),
    v.request_type=IF(MOD(p.n,2)=0,'Xem phòng','Đăng ký thuê'),
    v.visit_date=DATE_ADD(CURDATE(),INTERVAL (p.n+1) DAY),
    v.visit_time=MAKETIME(9+MOD(p.n,8),0,0),
    v.note='Vui lòng liên hệ trước khi đến xem phòng.',
    v.status='Chờ xác nhận';

SET @seed_demo_primary_owner=(
  SELECT new_id FROM seed_demo_id_map
  WHERE table_name='tai_khoan' AND old_id=900001
);
SET @seed_demo_primary_building=(
  SELECT new_id FROM seed_demo_id_map
  WHERE table_name='chu_tro' AND old_id=900001
);

SET @seed_demo_next_id=(SELECT COALESCE(MAX(id),0)+1 FROM tai_khoan);
SET @seed_demo_sql=CONCAT('ALTER TABLE tai_khoan AUTO_INCREMENT = ',@seed_demo_next_id);
PREPARE seed_demo_stmt FROM @seed_demo_sql; EXECUTE seed_demo_stmt; DEALLOCATE PREPARE seed_demo_stmt;
SET @seed_demo_next_id=(SELECT COALESCE(MAX(id),0)+1 FROM chu_tro);
SET @seed_demo_sql=CONCAT('ALTER TABLE chu_tro AUTO_INCREMENT = ',@seed_demo_next_id);
PREPARE seed_demo_stmt FROM @seed_demo_sql; EXECUTE seed_demo_stmt; DEALLOCATE PREPARE seed_demo_stmt;
SET @seed_demo_next_id=(SELECT COALESCE(MAX(id),0)+1 FROM nha_tro);
SET @seed_demo_sql=CONCAT('ALTER TABLE nha_tro AUTO_INCREMENT = ',@seed_demo_next_id);
PREPARE seed_demo_stmt FROM @seed_demo_sql; EXECUTE seed_demo_stmt; DEALLOCATE PREPARE seed_demo_stmt;
SET @seed_demo_next_id=(SELECT COALESCE(MAX(id),0)+1 FROM phong);
SET @seed_demo_sql=CONCAT('ALTER TABLE phong AUTO_INCREMENT = ',@seed_demo_next_id);
PREPARE seed_demo_stmt FROM @seed_demo_sql; EXECUTE seed_demo_stmt; DEALLOCATE PREPARE seed_demo_stmt;
SET @seed_demo_next_id=(SELECT COALESCE(MAX(id),0)+1 FROM nguoi_thue);
SET @seed_demo_sql=CONCAT('ALTER TABLE nguoi_thue AUTO_INCREMENT = ',@seed_demo_next_id);
PREPARE seed_demo_stmt FROM @seed_demo_sql; EXECUTE seed_demo_stmt; DEALLOCATE PREPARE seed_demo_stmt;
SET @seed_demo_next_id=(SELECT COALESCE(MAX(id),0)+1 FROM hop_dong);
SET @seed_demo_sql=CONCAT('ALTER TABLE hop_dong AUTO_INCREMENT = ',@seed_demo_next_id);
PREPARE seed_demo_stmt FROM @seed_demo_sql; EXECUTE seed_demo_stmt; DEALLOCATE PREPARE seed_demo_stmt;
SET @seed_demo_next_id=(SELECT COALESCE(MAX(id),0)+1 FROM dich_vu);
SET @seed_demo_sql=CONCAT('ALTER TABLE dich_vu AUTO_INCREMENT = ',@seed_demo_next_id);
PREPARE seed_demo_stmt FROM @seed_demo_sql; EXECUTE seed_demo_stmt; DEALLOCATE PREPARE seed_demo_stmt;
SET @seed_demo_next_id=(SELECT COALESCE(MAX(id),0)+1 FROM hoa_don);
SET @seed_demo_sql=CONCAT('ALTER TABLE hoa_don AUTO_INCREMENT = ',@seed_demo_next_id);
PREPARE seed_demo_stmt FROM @seed_demo_sql; EXECUTE seed_demo_stmt; DEALLOCATE PREPARE seed_demo_stmt;
SET @seed_demo_next_id=(SELECT COALESCE(MAX(id),0)+1 FROM chi_tiet_hoa_don);
SET @seed_demo_sql=CONCAT('ALTER TABLE chi_tiet_hoa_don AUTO_INCREMENT = ',@seed_demo_next_id);
PREPARE seed_demo_stmt FROM @seed_demo_sql; EXECUTE seed_demo_stmt; DEALLOCATE PREPARE seed_demo_stmt;
SET @seed_demo_next_id=(SELECT COALESCE(MAX(id),0)+1 FROM thanh_toan);
SET @seed_demo_sql=CONCAT('ALTER TABLE thanh_toan AUTO_INCREMENT = ',@seed_demo_next_id);
PREPARE seed_demo_stmt FROM @seed_demo_sql; EXECUTE seed_demo_stmt; DEALLOCATE PREPARE seed_demo_stmt;
SET @seed_demo_next_id=(SELECT COALESCE(MAX(id),0)+1 FROM tin_dang);
SET @seed_demo_sql=CONCAT('ALTER TABLE tin_dang AUTO_INCREMENT = ',@seed_demo_next_id);
PREPARE seed_demo_stmt FROM @seed_demo_sql; EXECUTE seed_demo_stmt; DEALLOCATE PREPARE seed_demo_stmt;
SET @seed_demo_next_id=(SELECT COALESCE(MAX(id),0)+1 FROM lich_su_tin_dang);
SET @seed_demo_sql=CONCAT('ALTER TABLE lich_su_tin_dang AUTO_INCREMENT = ',@seed_demo_next_id);
PREPARE seed_demo_stmt FROM @seed_demo_sql; EXECUTE seed_demo_stmt; DEALLOCATE PREPARE seed_demo_stmt;
SET @seed_demo_next_id=(SELECT COALESCE(MAX(id),0)+1 FROM portal_viewing_request);
SET @seed_demo_sql=CONCAT('ALTER TABLE portal_viewing_request AUTO_INCREMENT = ',@seed_demo_next_id);
PREPARE seed_demo_stmt FROM @seed_demo_sql; EXECUTE seed_demo_stmt; DEALLOCATE PREPARE seed_demo_stmt;

DROP TEMPORARY TABLE seed_demo_profiles;
DROP TEMPORARY TABLE seed_demo_id_map;
