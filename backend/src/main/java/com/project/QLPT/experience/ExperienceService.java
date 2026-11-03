package com.project.QLPT.experience;

import static com.project.QLPT.experience.AccountService.*;

import com.project.QLPT.dto.request.*;
import com.project.QLPT.service.support.ViewingRequests;
import com.project.QLPT.enums.*;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.service.*;
import com.project.QLPT.service.support.ListingRules;
import jakarta.persistence.EntityManager;
import jakarta.validation.Validator;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** UI adapter for the dev domain: one account system, owner scope and reviewed listings. */
@Service
@RequiredArgsConstructor
public class ExperienceService {
  private final JdbcTemplate db;
  private final AccountService accounts;
  private final PhongService phong;
  private final NhaTroService houses;
  private final TinDangService listings;
  private final NguoiThueService tenants;
  private final DichVuService services;
  private final HopDongService contracts;
  private final HoaDonService invoices;
  private final ThanhToanService payments;
  private final ThanhVienHopDongService members;
  private final ChiTietHoaDonService lines;
  private final Validator validator;
  private final EntityManager em;
  private final com.project.QLPT.service.UploadService uploads;
  private static final String ROOM_SELECT =
      """
SELECT p.id,p.id roomId,p.so_phong number,p.dien_tich area,p.gia_thue price,
p.trang_thai roomState,p.nha_tro_id buildingId,p.room_type type,
b.ten_nha_tro building,b.dia_chi address,b.city,b.district,
COALESCE(l.tieu_de,CONCAT('Phòng ',p.so_phong)) title,COALESCE(l.mo_ta,'') description,
COALESCE(l.amenities,'') amenities,l.id listingId,l.phien_ban version,l.trang_thai listingState,
l.so_dien_thoai_lien_he phone,IF(l.trang_thai='DA_DUYET',TRUE,FALSE) published,
a.ho_ten hostName,COALESCE(l.so_dien_thoai_lien_he,'') hostPhone
FROM phong p JOIN nha_tro b ON b.id=p.nha_tro_id JOIN chu_tro c ON c.id=b.chu_tro_id
JOIN tai_khoan a ON a.id=c.tai_khoan_id LEFT JOIN tin_dang l ON l.phong_id=p.id
""";
  private static final String PUBLIC =
      "l.trang_thai='DA_DUYET' AND p.trang_thai='TRONG' AND a.hoat_dong=TRUE AND b.active=TRUE";

  private List<Map<String, Object>> hydrate(List<Map<String, Object>> rows) {
    for (var r : rows) {
      r.put("amenities", split(r.get("amenities")));
      var images =
          r.get("listingId") == null
              ? List.<String>of()
              : db.queryForList(
                  "SELECT url FROM tin_dang_anh WHERE tin_dang_id=? ORDER BY thu_tu",
                  String.class,
                  r.get("listingId"));
      r.put("images", images);
      r.put("photo", images.isEmpty() ? null : images.getFirst());
      r.put("available", "TRONG".equals(r.get("roomState")));
      r.put(
          "published",
          Boolean.TRUE.equals(r.get("published")) || Objects.equals(r.get("published"), 1));
      r.put("roomStatus", label(Objects.toString(r.get("roomState"))));
      r.put("publishedStatus", label(Objects.toString(r.get("listingState"), "NHAP")));
      r.put(
          "canSubmit",
          r.get("listingState") != null
              && ListingRules.canSubmit(
                  TrangThaiTinDang.valueOf(r.get("listingState").toString()),
                  TrangThaiPhong.valueOf(r.get("roomState").toString()),
                  images.size()));
      r.put(
          "canEdit",
          r.get("listingState") == null
              || ListingRules.editable(TrangThaiTinDang.valueOf(r.get("listingState").toString())));
      r.put(
          "fees",
          db.queryForList(
              "SELECT d.id,d.ten_dich_vu name,d.don_vi_tinh unit,d.don_gia_hien_tai"
                  + " price,IF(d.tinh_theo_chi_so,'Theo chỉ số','Cố định') mode FROM dich_vu d JOIN"
                  + " nha_tro b ON b.chu_tro_id=d.chu_tro_id JOIN phong p ON p.nha_tro_id=b.id"
                  + " WHERE p.id=? AND d.dang_hoat_dong=TRUE ORDER BY d.id",
              r.get("roomId")));
    }
    return rows;
  }

  private List<String> split(Object value) {
    return Arrays.stream(Objects.toString(value, "").split("\\n"))
        .map(String::trim)
        .filter(v -> !v.isBlank())
        .toList();
  }

  public List<String> uploadImages(org.springframework.web.multipart.MultipartFile[] files) {
    return uploads.storeImages(files);
  }

  public List<Map<String, Object>> catalog() {
    var rows =
        db.queryForList(
            """
            SELECT l.id,l.id listingId,l.phong_id roomId,l.tieu_de title,l.mo_ta description,
            l.gia_thue price,l.dien_tich area,l.dia_chi address,l.room_type type,
            COALESCE(NULLIF(l.city,''),'Chưa cập nhật') city,l.district,
            COALESCE(l.amenities,'') amenities,b.ten_nha_tro building,p.so_phong number,
            p.trang_thai roomState,l.trang_thai listingState,TRUE published,a.ho_ten hostName,
            l.so_dien_thoai_lien_he hostPhone
            FROM tin_dang l JOIN phong p ON p.id=l.phong_id JOIN nha_tro b ON b.id=p.nha_tro_id
            JOIN chu_tro c ON c.id=b.chu_tro_id JOIN tai_khoan a ON a.id=c.tai_khoan_id WHERE
            """
                + PUBLIC
                + " ORDER BY l.id DESC");
    hydrate(rows);
    for (var row : rows) {
      row.remove("roomId");
      row.remove("listingId");
    }
    return rows;
  }

  @Transactional(readOnly = true)
  public Map<String, Object> state(Long account) {
    Map<String, Object> result = new LinkedHashMap<>();
    var publicRooms = catalog();
    result.put("publicRooms", publicRooms);
    result.put("rooms", publicRooms);
    result.put("user", null);
    for (String key :
        List.of(
            "listings",
            "buildings",
            "tenants",
            "services",
            "contracts",
            "invoices",
            "payments",
            "requests",
            "saved")) result.put(key, List.of());
    if (account == null) return result;
    var user = accounts.profile(account);
    result.put("user", user);
    boolean owner = "owner".equals(user.get("role"));
    int scopeId = owner ? accounts.ownerId(account) : account.intValue();
    if (owner) {
      var own =
          hydrate(
              db.queryForList(ROOM_SELECT + " WHERE b.chu_tro_id=? ORDER BY p.id DESC", scopeId));
      result.put("rooms", own);
      var ownListings = new ArrayList<Map<String, Object>>();
      for (var room : own)
        if (room.get("listingId") != null) {
          var listing = new LinkedHashMap<>(room);
          listing.put("id", room.get("listingId"));
          ownListings.add(listing);
        }
      result.put("listings", ownListings);
      result.put(
          "buildings",
          db.queryForList(
              "SELECT id,ten_nha_tro name,dia_chi address,city,district,manager,IF(active,'Đang"
                  + " hoạt động','Tạm ngưng') status FROM nha_tro WHERE chu_tro_id=? ORDER BY id"
                  + " DESC",
              scopeId));
      result.put(
          "tenants",
          db.queryForList(
              "SELECT id,ho_ten name,cccd,so_dien_thoai phone,ngay_sinh birthday,dia_chi_thuong_tru"
                  + " address,(tai_khoan_id IS NOT NULL) linked FROM nguoi_thue WHERE chu_tro_id=?"
                  + " ORDER BY id DESC",
              scopeId));
      result.put(
          "services",
          db.queryForList(
              "SELECT id,ten_dich_vu name,don_vi_tinh unit,don_gia_hien_tai"
                  + " price,IF(tinh_theo_chi_so,'Theo chỉ số','Cố định')"
                  + " mode,IF(dang_hoat_dong,'Đang áp dụng','Tạm ngưng') status FROM dich_vu WHERE"
                  + " chu_tro_id=? ORDER BY id DESC",
              scopeId));
    }
    String scope =
        owner
            ? "EXISTS(SELECT 1 FROM nha_tro b WHERE b.id=p.nha_tro_id AND b.chu_tro_id=?)"
            : "EXISTS(SELECT 1 FROM thanh_vien_hop_dong tv JOIN nguoi_thue n ON"
                  + " n.id=tv.nguoi_thue_id WHERE tv.hop_dong_id=h.id AND n.tai_khoan_id=?)";
    var cs =
        db.queryForList(
            "SELECT h.id,h.phong_id roomId,p.so_phong room,b.ten_nha_tro building,h.ngay_bat_dau"
                + " start,h.ngay_ket_thuc end,h.gia_thue_thoa_thuan price,h.tien_coc"
                + " deposit,h.trang_thai state,h.ngay_ket_thuc_thuc_te actualEnd,h.ly_do_ket_thuc"
                + " endReason,h.tien_coc_hoan_tra depositRefund,h.ghi_chu_quyet_toan"
                + " settlementNote FROM hop_dong h JOIN phong p ON p.id=h.phong_id JOIN nha_tro b ON"
                + " b.id=p.nha_tro_id WHERE "
                + scope
                + " ORDER BY h.id DESC",
            scopeId);
    for (var c : cs) {
      var ms =
          db.queryForList(
              "SELECT n.id,n.ho_ten name,t.ngay_vao joined,t.ngay_roi departed,t.la_dai_dien"
                  + " representative FROM thanh_vien_hop_dong t JOIN nguoi_thue n ON"
                  + " n.id=t.nguoi_thue_id WHERE t.hop_dong_id=? ORDER BY (t.ngay_roi IS NULL)"
                  + " DESC,t.la_dai_dien DESC,n.id",
              c.get("id"));
      c.put("memberRecords", ms);
      c.put("members", ms.stream().map(m -> m.get("name")).toList());
      c.put(
          "name",
          ms.stream()
              .filter(m -> Boolean.TRUE.equals(m.get("representative")))
              .map(m -> m.get("name"))
              .findFirst()
              .orElse("Chưa có đại diện"));
      c.put("status", label(c.get("state").toString()));
    }
    result.put("contracts", cs);
    var bills =
        db.queryForList(
            """
SELECT i.id,i.hop_dong_id contractId,p.so_phong room,i.ky_thanh_toan period,i.ngay_lap issued,i.han_thanh_toan due,i.tien_phong rent,i.trang_thai state,
i.tien_phong+COALESCE((SELECT SUM(ROUND(ct.so_luong*ct.don_gia,0)) FROM chi_tiet_hoa_don ct WHERE ct.hoa_don_id=i.id),0) amount,
COALESCE((SELECT SUM(tt.so_tien) FROM thanh_toan tt WHERE tt.hoa_don_id=i.id),0) paid
FROM hoa_don i JOIN hop_dong h ON h.id=i.hop_dong_id JOIN phong p ON p.id=h.phong_id WHERE
"""
                + scope
                + " ORDER BY i.id DESC",
            scopeId);
    for (var bill : bills) {
      bill.put("status", label(bill.get("state").toString()));
      bill.put("month", bill.get("period").toString().substring(0, 7));
      bill.put(
          "name",
          cs.stream()
              .filter(c -> c.get("id").equals(bill.get("contractId")))
              .map(c -> c.get("name"))
              .findFirst()
              .orElse(""));
      bill.put(
          "remaining",
          new BigDecimal(bill.get("amount").toString())
              .subtract(new BigDecimal(bill.get("paid").toString())));
      bill.put(
          "lines",
          db.queryForList(
              "SELECT ct.id,ct.dich_vu_id serviceId,d.ten_dich_vu name,d.don_vi_tinh"
                  + " unit,ct.chi_so_cu oldIndex,ct.chi_so_moi newIndex,ct.so_luong"
                  + " quantity,ct.don_gia price,ROUND(ct.so_luong*ct.don_gia,0) amount FROM"
                  + " chi_tiet_hoa_don ct JOIN dich_vu d ON d.id=ct.dich_vu_id WHERE"
                  + " ct.hoa_don_id=? ORDER BY ct.id",
              bill.get("id")));
    }
    result.put("invoices", bills);
    var ps =
        db.queryForList(
            "SELECT t.id,t.hoa_don_id invoice,p.so_phong room,t.ngay_thanh_toan date,t.so_tien"
                + " amount,t.phuong_thuc methodCode,t.ma_giao_dich reference FROM thanh_toan t JOIN"
                + " hoa_don i ON i.id=t.hoa_don_id JOIN hop_dong h ON h.id=i.hop_dong_id JOIN phong"
                + " p ON p.id=h.phong_id WHERE "
                + scope
                + " ORDER BY t.ngay_thanh_toan DESC,t.id DESC",
            scopeId);
    for (var payment : ps) {
      payment.put("method", label(payment.get("methodCode").toString()));
      payment.put("status", "Đã ghi nhận");
    }
    result.put("payments", ps);
    result.put(
        "saved",
        db.queryForList(
            "SELECT listing_id FROM portal_favorite WHERE account_id=?", Integer.class, account));
    result.put(
        "requests",
        db.queryForList(
            "SELECT v.id,v.listing_id roomId,v.visit_date date,TIME_FORMAT(v.visit_time,'%H:%i')"
                + " time,v.name,v.phone,v.request_type type,v.note,IF(v.status=? AND"
                + " TIMESTAMP(v.visit_date,v.visit_time)<?,?,v.status) status,"
                + "TIMESTAMP(v.visit_date,v.visit_time)<? past,v.hold_deposit holdDeposit,"
                + "v.hold_until holdUntil,v.contract_id contractId,p.id roomRecordId,p.so_phong"
                + " room,b.ten_nha_tro building,l.tieu_de title FROM portal_viewing_request v JOIN"
                + " tin_dang l ON l.id=v.listing_id JOIN phong p ON p.id=l.phong_id JOIN nha_tro b"
                + " ON b.id=p.nha_tro_id WHERE "
                + (owner ? "b.chu_tro_id=?" : "v.account_id=?")
                + " ORDER BY v.id DESC",
            ViewingRequests.CHO_XAC_NHAN,
            ViewingRequests.now(),
            ViewingRequests.HET_HAN,
            ViewingRequests.now(),
            scopeId));
    return normalizeDates(result);
  }

  public void owned(long account, String kind, int id) {
    int owner = accounts.ownerId(account);
    String query =
        switch (kind) {
          case "buildings" -> "SELECT COUNT(*) FROM nha_tro WHERE id=? AND chu_tro_id=?";
          case "rooms" ->
              "SELECT COUNT(*) FROM phong p JOIN nha_tro b ON b.id=p.nha_tro_id WHERE p.id=? AND"
                  + " b.chu_tro_id=?";
          case "tenants" -> "SELECT COUNT(*) FROM nguoi_thue WHERE id=? AND chu_tro_id=?";
          case "services" -> "SELECT COUNT(*) FROM dich_vu WHERE id=? AND chu_tro_id=?";
          case "listings" ->
              "SELECT COUNT(*) FROM tin_dang l JOIN phong p ON p.id=l.phong_id JOIN nha_tro b ON"
                  + " b.id=p.nha_tro_id WHERE l.id=? AND b.chu_tro_id=?";
          case "contracts" ->
              "SELECT COUNT(*) FROM hop_dong h JOIN phong p ON p.id=h.phong_id JOIN nha_tro b ON"
                  + " b.id=p.nha_tro_id WHERE h.id=? AND b.chu_tro_id=?";
          case "invoices" ->
              "SELECT COUNT(*) FROM hoa_don i JOIN hop_dong h ON h.id=i.hop_dong_id JOIN phong p ON"
                  + " p.id=h.phong_id JOIN nha_tro b ON b.id=p.nha_tro_id WHERE i.id=? AND"
                  + " b.chu_tro_id=?";
          case "payments" ->
              "SELECT COUNT(*) FROM thanh_toan t JOIN hoa_don i ON i.id=t.hoa_don_id JOIN hop_dong"
                  + " h ON h.id=i.hop_dong_id JOIN phong p ON p.id=h.phong_id JOIN nha_tro b ON"
                  + " b.id=p.nha_tro_id WHERE t.id=? AND b.chu_tro_id=?";
          default ->
              throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Loại dữ liệu không hợp lệ.");
        };
    if (db.queryForObject(query, Integer.class, id, owner) != 1)
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi.");
  }

  @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
  public void save(long owner, String kind, Integer id, Map<String, Object> d) {
    accounts.owner(owner);
    if (id != null) owned(owner, kind, id);
    switch (kind) {
      case "buildings" -> {
        var request = valid(new NhaTroRequest(text(d, "name", 255), text(d, "address", 500)));
        int building = id == null ? houses.create(request).id() : houses.update(id, request).id();
        em.flush();
        db.update(
            "UPDATE nha_tro SET city=?,district=?,manager=?,active=? WHERE id=?",
            text(d, "city", 100),
            text(d, "district", 100),
            text(d, "manager", 255),
            !"Tạm ngưng".equals(d.get("status")),
            building);
      }
      case "rooms" -> {
        int building = integer(d, "buildingId");
        owned(owner, "buildings", building);
        var req =
            valid(
                new PhongRequest(
                    building, text(d, "number", 50), decimal(d, "area"), decimal(d, "price")));
        String type = text(d, "type", 50);
        if (!Set.of("Phòng trọ", "Studio", "Căn hộ mini").contains(type))
          throw new BusinessException("Loại phòng không hợp lệ.");
        int room = id == null ? phong.create(req).id() : phong.update(id, req).id();
        em.flush();
        db.update("UPDATE phong SET room_type=? WHERE id=?", type, room);
        if (id != null && d.containsKey("roomState")) {
          var current = phong.getById(room).trangThai();
          var next = TrangThaiPhong.valueOf(text(d, "roomState", 30));
          if (next != current) phong.updateTrangThai(room, valid(new TrangThaiPhongRequest(next)));
        }
      }
      case "tenants" -> {
        var req =
            valid(
                new NguoiThueRequest(
                    text(d, "name", 255),
                    text(d, "cccd", 20),
                    optional(d, "phone", 20),
                    dateOptional(d, "birthday"),
                    optional(d, "address", 500)));
        int tenant = id == null ? tenants.create(req).id() : tenants.update(id, req).id();
        em.flush();
      }
      case "services" -> {
        var req =
            valid(
                new DichVuRequest(
                    text(d, "name", 255),
                    text(d, "unit", 50),
                    decimal(d, "price"),
                    "Theo chỉ số".equals(d.get("mode")),
                    "Đang áp dụng".equals(d.get("status"))));
        int service = id == null ? services.create(req).id() : services.update(id, req).id();
        em.flush();
      }
      case "contracts" -> {
        int room = integer(d, "roomId");
        owned(owner, "rooms", room);
        var req =
            valid(
                new HopDongRequest(
                    room,
                    date(d, "start"),
                    date(d, "end"),
                    decimal(d, "price"),
                    decimal(d, "deposit")));
        if (id != null) {
          contracts.update(id, req);
          em.flush();
          return;
        }
        // Hợp đồng phải có người đại diện ngay khi lập.
        if (optional(d, "tenantId", 20).isEmpty())
          throw new BusinessException("Hợp đồng cần có người thuê đại diện.");
        int tenant = integer(d, "tenantId");
        owned(owner, "tenants", tenant);
        // Lập từ yêu cầu giữ chỗ (nếu có): khóa phòng trước rồi tới yêu cầu, cùng thứ tự với
        // requestStatus để tránh deadlock.
        Integer hold = optional(d, "requestId", 20).isEmpty() ? null : integer(d, "requestId");
        if (hold != null) {
          db.queryForList("SELECT id FROM phong WHERE id=? FOR UPDATE", room);
          var held =
              db.queryForList(
                  "SELECT v.status,l.phong_id room FROM portal_viewing_request v JOIN tin_dang l"
                      + " ON l.id=v.listing_id WHERE v.id=? FOR UPDATE",
                  hold);
          if (held.isEmpty()
              || ((Number) held.getFirst().get("room")).intValue() != room
              || !ViewingRequests.DA_GIU_CHO.equals(held.getFirst().get("status")))
            throw new BusinessException("Yêu cầu giữ chỗ không hợp lệ cho phòng này.");
        }
        int contract = contracts.create(req, hold != null).id();
        em.flush();
        // Lập hợp đồng và người đại diện ban đầu trong cùng một giao dịch.
        members.create(
            contract, valid(new ThanhVienHopDongRequest(tenant, req.ngayBatDau(), null, true)));
        if (hold != null)
          db.update(
              "UPDATE portal_viewing_request SET status=?,contract_id=?,processed_by=?,"
                  + "updated_at=CURRENT_TIMESTAMP WHERE id=?",
              ViewingRequests.DA_LAP_HOP_DONG,
              contract,
              owner,
              hold);
      }
      case "invoices" -> {
        int contract = integer(d, "contractId");
        owned(owner, "contracts", contract);
        var req =
            valid(
                new HoaDonRequest(
                    contract,
                    date(d, "period"),
                    date(d, "issued"),
                    date(d, "due"),
                    decimal(d, "rent")));
        if (id == null) invoices.create(req);
        else invoices.update(id, req);
      }
      case "payments" -> {
        int invoice = integer(d, "invoice");
        owned(owner, "invoices", invoice);
        String dt = text(d, "date", 30);
        var req =
            valid(
                new ThanhToanRequest(
                    invoice,
                    LocalDateTime.parse(dt.length() == 10 ? dt + "T00:00:00" : dt),
                    decimal(d, "amount"),
                    PhuongThucThanhToan.valueOf(text(d, "methodCode", 30)),
                    optional(d, "reference", 255)));
        if (id == null) payments.create(req);
        else payments.update(id, req);
      }
      case "listings" -> {
        int room = id == null ? integer(d, "roomId") : listings.ownerGet(id).phongId();
        owned(owner, "rooms", room);
        var imageList = split(optional(d, "images", 20000));
        var request =
            valid(
                new TinDangRequest(
                    room,
                    text(d, "title", 255),
                    text(d, "description", 8000),
                    d.containsKey("price") ? decimal(d, "price") : phong.getById(room).giaThue(),
                    text(d, "phone", 30),
                    imageList,
                    id == null ? null : integerZero(d, "version")));
        var saved = id == null ? listings.create(request) : listings.update(id, request);
        em.flush();
        db.update(
            "UPDATE tin_dang l JOIN phong p ON p.id=l.phong_id JOIN nha_tro b ON b.id=p.nha_tro_id"
                + " SET l.room_type=p.room_type,l.city=b.city,l.district=b.district,l.amenities=?"
                + " WHERE l.id=?",
            optional(d, "amenities", 2000).replace(",", "\n"),
            saved.id());
        if (Boolean.parseBoolean(Objects.toString(d.get("published"), "false")))
          listings.submit(saved.id(), new TinDangActionRequest(saved.phienBan(), null));
      }
      default ->
          throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Loại dữ liệu không hợp lệ.");
    }
    em.flush();
  }

  @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
  public void delete(long owner, String kind, int id, Integer version) {
    owned(owner, kind, id);
    switch (kind) {
      case "buildings" -> houses.delete(id);
      case "rooms" -> phong.delete(id);
      case "tenants" -> tenants.delete(id);
      case "services" -> services.delete(id);
      case "invoices" -> invoices.delete(id);
      case "payments" -> payments.delete(id);
      case "listings" -> listings.delete(id, version);
      case "contracts" ->
          throw new BusinessException("Hợp đồng cần kết thúc hoặc hủy để giữ lịch sử.");
      default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    em.flush();
  }

  @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
  public void contractAction(long owner, int contract, String action, Map<String, Object> d) {
    owned(owner, "contracts", contract);
    if ("cancel".equals(action)) contracts.huy(contract, optional(d, "reason", 500));
    else if ("end".equals(action))
      contracts.ketThuc(
          contract,
          valid(
              new KetThucHopDongRequest(
                  date(d, "actualEnd"),
                  text(d, "reason", 500),
                  decimalOptional(d, "depositRefund"),
                  optional(d, "settlementNote", 500))));
    else throw new BusinessException("Thao tác không hợp lệ.");
    em.flush();
  }

  @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
  public void member(
      long owner, int contract, Integer tenant, String method, Map<String, Object> d) {
    owned(owner, "contracts", contract);
    if (tenant != null) owned(owner, "tenants", tenant);
    if ("DELETE".equals(method)) {
      members.delete(contract, tenant);
      em.flush();
      return;
    }
    int person = tenant == null ? integer(d, "tenantId") : tenant;
    owned(owner, "tenants", person);
    var req =
        valid(
            new ThanhVienHopDongRequest(
                person,
                date(d, "joined"),
                dateOptional(d, "departed"),
                Boolean.parseBoolean(Objects.toString(d.get("representative"), "false"))));
    if (tenant == null) members.create(contract, req);
    else members.update(contract, person, req);
    em.flush();
  }

  @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
  public void line(long owner, int invoice, Integer line, String method, Map<String, Object> d) {
    owned(owner, "invoices", invoice);
    if ("DELETE".equals(method)) {
      lines.delete(invoice, line);
      em.flush();
      return;
    }
    int service = integer(d, "serviceId");
    owned(owner, "services", service);
    var req =
        valid(
            new ChiTietHoaDonRequest(
                service,
                decimalOptional(d, "oldIndex"),
                decimalOptional(d, "newIndex"),
                decimalOptional(d, "quantity"),
                decimalOptional(d, "price")));
    if (line == null) lines.create(invoice, req);
    else lines.update(invoice, line, req);
    em.flush();
  }

  @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
  public void listingAction(long account, int id, String action, Map<String, Object> d) {
    owned(account, "listings", id);
    var request = new TinDangActionRequest(integerZero(d, "version"), null);
    switch (action) {
      case "submit" -> listings.submit(id, request);
      case "withdraw" -> listings.withdraw(id, request);
      case "hide" -> listings.hideOwner(id, request);
      default -> throw new BusinessException("Thao tác không hợp lệ.");
    }
  }

  private List<Map<String, Object>> publicListing(int id) {
    return db.queryForList(
        "SELECT p.id FROM tin_dang l JOIN phong p ON p.id=l.phong_id JOIN nha_tro b ON"
            + " b.id=p.nha_tro_id JOIN chu_tro c ON c.id=b.chu_tro_id JOIN tai_khoan a ON"
            + " a.id=c.tai_khoan_id WHERE l.id=? AND "
            + PUBLIC,
        id);
  }

  @Transactional
  public void favorite(long account, int listing, boolean add) {
    if (add) {
      if (publicListing(listing).isEmpty())
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tin không còn hiển thị.");
      db.update(
          "INSERT IGNORE INTO portal_favorite(account_id,listing_id) VALUES(?,?)",
          account,
          listing);
    } else
      db.update(
          "DELETE FROM portal_favorite WHERE account_id=? AND listing_id=?", account, listing);
  }

  @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
  public void request(long account, Map<String, Object> d) {
    if (!"tenant".equals(accounts.profile(account).get("role")))
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Yêu cầu xem và thuê phòng dành cho người thuê.");
    int listing = integer(d, "roomId");
    var first = publicListing(listing);
    if (first.isEmpty()) throw new BusinessException("Tin không còn nhận lịch xem.");
    db.queryForList("SELECT id FROM phong WHERE id=? FOR UPDATE", first.getFirst().get("id"));
    if (publicListing(listing).isEmpty())
      throw new BusinessException("Tin không còn nhận lịch xem.");
    LocalDate day = date(d, "date");
    LocalTime time = LocalTime.parse(text(d, "time", 8));
    if (LocalDateTime.of(day, time).isBefore(ViewingRequests.now()))
      throw new BusinessException("Vui lòng chọn thời gian trong tương lai.");
    if (time.isBefore(ViewingRequests.OPENING) || time.isAfter(ViewingRequests.CLOSING))
      throw new BusinessException("Chỉ nhận lịch trong khung 07:00–21:00.");
    if (day.isAfter(ViewingRequests.now().toLocalDate().plusDays(ViewingRequests.MAX_DAYS_AHEAD)))
      throw new BusinessException(
          "Chỉ đặt lịch trong vòng " + ViewingRequests.MAX_DAYS_AHEAD + " ngày tới.");
    String type = text(d, "type", 30);
    if (!Set.of(ViewingRequests.XEM_PHONG, ViewingRequests.DANG_KY_THUE).contains(type))
      throw new BusinessException("Loại yêu cầu không hợp lệ.");
    if (db.queryForObject(
            "SELECT COUNT(*) FROM portal_viewing_request WHERE account_id=? AND listing_id=? AND"
                + " status IN (?,?) AND TIMESTAMP(visit_date,visit_time)>=?",
            Integer.class,
            account,
            listing,
            ViewingRequests.CHO_XAC_NHAN,
            ViewingRequests.DA_XAC_NHAN,
            ViewingRequests.now())
        > 0) throw new BusinessException("Bạn đã có yêu cầu đang chờ xử lý cho phòng này.");
    db.update(
        "INSERT INTO"
            + " portal_viewing_request(account_id,listing_id,visit_date,visit_time,name,phone,request_type,note)"
            + " VALUES(?,?,?,?,?,?,?,?)",
        account,
        listing,
        day,
        time,
        text(d, "name", 255),
        text(d, "phone", 20),
        type,
        optional(d, "note", 1000));
  }

  /**
   * Chuyển trạng thái yêu cầu xem/thuê. Xem sơ đồ vòng đời ở {@link ViewingRequests}.
   *
   * <p>Người thuê: hủy yêu cầu mở (trước giờ hẹn) hoặc hủy giữ chỗ. Chủ trọ: xác nhận/từ chối
   * yêu cầu chờ (trước giờ hẹn), ghi nhận đã xem/không đến (sau giờ hẹn), giữ chỗ, hủy giữ chỗ.
   */
  @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
  public void requestStatus(long account, int id, Map<String, Object> d) {
    var head =
        db.queryForList(
            "SELECT l.phong_id FROM portal_viewing_request v JOIN tin_dang l ON l.id=v.listing_id"
                + " WHERE v.id=?",
            id);
    if (head.isEmpty())
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu.");
    int room = ((Number) head.getFirst().get("phong_id")).intValue();
    // Khóa phòng trước rồi mới tới yêu cầu: cùng thứ tự với đặt lịch và lập hợp đồng.
    db.queryForList("SELECT id FROM phong WHERE id=? FOR UPDATE", room);
    var rows =
        db.queryForList(
            "SELECT v.account_id,c.tai_khoan_id owner_account_id,v.status,v.request_type type,"
                + "v.visit_date,v.visit_time,TIMESTAMP(v.visit_date,v.visit_time)<? past,"
                + "p.trang_thai room_state FROM portal_viewing_request v JOIN tin_dang l ON"
                + " l.id=v.listing_id JOIN phong p ON p.id=l.phong_id JOIN nha_tro b ON"
                + " b.id=p.nha_tro_id JOIN chu_tro c ON c.id=b.chu_tro_id WHERE v.id=? FOR UPDATE",
            ViewingRequests.now(),
            id);
    var row = rows.getFirst();
    String status = text(d, "status", 30);
    boolean owner = ((Number) row.get("owner_account_id")).longValue() == account;
    boolean tenant = ((Number) row.get("account_id")).longValue() == account;
    if (!owner && !tenant) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    String previous = row.get("status").toString();
    Object pastValue = row.get("past");
    boolean past =
        pastValue instanceof Boolean b ? b : ((Number) pastValue).intValue() != 0;
    String roomState = Objects.toString(row.get("room_state"));
    String processed = "Yêu cầu đã được xử lý. Vui lòng tải lại.";
    String next = status;
    BigDecimal holdDeposit = null;
    LocalDate holdUntil = null;

    if (tenant) {
      if (!ViewingRequests.DA_HUY.equals(status))
        throw new ResponseStatusException(HttpStatus.FORBIDDEN);
      if (ViewingRequests.OPEN.contains(previous)) {
        if (past) throw new BusinessException("Lịch hẹn đã qua, không thể hủy yêu cầu.");
      } else if (ViewingRequests.DA_GIU_CHO.equals(previous)) {
        next = ViewingRequests.HUY_GIU_CHO;
        releaseHold(room);
      } else throw new BusinessException(processed);
    } else {
      switch (status) {
        case ViewingRequests.DA_XAC_NHAN, ViewingRequests.DA_TU_CHOI -> {
          if (!ViewingRequests.CHO_XAC_NHAN.equals(previous))
            throw new BusinessException(processed);
          if (past)
            throw new BusinessException("Lịch hẹn đã qua, không thể cập nhật yêu cầu.");
          if (ViewingRequests.DA_XAC_NHAN.equals(status)) {
            if (!"TRONG".equals(roomState))
              throw new BusinessException("Phòng không còn trống, không thể xác nhận lịch hẹn.");
            // Không xác nhận hai lịch trùng giờ cho cùng một phòng.
            Integer clash =
                db.queryForObject(
                    "SELECT COUNT(*) FROM portal_viewing_request v JOIN tin_dang l ON"
                        + " l.id=v.listing_id WHERE l.phong_id=? AND v.id<>? AND v.status=? AND"
                        + " ABS(TIMESTAMPDIFF(MINUTE,TIMESTAMP(v.visit_date,v.visit_time),"
                        + "TIMESTAMP(?,?)))<?",
                    Integer.class,
                    room,
                    id,
                    ViewingRequests.DA_XAC_NHAN,
                    row.get("visit_date"),
                    row.get("visit_time"),
                    ViewingRequests.SLOT_MINUTES);
            if (clash != null && clash > 0)
              throw new BusinessException(
                  "Đã có lịch xem khác được xác nhận trong vòng "
                      + ViewingRequests.SLOT_MINUTES
                      + " phút; hãy hẹn khách giờ khác.");
          }
        }
        case ViewingRequests.DA_XEM, ViewingRequests.KHONG_DEN -> {
          if (!ViewingRequests.DA_XAC_NHAN.equals(previous))
            throw new BusinessException(processed);
          if (!past) throw new BusinessException("Chỉ ghi nhận kết quả sau giờ hẹn.");
        }
        case ViewingRequests.DA_GIU_CHO -> {
          boolean allowed =
              ViewingRequests.DA_XAC_NHAN.equals(previous)
                  || ViewingRequests.DA_XEM.equals(previous)
                  || ViewingRequests.CHO_XAC_NHAN.equals(previous)
                      && ViewingRequests.DANG_KY_THUE.equals(row.get("type"));
          if (!allowed)
            throw new BusinessException(
                "Chỉ giữ chỗ cho yêu cầu đã xác nhận/đã xem, hoặc yêu cầu đăng ký thuê.");
          if (!"TRONG".equals(roomState))
            throw new BusinessException("Phòng không còn trống, không thể giữ chỗ.");
          holdDeposit = decimal(d, "holdDeposit");
          if (holdDeposit.signum() < 0)
            throw new BusinessException("Tiền cọc giữ chỗ không được âm.");
          holdUntil = date(d, "holdUntil");
          LocalDate today = ViewingRequests.now().toLocalDate();
          if (holdUntil.isBefore(today)
              || holdUntil.isAfter(today.plusDays(ViewingRequests.MAX_HOLD_DAYS)))
            throw new BusinessException(
                "Hạn giữ chỗ phải từ hôm nay đến tối đa "
                    + ViewingRequests.MAX_HOLD_DAYS
                    + " ngày tới.");
        }
        case ViewingRequests.HUY_GIU_CHO -> {
          if (!ViewingRequests.DA_GIU_CHO.equals(previous))
            throw new BusinessException(processed);
          releaseHold(room);
        }
        default -> throw new ResponseStatusException(HttpStatus.FORBIDDEN);
      }
    }
    db.update(
        "UPDATE portal_viewing_request SET status=?,hold_deposit=COALESCE(?,hold_deposit),"
            + "hold_until=COALESCE(?,hold_until),processed_by=?,updated_at=CURRENT_TIMESTAMP"
            + " WHERE id=?",
        next,
        holdDeposit,
        holdUntil,
        account,
        id);
    if (ViewingRequests.DA_GIU_CHO.equals(next)) {
      // Giữ chỗ: phòng chuyển sang đã đặt, tin bị ẩn, các yêu cầu mở khác được đóng
      // (yêu cầu này đã ở trạng thái giữ chỗ nên không bị đóng).
      db.update("UPDATE phong SET trang_thai='DA_DAT' WHERE id=? AND trang_thai='TRONG'", room);
      listings.roomUnavailable(room);
    }
  }

  /** Hủy giữ chỗ: trả phòng về trống nếu chưa có hợp đồng nào chiếm phòng. */
  private void releaseHold(int room) {
    db.update(
        "UPDATE phong p SET p.trang_thai='TRONG' WHERE p.id=? AND p.trang_thai='DA_DAT' AND NOT"
            + " EXISTS(SELECT 1 FROM hop_dong h WHERE h.phong_id=p.id AND h.trang_thai IN"
            + " ('DANG_HIEU_LUC','HET_HAN'))",
        room);
  }

  private int integerZero(Map<String, Object> d, String key) {
    try {
      int value = Integer.parseInt(text(d, key, 20));
      if (value < 0) throw new NumberFormatException();
      return value;
    } catch (NumberFormatException e) {
      throw new BusinessException("Phiên bản không hợp lệ. Vui lòng tải lại dữ liệu.");
    }
  }

  private <T> T valid(T value) {
    var errors = validator.validate(value);
    if (!errors.isEmpty()) throw new BusinessException(errors.iterator().next().getMessage());
    return value;
  }

  private Object[] append(Object[] values, Object last) {
    var a = Arrays.copyOf(values, values.length + 1);
    a[a.length - 1] = last;
    return a;
  }

  private int integer(Map<String, Object> d, String key) {
    try {
      int i = Integer.parseInt(text(d, key, 20));
      if (i < 1) throw new NumberFormatException();
      return i;
    } catch (NumberFormatException e) {
      throw new BusinessException("Vui lòng chọn " + key + " hợp lệ.");
    }
  }

  private BigDecimal decimal(Map<String, Object> d, String key) {
    BigDecimal n = decimalOptional(d, key);
    if (n == null) throw new BusinessException("Vui lòng nhập " + key + ".");
    return n;
  }

  private BigDecimal decimalOptional(Map<String, Object> d, String key) {
    String s = optional(d, key, 30);
    if (s.isEmpty()) return null;
    BigDecimal value = new BigDecimal(s), stripped = value.stripTrailingZeros();
    int scale =
        "area".equals(key) ? 2 : Set.of("oldIndex", "newIndex", "quantity").contains(key) ? 3 : 0;
    int digits = "area".equals(key) ? 8 : scale == 3 ? 16 : 19;
    if (stripped.scale() > scale || (long) stripped.precision() - stripped.scale() > digits)
      throw new BusinessException(
          "Giá trị " + key + " vượt độ chính xác cho phép. Số tiền cần là số nguyên VND.");
    return value;
  }

  private LocalDate date(Map<String, Object> d, String key) {
    return LocalDate.parse(text(d, key, 10));
  }

  private LocalDate dateOptional(Map<String, Object> d, String key) {
    String s = optional(d, key, 10);
    return s.isEmpty() ? null : LocalDate.parse(s);
  }

  public static Map<String, Object> normalizeDates(Map<String, Object> map) {
    map.replaceAll((key, value) -> normalize(value));
    return map;
  }

  private static Object normalize(Object value) {
    if (value instanceof java.sql.Date date) return date.toLocalDate().toString();
    if (value instanceof java.sql.Timestamp time) return time.toLocalDateTime().toString();
    if (value instanceof Map<?, ?> map) {
      Map<String, Object> copy = new LinkedHashMap<>();
      map.forEach((key, v) -> copy.put(key.toString(), normalize(v)));
      return copy;
    }
    if (value instanceof List<?> list)
      return list.stream().map(ExperienceService::normalize).toList();
    return value;
  }

  public static String label(String value) {
    return switch (value) {
      case "NHAP" -> "Bản nháp";
      case "CHO_DUYET" -> "Chờ duyệt";
      case "DA_DUYET" -> "Đã duyệt";
      case "TU_CHOI" -> "Từ chối";
      case "DA_AN" -> "Đã ẩn";
      case "TRONG" -> "Còn trống";
      case "DA_DAT" -> "Đã giữ chỗ";
      case "DANG_THUE" -> "Đang thuê";
      case "BAO_TRI" -> "Bảo trì";
      case "NGUNG_HOAT_DONG" -> "Ngừng hoạt động";
      case "DANG_HIEU_LUC" -> "Đang hiệu lực";
      case "HET_HAN" -> "Hết hạn";
      case "DA_KET_THUC" -> "Đã kết thúc";
      case "DA_HUY" -> "Đã hủy";
      case "CHUA_THANH_TOAN" -> "Chưa thanh toán";
      case "THANH_TOAN_MOT_PHAN" -> "Thanh toán một phần";
      case "DA_THANH_TOAN" -> "Đã thanh toán";
      case "TIEN_MAT" -> "Tiền mặt";
      case "CHUYEN_KHOAN" -> "Chuyển khoản";
      case "VI_DIEN_TU" -> "Ví điện tử";
      default -> value;
    };
  }
}
