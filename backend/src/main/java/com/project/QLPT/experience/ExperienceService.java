package com.project.QLPT.experience;

import static com.project.QLPT.experience.AccountService.*;

import com.project.QLPT.dto.request.*;
import com.project.QLPT.enums.*;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.service.*;
import jakarta.persistence.EntityManager;
import jakarta.validation.Validator;
import java.math.BigDecimal;
import java.net.URI;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Scoped browser facade. Existing services remain the authority for rental/accounting rules. */
@Service
@RequiredArgsConstructor
public class ExperienceService {
  private final JdbcTemplate db;
  private final AccountService accounts;
  private final PhongService phong;
  private final NguoiThueService tenants;
  private final DichVuService services;
  private final HopDongService contracts;
  private final HoaDonService invoices;
  private final ThanhToanService payments;
  private final ThanhVienHopDongService members;
  private final ChiTietHoaDonService lines;
  private final Validator validator;
  private final EntityManager em;
  private static final String ROOM_SELECT =
      """
SELECT p.id,p.so_phong number,p.dien_tich area,p.gia_thue price,p.trang_thai roomState,
 p.building_id buildingId,p.room_type type,COALESCE(b.name,'') building,COALESCE(b.address,'') address,
 COALESCE(b.city,'') city,COALESCE(b.district,'') district,
 COALESCE(l.title,CONCAT('Phòng ',p.so_phong)) title,COALESCE(l.description,'') description,
 COALESCE(l.amenities,'') amenities,COALESCE(l.images,'') images,
 COALESCE(l.published,FALSE) published,l.room_id listingId,
 COALESCE(a.name,'') hostName,COALESCE(a.phone,'') hostPhone
FROM phong p LEFT JOIN app_building b ON b.id=p.building_id
LEFT JOIN app_listing l ON l.room_id=p.id LEFT JOIN app_account a ON a.id=p.owner_id
""";
  private static final String PUBLIC =
      " l.published=TRUE AND p.trang_thai='TRONG' AND b.active=TRUE ";

  private List<Map<String, Object>> rooms(String where, Object... args) {
    var rows = db.queryForList(ROOM_SELECT + " WHERE " + where + " ORDER BY p.id DESC", args);
    for (var r : rows) {
      r.put("amenities", split(r.get("amenities")));
      r.put("images", split(r.get("images")));
      r.put("photo", ((List<?>) r.get("images")).stream().findFirst().orElse(null));
      r.put("available", "TRONG".equals(r.get("roomState")));
      r.put(
          "published",
          Boolean.TRUE.equals(r.get("published")) || Objects.equals(r.get("published"), 1));
      r.put("roomStatus", label(Objects.toString(r.get("roomState"))));
      r.put(
          "fees",
          db.queryForList(
              "SELECT d.id,d.ten_dich_vu name,d.don_vi_tinh unit,d.don_gia_hien_tai"
                  + " price,IF(d.tinh_theo_chi_so,'Theo chỉ số','Cố định') mode FROM dich_vu d JOIN"
                  + " phong p ON p.owner_id=d.owner_id WHERE p.id=? AND d.dang_hoat_dong=TRUE ORDER"
                  + " BY d.id",
              r.get("id")));
    }
    return rows;
  }

  private List<String> split(Object s) {
    return Arrays.stream(Objects.toString(s, "").split("\\n"))
        .map(String::trim)
        .filter(v -> !v.isBlank())
        .toList();
  }

  public List<Map<String, Object>> catalog() {
    return rooms(PUBLIC);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> state(Long account) {
    Map<String, Object> result = new LinkedHashMap<>();
    var catalog = catalog();
    result.put("publicRooms", catalog);
    for (String key :
        List.of(
            "rooms",
            "buildings",
            "tenants",
            "services",
            "contracts",
            "invoices",
            "payments",
            "requests",
            "saved",
            "listings")) result.put(key, List.of());
    result.put("rooms", catalog);
    result.put("user", null);
    if (account == null) return result;
    var user = accounts.profile(account);
    result.put("user", user);
    boolean owner = "owner".equals(user.get("role"));
    if (owner) {
      var ownRooms = rooms("p.owner_id=?", account);
      result.put("rooms", ownRooms);
      result.put("listings", ownRooms.stream().filter(r -> r.get("listingId") != null).toList());
      result.put(
          "buildings",
          db.queryForList(
              "SELECT id,name,address,city,district,manager,IF(active,'Đang hoạt động','Tạm ngưng')"
                  + " status FROM app_building WHERE owner_id=? ORDER BY id DESC",
              account));
      result.put(
          "tenants",
          db.queryForList(
              """
SELECT n.id,n.ho_ten name,n.cccd,n.so_dien_thoai phone,n.ngay_sinh birthday,n.dia_chi_thuong_tru address,
EXISTS(SELECT 1 FROM app_tenant_link t WHERE t.tenant_id=n.id) linked
FROM nguoi_thue n WHERE n.owner_id=? ORDER BY n.id DESC
""",
              account));
      result.put(
          "services",
          db.queryForList(
              """
SELECT id,ten_dich_vu name,don_vi_tinh unit,don_gia_hien_tai price,
IF(tinh_theo_chi_so,'Theo chỉ số','Cố định') mode,IF(dang_hoat_dong,'Đang áp dụng','Tạm ngưng') status
FROM dich_vu WHERE owner_id=? ORDER BY id DESC
""",
              account));
    }
    String scope =
        owner
            ? "p.owner_id=?"
            : "EXISTS(SELECT 1 FROM thanh_vien_hop_dong tv JOIN app_tenant_link lk ON"
                + " lk.tenant_id=tv.nguoi_thue_id WHERE tv.hop_dong_id=h.id AND lk.account_id=?)";
    var cs =
        db.queryForList(
            """
SELECT h.id,h.phong_id roomId,p.so_phong room,COALESCE(b.name,'') building,
h.ngay_bat_dau start,h.ngay_ket_thuc end,h.gia_thue_thoa_thuan price,h.tien_coc deposit,
h.trang_thai state,h.ngay_ket_thuc_thuc_te actualEnd,h.ly_do_ket_thuc endReason
FROM hop_dong h JOIN phong p ON p.id=h.phong_id LEFT JOIN app_building b ON b.id=p.building_id WHERE
"""
                + scope
                + " ORDER BY h.id DESC",
            account);
    for (var c : cs) {
      var ms =
          db.queryForList(
              """
SELECT n.id,n.ho_ten name,t.ngay_vao joined,t.ngay_roi departed,t.la_dai_dien representative
FROM thanh_vien_hop_dong t JOIN nguoi_thue n ON n.id=t.nguoi_thue_id
WHERE t.hop_dong_id=? ORDER BY t.la_dai_dien DESC,n.id
""",
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
            account);
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
              """
SELECT ct.id,ct.dich_vu_id serviceId,d.ten_dich_vu name,d.don_vi_tinh unit,ct.chi_so_cu oldIndex,ct.chi_so_moi newIndex,
ct.so_luong quantity,ct.don_gia price,ROUND(ct.so_luong*ct.don_gia,0) amount
FROM chi_tiet_hoa_don ct JOIN dich_vu d ON d.id=ct.dich_vu_id WHERE ct.hoa_don_id=? ORDER BY ct.id
""",
              bill.get("id")));
    }
    result.put("invoices", bills);
    var ps =
        db.queryForList(
            """
SELECT t.id,t.hoa_don_id invoice,p.so_phong room,t.ngay_thanh_toan date,t.so_tien amount,t.phuong_thuc methodCode,t.ma_giao_dich reference
FROM thanh_toan t JOIN hoa_don i ON i.id=t.hoa_don_id JOIN hop_dong h ON h.id=i.hop_dong_id JOIN phong p ON p.id=h.phong_id WHERE
"""
                + scope
                + " ORDER BY t.ngay_thanh_toan DESC,t.id DESC",
            account);
    for (var payment : ps) {
      payment.put("method", label(payment.get("methodCode").toString()));
      payment.put("status", "Đã ghi nhận");
    }
    result.put("payments", ps);
    result.put(
        "saved",
        db.queryForList(
            "SELECT room_id FROM app_favorite WHERE account_id=?", Integer.class, account));
    result.put(
        "requests",
        db.queryForList(
            """
SELECT v.id,v.room_id roomId,v.visit_date date,TIME_FORMAT(v.visit_time,'%H:%i') time,v.name,v.phone,
v.request_type type,v.note,v.status,p.so_phong room,COALESCE(b.name,'') building,COALESCE(l.title,CONCAT('Phòng ',p.so_phong)) title
FROM app_viewing_request v JOIN phong p ON p.id=v.room_id LEFT JOIN app_building b ON b.id=p.building_id
LEFT JOIN app_listing l ON l.room_id=p.id WHERE
"""
                + (owner ? "p.owner_id=?" : "v.account_id=?")
                + " ORDER BY v.id DESC",
            account));
    return normalizeDates(result);
  }

  private static final Map<String, String> TABLES =
      Map.of(
          "buildings",
          "app_building",
          "rooms",
          "phong",
          "tenants",
          "nguoi_thue",
          "services",
          "dich_vu");

  public void owned(long owner, String kind, int id) {
    accounts.owner(owner);
    String query;
    if (TABLES.containsKey(kind))
      query = "SELECT COUNT(*) FROM " + TABLES.get(kind) + " WHERE id=? AND owner_id=?";
    else
      query =
          switch (kind) {
            case "listings" ->
                "SELECT COUNT(*) FROM app_listing l JOIN phong p ON p.id=l.room_id WHERE"
                    + " l.room_id=? AND p.owner_id=?";
            case "contracts" ->
                "SELECT COUNT(*) FROM hop_dong h JOIN phong p ON p.id=h.phong_id WHERE h.id=? AND"
                    + " p.owner_id=?";
            case "invoices" ->
                "SELECT COUNT(*) FROM hoa_don i JOIN hop_dong h ON h.id=i.hop_dong_id JOIN phong p"
                    + " ON p.id=h.phong_id WHERE i.id=? AND p.owner_id=?";
            case "payments" ->
                "SELECT COUNT(*) FROM thanh_toan t JOIN hoa_don i ON i.id=t.hoa_don_id JOIN"
                    + " hop_dong h ON h.id=i.hop_dong_id JOIN phong p ON p.id=h.phong_id WHERE"
                    + " t.id=? AND p.owner_id=?";
            default ->
                throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Loại dữ liệu không hợp lệ.");
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
        Object[] v = {
          text(d, "name", 255),
          text(d, "address", 500),
          text(d, "city", 100),
          text(d, "district", 100),
          text(d, "manager", 255),
          !"Tạm ngưng".equals(d.get("status"))
        };
        if (id == null)
          db.update(
              "INSERT INTO app_building(name,address,city,district,manager,active,owner_id)"
                  + " VALUES(?,?,?,?,?,?,?)",
              append(v, owner));
        else
          db.update(
              "UPDATE app_building SET name=?,address=?,city=?,district=?,manager=?,active=? WHERE"
                  + " id=?",
              append(v, id));
      }
      case "rooms" -> {
        int building = integer(d, "buildingId");
        owned(owner, "buildings", building);
        var req =
            valid(new PhongRequest(text(d, "number", 50), decimal(d, "area"), decimal(d, "price")));
        String type = text(d, "type", 50);
        if (!Set.of("Phòng trọ", "Studio", "Căn hộ mini").contains(type))
          throw new BusinessException("Loại phòng không hợp lệ.");
        int room = id == null ? phong.create(req).id() : phong.update(id, req).id();
        em.flush();
        db.update(
            "UPDATE phong SET owner_id=?,building_id=?,room_type=? WHERE id=?",
            owner,
            building,
            type,
            room);
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
        db.update("UPDATE nguoi_thue SET owner_id=? WHERE id=?", owner, tenant);
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
        db.update("UPDATE dich_vu SET owner_id=? WHERE id=?", owner, service);
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
        int contract = id == null ? contracts.create(req).id() : contracts.update(id, req).id();
        em.flush();
        // Contract creation and initial representative are one transaction.
        if (id == null && d.get("tenantId") != null && !d.get("tenantId").toString().isBlank()) {
          int tenant = integer(d, "tenantId");
          owned(owner, "tenants", tenant);
          members.create(
              contract, valid(new ThanhVienHopDongRequest(tenant, req.ngayBatDau(), null, true)));
        }
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
        int room = id == null ? integer(d, "roomId") : id;
        owned(owner, "rooms", room);
        if (id == null
            && db.queryForObject(
                    "SELECT COUNT(*) FROM app_listing WHERE room_id=?", Integer.class, room)
                > 0)
          throw new BusinessException("Phòng đã có tin đăng. Vui lòng chỉnh sửa tin hiện có.");
        String imageText = optional(d, "images", 8000);
        var imageList = split(imageText);
        if (imageList.size() > 8) throw new BusinessException("Mỗi tin tối đa 8 ảnh.");
        for (String image : imageList) {
          URI uri = URI.create(image.trim());
          if (!"https".equals(uri.getScheme())
              || uri.getHost() == null
              || uri.getUserInfo() != null)
            throw new BusinessException("Đường dẫn ảnh cần dùng HTTPS.");
        }
        db.update(
            """
INSERT INTO app_listing(room_id,title,description,amenities,images,published) VALUES(?,?,?,?,?,?)
ON DUPLICATE KEY UPDATE title=VALUES(title),description=VALUES(description),amenities=VALUES(amenities),images=VALUES(images),published=VALUES(published)
""",
            room,
            text(d, "title", 255),
            text(d, "description", 10000),
            optional(d, "amenities", 2000).replace(",", "\n"),
            String.join("\n", imageList),
            Boolean.parseBoolean(Objects.toString(d.get("published"), "false")));
      }
      default ->
          throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Loại dữ liệu không hợp lệ.");
    }
    em.flush();
  }

  @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
  public void delete(long owner, String kind, int id) {
    owned(owner, kind, id);
    switch (kind) {
      case "buildings" -> {
        if (db.queryForObject("SELECT COUNT(*) FROM phong WHERE building_id=?", Integer.class, id)
            > 0)
          throw new BusinessException("Cần chuyển hoặc xóa các phòng trước khi xóa nhà trọ.");
        db.update("DELETE FROM app_building WHERE id=?", id);
      }
      case "rooms" -> phong.delete(id);
      case "tenants" -> tenants.delete(id);
      case "services" -> services.delete(id);
      case "invoices" -> invoices.delete(id);
      case "payments" -> payments.delete(id);
      case "listings" -> db.update("DELETE FROM app_listing WHERE room_id=?", id);
      case "contracts" ->
          throw new BusinessException("Hợp đồng cần kết thúc hoặc hủy để giữ lịch sử.");
      default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    em.flush();
  }

  @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
  public void contractAction(long owner, int contract, String action, Map<String, Object> d) {
    owned(owner, "contracts", contract);
    if ("cancel".equals(action)) contracts.huy(contract);
    else if ("end".equals(action))
      contracts.ketThuc(
          contract, valid(new KetThucHopDongRequest(date(d, "actualEnd"), text(d, "reason", 500))));
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

  @Transactional
  public void favorite(long account, int room, boolean add) {
    if (add) {
      if (rooms("p.id=? AND " + PUBLIC, room).isEmpty())
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tin không còn hiển thị.");
      db.update("INSERT IGNORE INTO app_favorite(account_id,room_id) VALUES(?,?)", account, room);
    } else db.update("DELETE FROM app_favorite WHERE account_id=? AND room_id=?", account, room);
  }

  @Transactional
  public void request(long account, Map<String, Object> d) {
    if (!"tenant".equals(accounts.profile(account).get("role")))
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Yêu cầu xem và thuê phòng dành cho tài khoản người thuê.");
    int room = integer(d, "roomId");
    // Serialize booking against status changes. Never accept a private/unavailable listing.
    db.queryForList("SELECT id FROM phong WHERE id=? FOR UPDATE", room);
    if (rooms("p.id=? AND " + PUBLIC, room).isEmpty())
      throw new BusinessException("Phòng không còn nhận lịch xem.");
    LocalDate day = date(d, "date");
    LocalTime time = LocalTime.parse(text(d, "time", 8));
    if (LocalDateTime.of(day, time).isBefore(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"))))
      throw new BusinessException("Vui lòng chọn thời gian trong tương lai.");
    String type = text(d, "type", 30);
    if (!Set.of("Xem phòng", "Đăng ký thuê").contains(type))
      throw new BusinessException("Loại yêu cầu không hợp lệ.");
    if (db.queryForObject(
            "SELECT COUNT(*) FROM app_viewing_request WHERE account_id=? AND room_id=? AND status"
                + " IN ('Chờ xác nhận','Đã xác nhận')",
            Integer.class,
            account,
            room)
        > 0) throw new BusinessException("Bạn đã có yêu cầu đang chờ xử lý cho phòng này.");
    db.update(
        "INSERT INTO"
            + " app_viewing_request(account_id,room_id,visit_date,visit_time,name,phone,request_type,note)"
            + " VALUES(?,?,?,?,?,?,?,?)",
        account,
        room,
        day,
        time,
        text(d, "name", 255),
        text(d, "phone", 20),
        type,
        optional(d, "note", 1000));
  }

  @Transactional
  public void requestStatus(long account, int id, Map<String, Object> d) {
    var rows =
        db.queryForList(
            "SELECT v.account_id,p.owner_id,v.status FROM app_viewing_request v JOIN phong p ON"
                + " p.id=v.room_id WHERE v.id=? FOR UPDATE",
            id);
    if (rows.isEmpty())
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu.");
    var row = rows.getFirst();
    String status = text(d, "status", 30);
    boolean owner = Objects.equals(((Number) row.get("owner_id")).longValue(), account);
    boolean tenant = Objects.equals(((Number) row.get("account_id")).longValue(), account);
    if (!(owner && Set.of("Đã xác nhận", "Đã từ chối").contains(status))
        && !(tenant && "Đã hủy".equals(status)))
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Bạn không thể cập nhật yêu cầu này.");
    String old = row.get("status").toString();
    if (Set.of("Đã hủy", "Đã từ chối").contains(old) || owner && !"Chờ xác nhận".equals(old))
      throw new BusinessException("Yêu cầu đã được xử lý. Vui lòng tải lại danh sách.");
    db.update("UPDATE app_viewing_request SET status=? WHERE id=?", status, id);
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
      case "TRONG" -> "Còn trống";
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
