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
            "published",
            false));
    assertThat(anonymous.state().get("publicRooms").toString())
        .doesNotContain("Integration listing");
    owner.request(
        "PUT",
        "/owner/listings/" + room,
        Map.of(
            "title",
            "Integration listing",
            "description",
            "Integration room description",
            "published",
            true),
        200);
    assertThat(anonymous.state().get("publicRooms").toString())
        .contains("Integration listing")
        .doesNotContain("cccd", "password_hash");
    tenant.request("PUT", "/favorites/" + room, null, 200);
    assertThat(tenant.state().get("saved").toString()).contains(String.valueOf(room));
    tenant.request(
        "POST",
        "/requests",
        Map.of(
            "roomId",
            room,
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
