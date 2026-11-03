package com.project.QLPT.experience;

import static org.assertj.core.api.Assertions.*;

import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.*;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.transaction.annotation.*;
import tools.jackson.databind.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional(isolation = Isolation.READ_COMMITTED)
class ExperienceIntegrationTests {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  @Autowired org.springframework.jdbc.core.JdbcTemplate db;
  @Autowired com.project.QLPT.service.RentalLifecycleJob lifecycle;

  class Client {
    MockHttpSession session;
    String csrf;

    Client() throws Exception {
      var r = mvc.perform(MockMvcRequestBuilders.get("/api/app/session")).andReturn();
      session = (MockHttpSession) r.getRequest().getSession();
      csrf = tree(r).get("csrfToken").asText();
    }

    MvcResult request(String method, String path, Map<String, Object> body, int status)
        throws Exception {
      var req =
          MockMvcRequestBuilders.request(
                  org.springframework.http.HttpMethod.valueOf(method), "/api/app" + path)
              .session(session)
              .header("X-CSRF-Token", csrf);
      if (body != null)
        req.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
      var result = mvc.perform(req).andReturn();
      assertThat(result.getResponse().getStatus())
          .as(method + " " + path + ": " + result.getResponse().getContentAsString())
          .isEqualTo(status);
      return result;
    }

    void register(String role) throws Exception {
      String unique = UUID.randomUUID().toString();
      var r =
          request(
              "POST",
              "/auth/register",
              Map.of(
                  "email",
                  unique + "@integration.invalid",
                  "name",
                  "Integration " + role,
                  "password",
                  "OnlyForIntegration-123!",
                  "role",
                  role),
              200);
      session = (MockHttpSession) r.getRequest().getSession();
      csrf = tree(r).get("csrfToken").asText();
    }

    JsonNode state() throws Exception {
      return tree(request("GET", "/state", null, 200));
    }

    int first(String key) throws Exception {
      return state().get(key).get(0).get("id").asInt();
    }

    void create(String kind, Map<String, Object> d) throws Exception {
      request("POST", "/owner/" + kind, d, 200);
    }
  }

  JsonNode tree(MvcResult r) throws Exception {
    return json.readTree(r.getResponse().getContentAsString());
  }

  @Test
  void realRentalFlowAndAccessBoundaries() throws Exception {
    Client owner = new Client(),
        other = new Client(),
        tenant = new Client(),
        stranger = new Client(),
        anonymous = new Client();
    owner.register("owner");
    other.register("owner");
    tenant.register("tenant");
    stranger.register("tenant");
    owner.request("POST", "/requests", Map.of(), 403);
    owner.request("POST", "/tenant-link", Map.of("code", "invalid"), 403);
    owner.create(
        "buildings",
        Map.of(
            "name",
            "Integration building",
            "address",
            "Integration address",
            "city",
            "Hà Nội",
            "district",
            "Integration district",
            "manager",
            "Integration manager"));
    int building = owner.first("buildings");
    owner.create(
        "rooms",
        Map.of(
            "number",
            "T-" + UUID.randomUUID().toString().substring(0, 8),
            "area",
            25,
            "price",
            3000000,
            "buildingId",
            building,
            "type",
            "Studio"));
    int room = owner.first("rooms");
    other.request("PUT", "/owner/rooms/" + room, Map.of(), 404);
    tenant.request("DELETE", "/owner/rooms/" + room, null, 403);
    owner.create(
        "listings",
        Map.of(
            "roomId",
            room,
            "title",
            "Integration listing",
            "description",
            "Integration room description",
            "phone",
            "0900000001",
            "images",
            "https://example.com/integration-room.jpg",
            "published",
            true));
    int listing =
        db.queryForObject("SELECT id FROM tin_dang WHERE phong_id=?", Integer.class, room);
    // Gửi duyệt chưa đủ để hiển thị công khai.
    assertThat(anonymous.state().get("publicRooms").toString())
        .doesNotContain("Integration listing");
    // Kiểm duyệt là việc của quản trị viên; test luồng thuê nên duyệt trực tiếp trong DB.
    db.update("UPDATE tin_dang SET trang_thai='DA_DUYET' WHERE id=?", listing);
    assertThat(anonymous.state().get("publicRooms").toString())
        .contains("Integration listing")
        .doesNotContain("cccd", "password_hash");
    tenant.request("PUT", "/favorites/" + listing, null, 200);
    assertThat(tenant.state().get("saved").toString()).contains(String.valueOf(listing));
    tenant.request(
        "POST",
        "/requests",
        Map.of(
            "roomId",
            listing,
            "name",
            "Integration tenant",
            "phone",
            "0900000000",
            "date",
            java.time.LocalDate.now().plusDays(2).toString(),
            "time",
            "10:00",
            "type",
            "Xem phòng"),
        200);
    int request = tenant.first("requests");
    stranger.request("PATCH", "/requests/" + request, Map.of("status", "Đã hủy"), 403);
    other.request("PATCH", "/requests/" + request, Map.of("status", "Đã xác nhận"), 403);
    owner.request("PATCH", "/requests/" + request, Map.of("status", "Đã xác nhận"), 200);
    assertThat(tenant.state().get("requests").get(0).get("status").asText())
        .isEqualTo("Đã xác nhận");
    Map<String, Object> viewing =
        Map.of(
            "roomId",
            listing,
            "name",
            "Integration tenant",
            "phone",
            "0900000000",
            "date",
            java.time.LocalDate.now().plusDays(3).toString(),
            "time",
            "09:00",
            "type",
            "Xem phòng");
    // Lịch đã xác nhận còn hiệu lực: không đặt trùng.
    tenant.request("POST", "/requests", viewing, 400);
    // Lịch đã qua không còn chặn khách đặt lịch mới.
    db.update(
        "UPDATE portal_viewing_request SET visit_date=? WHERE id=?",
        java.time.LocalDate.now().minusDays(1),
        request);
    tenant.request("POST", "/requests", viewing, 200);
    int retry = tenant.first("requests");
    assertThat(retry).isNotEqualTo(request);
    stranger.request("POST", "/requests", viewing, 200);
    int strangerRequest = stranger.first("requests");
    // Yêu cầu chờ xác nhận đã qua giờ hẹn hiển thị "Hết hạn" và không xác nhận được nữa.
    db.update(
        "UPDATE portal_viewing_request SET visit_date=? WHERE id=?",
        java.time.LocalDate.now().minusDays(1),
        retry);
    assertThat(tenant.state().get("requests").get(0).get("status").asText())
        .isEqualTo("Hết hạn");
    owner.request("PATCH", "/requests/" + retry, Map.of("status", "Đã xác nhận"), 400);
    owner.create(
        "tenants",
        Map.of(
            "name", "Integration tenant", "cccd", UUID.randomUUID().toString().substring(0, 18)));
    int person = owner.first("tenants");
    owner.create(
        "services",
        Map.of(
            "name",
            "Integration electricity",
            "unit",
            "kWh",
            "price",
            3500,
            "mode",
            "Theo chỉ số",
            "status",
            "Đang áp dụng"));
    int service = owner.first("services");
    owner.request(
        "POST",
        "/owner/services",
        Map.of(
            "name",
            "Fractional VND rejected",
            "unit",
            "tháng",
            "price",
            0.5,
            "mode",
            "Cố định",
            "status",
            "Đang áp dụng"),
        400);
    owner.create(
        "contracts",
        Map.of(
            "roomId",
            room,
            "tenantId",
            person,
            "start",
            "2026-01-01",
            "end",
            "2027-12-31",
            "price",
            3000000,
            "deposit",
            3000000));
    int contract = owner.first("contracts");
    // Phòng đã cho thuê: mọi yêu cầu mở của phòng được đóng, chủ trọ không xác nhận được nữa.
    assertThat(stranger.state().get("requests").get(0).get("status").asText())
        .isEqualTo("Phòng không còn trống");
    assertThat(
            db.queryForObject(
                "SELECT COUNT(*) FROM portal_viewing_request v JOIN tin_dang l ON"
                    + " l.id=v.listing_id WHERE l.phong_id=? AND v.status IN ('Chờ xác nhận','Đã"
                    + " xác nhận')",
                Integer.class,
                room))
        .isZero();
    owner.request(
        "PATCH", "/requests/" + strangerRequest, Map.of("status", "Đã xác nhận"), 400);
    assertThat(anonymous.state().get("publicRooms").toString())
        .doesNotContain("Integration listing");
    assertThat(tenant.state().get("contracts").isEmpty()).isTrue();
    var code =
        tree(owner.request("POST", "/owner/tenants/" + person + "/invitation", Map.of(), 200))
            .get("code")
            .asText();
    tenant.request("POST", "/tenant-link", Map.of("code", code), 200);
    stranger.request("POST", "/tenant-link", Map.of("code", code), 400);
    assertThat(tenant.state().get("contracts").get(0).get("id").asInt()).isEqualTo(contract);
    assertThat(stranger.state().get("contracts").isEmpty()).isTrue();
    owner.create(
        "invoices",
        Map.of(
            "contractId",
            contract,
            "period",
            "2026-10-01",
            "issued",
            "2026-10-01",
            "due",
            "2026-10-25",
            "rent",
            3000000));
    int bill = owner.first("invoices");
    owner.request(
        "POST",
        "/owner/invoices/" + bill + "/lines",
        Map.of("serviceId", service, "oldIndex", 100, "newIndex", 120),
        200);
    var invoice = owner.state().get("invoices").get(0);
    assertThat(invoice.get("amount").asLong()).isEqualTo(3070000);
    assertThat(tenant.state().get("invoices").get(0).get("lines").get(0).get("amount").asLong())
        .isEqualTo(70000);
    other.request(
        "POST",
        "/owner/invoices/" + bill + "/lines",
        Map.of("serviceId", service, "oldIndex", 100, "newIndex", 120),
        404);
    owner.create(
        "payments",
        Map.of(
            "invoice",
            bill,
            "date",
            "2026-10-01T10:00",
            "amount",
            1000000,
            "methodCode",
            "CHUYEN_KHOAN"));
    assertThat(tenant.state().get("invoices").get(0).get("remaining").asLong()).isEqualTo(2070000);
    owner.request(
        "POST",
        "/owner/payments",
        Map.of(
            "invoice",
            bill,
            "date",
            "2026-10-01T10:00",
            "amount",
            2070001,
            "methodCode",
            "TIEN_MAT"),
        400);
    owner.request("DELETE", "/owner/invoices/" + bill, null, 400);
    owner.create(
        "payments",
        Map.of(
            "invoice",
            bill,
            "date",
            "2026-10-01T10:00",
            "amount",
            2070000,
            "methodCode",
            "TIEN_MAT"));
    assertThat(tenant.state().get("invoices").get(0).get("status").asText())
        .isEqualTo("Đã thanh toán");
    assertThat(stranger.state().get("invoices").isEmpty()).isTrue();
    assertThat(other.state().get("rooms").isEmpty()).isTrue();
    int payment = owner.first("payments");
    owner.request("DELETE", "/owner/payments/" + payment, null, 200);
    assertThat(tenant.state().get("invoices").get(0).get("status").asText())
        .isEqualTo("Thanh toán một phần");
    owner.request("DELETE", "/owner/contracts/" + contract, null, 400);
    assertThat(
            mvc.perform(MockMvcRequestBuilders.get("/api/phong"))
                .andReturn()
                .getResponse()
                .getStatus())
        .isEqualTo(401);
    // Chủ trọ không được tự kiểm duyệt tin đăng.
    assertThat(
            mvc.perform(
                    MockMvcRequestBuilders.get("/api/admin/tin-dang").session(owner.session))
                .andReturn()
                .getResponse()
                .getStatus())
        .isEqualTo(403);
    assertThat(
            mvc.perform(
                    MockMvcRequestBuilders.post("/api/app/owner/buildings")
                        .session(owner.session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andReturn()
                .getResponse()
                .getStatus())
        .isEqualTo(403);
  }

  static JsonNode byId(JsonNode rows, int id) {
    for (var row : rows) if (row.get("id").asInt() == id) return row;
    throw new AssertionError("Không tìm thấy id " + id + " trong " + rows);
  }

  static String day(int offset) {
    return java.time.LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"))
        .plusDays(offset)
        .toString();
  }

  @Test
  void viewingHoldContractLifecycle() throws Exception {
    Client owner = new Client(), a = new Client(), b = new Client(), anonymous = new Client();
    owner.register("owner");
    a.register("tenant");
    b.register("tenant");
    owner.create(
        "buildings",
        Map.of("name", "Lifecycle building", "address", "Lifecycle address", "city", "Hà Nội",
            "district", "Lifecycle district", "manager", "Lifecycle manager"));
    owner.create(
        "rooms",
        Map.of("number", "L-" + UUID.randomUUID().toString().substring(0, 8), "area", 20,
            "price", 3000000, "buildingId", owner.first("buildings"), "type", "Studio"));
    int room = owner.first("rooms");
    owner.create(
        "listings",
        Map.of("roomId", room, "title", "Lifecycle listing", "description", "Lifecycle room",
            "phone", "0900000002", "images", "https://example.com/lifecycle.jpg",
            "published", false));
    int listing =
        db.queryForObject("SELECT id FROM tin_dang WHERE phong_id=?", Integer.class, room);
    // Giá tin phải là giá phòng.
    owner.request(
        "PUT",
        "/owner/listings/" + listing,
        Map.of("title", "Lifecycle listing", "description", "Lifecycle room", "phone",
            "0900000002", "images", "https://example.com/lifecycle.jpg", "price", 2500000,
            "version", 0, "published", false),
        400);
    db.update("UPDATE tin_dang SET trang_thai='DA_DUYET' WHERE id=?", listing);
    assertThat(anonymous.state().get("publicRooms").toString()).contains("Lifecycle listing");

    // Quy tắc đặt lịch: khung giờ và số ngày tối đa.
    var viewing = new HashMap<String, Object>(
        Map.of("roomId", listing, "name", "Khách A", "phone", "0900000003", "date", day(2),
            "time", "22:00", "type", "Xem phòng"));
    a.request("POST", "/requests", viewing, 400);
    viewing.put("time", "10:00");
    viewing.put("date", day(61));
    a.request("POST", "/requests", viewing, 400);
    viewing.put("date", day(2));
    a.request("POST", "/requests", viewing, 200);
    int reqA = a.first("requests");
    viewing.put("name", "Khách B");
    viewing.put("time", "10:15");
    b.request("POST", "/requests", viewing, 200);
    int reqB = b.first("requests");

    // Không xác nhận hai lịch trùng giờ.
    owner.request("PATCH", "/requests/" + reqA, Map.of("status", "Đã xác nhận"), 200);
    owner.request("PATCH", "/requests/" + reqB, Map.of("status", "Đã xác nhận"), 400);
    b.request("PATCH", "/requests/" + reqB, Map.of("status", "Đã hủy"), 200);
    // Chỉ ghi nhận "Đã xem" sau giờ hẹn.
    owner.request("PATCH", "/requests/" + reqA, Map.of("status", "Đã xem"), 400);
    db.update("UPDATE portal_viewing_request SET visit_date=? WHERE id=?", day(-1), reqA);
    owner.request("PATCH", "/requests/" + reqA, Map.of("status", "Đã xem"), 200);

    // Đăng ký thuê → giữ chỗ.
    viewing.put("type", "Đăng ký thuê");
    viewing.put("date", day(1));
    b.request("POST", "/requests", viewing, 200);
    int holdB = b.first("requests");
    owner.request(
        "PATCH", "/requests/" + holdB,
        Map.of("status", "Đã giữ chỗ", "holdDeposit", 1000000, "holdUntil", day(40)), 400);
    owner.request(
        "PATCH", "/requests/" + holdB,
        Map.of("status", "Đã giữ chỗ", "holdDeposit", 1000000, "holdUntil", day(5)), 200);
    assertThat(byId(owner.state().get("rooms"), room).get("roomState").asText())
        .isEqualTo("DA_DAT");
    assertThat(anonymous.state().get("publicRooms").toString())
        .doesNotContain("Lifecycle listing");
    assertThat(db.queryForObject("SELECT trang_thai FROM tin_dang WHERE id=?", String.class,
        listing)).isEqualTo("DA_AN");

    owner.create(
        "tenants", Map.of("name", "Khách B", "cccd", UUID.randomUUID().toString().substring(0, 18)));
    int person = owner.first("tenants");
    var contract = new HashMap<String, Object>(
        Map.of("roomId", room, "start", day(10), "end", day(375), "price", 3000000,
            "deposit", 3000000));
    // Hợp đồng phải có đại diện; phòng đang giữ chỗ chỉ lập hợp đồng từ yêu cầu giữ chỗ.
    owner.request("POST", "/owner/contracts", contract, 400);
    contract.put("tenantId", person);
    owner.request("POST", "/owner/contracts", contract, 400);
    contract.put("requestId", holdB);
    owner.request("POST", "/owner/contracts", contract, 200);
    int c1 = owner.first("contracts");
    assertThat(byId(b.state().get("requests"), holdB).get("status").asText())
        .isEqualTo("Đã lập hợp đồng");
    // Chưa tới ngày vào ở: phòng vẫn là "đã đặt".
    assertThat(byId(owner.state().get("rooms"), room).get("roomState").asText())
        .isEqualTo("DA_DAT");

    // Hủy hợp đồng chưa phát sinh hóa đơn: bắt buộc có lý do.
    owner.request("POST", "/owner/contracts/" + c1 + "/cancel", Map.of(), 400);
    owner.request(
        "POST", "/owner/contracts/" + c1 + "/cancel", Map.of("reason", "Khách đổi ý"), 200);
    assertThat(byId(owner.state().get("rooms"), room).get("roomState").asText())
        .isEqualTo("TRONG");

    // Tin đã ẩn: đổi giá phòng được và tin nhận giá mới.
    owner.request(
        "PUT", "/owner/rooms/" + room,
        Map.of("number", byId(owner.state().get("rooms"), room).get("number").asText(),
            "area", 20, "price", 3200000, "buildingId", owner.first("buildings"),
            "type", "Studio", "roomState", "TRONG"),
        200);
    assertThat(db.queryForObject("SELECT gia_thue FROM tin_dang WHERE id=?",
        java.math.BigDecimal.class, listing)).isEqualByComparingTo("3200000");

    // Kết thúc hợp đồng: tiền cọc trước hết bù công nợ hóa đơn.
    contract.remove("requestId");
    contract.put("start", "2026-01-01");
    owner.request("POST", "/owner/contracts", contract, 200);
    int c2 = owner.first("contracts");
    owner.request(
        "POST", "/owner/contracts/" + c2 + "/cancel", Map.of("reason", "Thử"), 200);
    owner.request(
        "POST", "/owner/contracts", contract, 200);
    int c3 = owner.first("contracts");
    owner.create(
        "invoices",
        Map.of("contractId", c3, "period", day(0), "issued", day(0), "due", day(10),
            "rent", 3000000));
    owner.request(
        "POST", "/owner/contracts/" + c3 + "/cancel", Map.of("reason", "Thử"), 400);
    owner.request(
        "POST", "/owner/contracts/" + c3 + "/end",
        Map.of("actualEnd", day(0), "reason", "Trả phòng", "depositRefund", 3000000), 400);
    owner.request(
        "POST", "/owner/contracts/" + c3 + "/end",
        Map.of("actualEnd", day(0), "reason", "Trả phòng", "depositRefund", 0,
            "settlementNote", "Cọc bù tiền phòng tháng cuối"),
        200);
    var ended = byId(owner.state().get("contracts"), c3);
    assertThat(ended.get("depositRefund").asLong()).isZero();
    assertThat(ended.get("settlementNote").asText()).isEqualTo("Cọc bù tiền phòng tháng cuối");

    // Hết hạn tự động và gia hạn.
    contract.put("end", day(1));
    owner.request("POST", "/owner/contracts", contract, 200);
    int c4 = owner.first("contracts");
    db.update("UPDATE hop_dong SET ngay_ket_thuc=? WHERE id=?", day(-1), c4);
    lifecycle.run();
    assertThat(byId(owner.state().get("contracts"), c4).get("state").asText())
        .isEqualTo("HET_HAN");
    assertThat(byId(owner.state().get("rooms"), room).get("roomState").asText())
        .isEqualTo("DANG_THUE");
    owner.request(
        "PUT", "/owner/contracts/" + c4,
        Map.of("roomId", room, "start", "2026-01-01", "end", day(90), "price", 3000000,
            "deposit", 3000000),
        200);
    assertThat(byId(owner.state().get("contracts"), c4).get("state").asText())
        .isEqualTo("DANG_HIEU_LUC");
  }

  @Test
  void expiredHoldReleasesRoom() throws Exception {
    Client owner = new Client(), a = new Client();
    owner.register("owner");
    a.register("tenant");
    owner.create(
        "buildings",
        Map.of("name", "Hold building", "address", "Hold address", "city", "Hà Nội",
            "district", "Hold district", "manager", "Hold manager"));
    owner.create(
        "rooms",
        Map.of("number", "H-" + UUID.randomUUID().toString().substring(0, 8), "area", 20,
            "price", 3000000, "buildingId", owner.first("buildings"), "type", "Studio"));
    int room = owner.first("rooms");
    owner.create(
        "listings",
        Map.of("roomId", room, "title", "Hold listing", "description", "Hold room",
            "phone", "0900000004", "images", "https://example.com/hold.jpg",
            "published", false));
    int listing =
        db.queryForObject("SELECT id FROM tin_dang WHERE phong_id=?", Integer.class, room);
    db.update("UPDATE tin_dang SET trang_thai='DA_DUYET' WHERE id=?", listing);
    a.request(
        "POST", "/requests",
        Map.of("roomId", listing, "name", "Khách", "phone", "0900000005", "date", day(1),
            "time", "09:00", "type", "Đăng ký thuê"),
        200);
    int hold = a.first("requests");
    owner.request(
        "PATCH", "/requests/" + hold,
        Map.of("status", "Đã giữ chỗ", "holdDeposit", 500000, "holdUntil", day(0)), 200);
    db.update("UPDATE portal_viewing_request SET hold_until=? WHERE id=?", day(-1), hold);
    lifecycle.run();
    assertThat(byId(a.state().get("requests"), hold).get("status").asText())
        .isEqualTo("Hết hạn giữ chỗ");
    assertThat(byId(owner.state().get("rooms"), room).get("roomState").asText())
        .isEqualTo("TRONG");
  }

  @Test
  void credentialsAreVerifiedAndSessionsRotate() throws Exception {
    Client c = new Client();
    String email = UUID.randomUUID() + "@integration.invalid";
    var r =
        c.request(
            "POST",
            "/auth/register",
            Map.of(
                "name",
                "Integration account",
                "email",
                email,
                "password",
                "An actual password!",
                "role",
                "tenant"),
            200);
    c.session = (MockHttpSession) r.getRequest().getSession();
    c.csrf = tree(r).get("csrfToken").asText();
    c.request("POST", "/auth/logout", Map.of(), 200);
    Client login = new Client();
    login.request(
        "POST", "/auth/login", Map.of("email", email, "password", "incorrect password"), 401);
    var success =
        login.request(
            "POST", "/auth/login", Map.of("email", email, "password", "An actual password!"), 200);
    assertThat(tree(success).get("user").get("email").asText()).isEqualTo(email);
    assertThat(tree(success).get("csrfToken").asText()).isNotEqualTo(login.csrf);
  }
}
