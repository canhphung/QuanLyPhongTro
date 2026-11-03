package com.project.QLPT.experience;

import com.project.QLPT.dto.request.DangKyRequest;
import com.project.QLPT.enums.VaiTroTaiKhoan;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.service.AuthService;
import com.project.QLPT.service.CurrentAccountService;
import jakarta.validation.Validator;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** The browser portal uses the same Spring Security identity and dev accounts as the REST APIs. */
@Service
@RequiredArgsConstructor
public class AccountService {
  private final JdbcTemplate db;
  private final CurrentAccountService current;
  private final AuthService auth;
  private final AuthenticationManager authenticationManager;
  private final Validator validator;

  public Long optionalId() {
    var authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null
        || !authentication.isAuthenticated()
        || authentication instanceof AnonymousAuthenticationToken) return null;
    try {
      return currentId();
    } catch (ResponseStatusException e) {
      if (e.getStatusCode().value() == 401) return null;
      throw e;
    }
  }

  public long currentId() {
    return current.getTaiKhoan().getId().longValue();
  }

  public Map<String, Object> profile(long id) {
    var rows =
        db.queryForList(
            "SELECT id,email,ho_ten name,phone,birthday,address FROM tai_khoan WHERE id=? AND"
                + " hoat_dong=TRUE",
            id);
    if (rows.isEmpty())
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập đã hết hạn.");
    var result = rows.getFirst();
    var roles =
        db.queryForList(
            "SELECT vai_tro FROM tai_khoan_vai_tro WHERE tai_khoan_id=?", String.class, id);
    result.put(
        "role", roles.contains("CHU_TRO") ? "owner" : roles.contains("ADMIN") ? "admin" : "tenant");
    result.put("roles", roles);
    result.put(
        "linkedTenantIds",
        db.queryForList("SELECT id FROM nguoi_thue WHERE tai_khoan_id=?", Integer.class, id));
    return ExperienceService.normalizeDates(result);
  }

  public int ownerId(long id) {
    if (currentId() != id) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    return current.getChuTro().getId();
  }

  public void owner(long id) {
    ownerId(id);
  }

  public long register(Map<String, Object> d) {
    String role = text(d, "role", 10);
    if (!Set.of("owner", "tenant").contains(role))
      throw new BusinessException("Vai trò không hợp lệ.");
    var request =
        new DangKyRequest(
            text(d, "email", 254),
            Objects.toString(d.get("password"), ""),
            text(d, "name", 255),
            role.equals("owner") ? VaiTroTaiKhoan.CHU_TRO : VaiTroTaiKhoan.NGUOI_THUE);
    var errors = validator.validate(request);
    if (!errors.isEmpty()) throw new BusinessException(errors.iterator().next().getMessage());
    return auth.register(request).id();
  }

  public Authentication login(Map<String, Object> d) {
    try {
      return authenticationManager.authenticate(
          UsernamePasswordAuthenticationToken.unauthenticated(
              text(d, "email", 254).toLowerCase(Locale.ROOT),
              Objects.toString(d.get("password"), "")));
    } catch (AuthenticationException e) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu chưa đúng.");
    }
  }

  @Transactional
  public void update(long id, Map<String, Object> d) {
    String birthday = optional(d, "birthday", 10);
    if (!birthday.isEmpty()
        && LocalDate.parse(birthday).isAfter(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"))))
      throw new BusinessException("Ngày sinh không được trong tương lai.");
    db.update(
        "UPDATE tai_khoan SET ho_ten=?,phone=?,birthday=?,address=? WHERE id=?",
        text(d, "name", 255),
        optional(d, "phone", 20),
        birthday.isEmpty() ? null : LocalDate.parse(birthday),
        optional(d, "address", 500),
        id);
    db.update(
        "UPDATE chu_tro SET ten_hien_thi=?,so_dien_thoai=? WHERE tai_khoan_id=?",
        text(d, "name", 255),
        optional(d, "phone", 20),
        id);
  }

  @Transactional
  public Map<String, Object> invite(long account, int tenant) {
    int owner = ownerId(account);
    var rows =
        db.queryForList(
            "SELECT tai_khoan_id FROM nguoi_thue WHERE id=? AND chu_tro_id=? FOR UPDATE",
            tenant,
            owner);
    if (rows.isEmpty())
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người thuê.");
    if (rows.getFirst().get("tai_khoan_id") != null)
      throw new BusinessException("Hồ sơ đã được liên kết.");
    byte[] bytes = new byte[24];
    new SecureRandom().nextBytes(bytes);
    String code = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    db.update(
        "INSERT INTO portal_tenant_invitation(tenant_id,token_hash,expires_at)"
            + " VALUES(?,?,DATE_ADD(NOW(),INTERVAL 24 HOUR)) ON DUPLICATE KEY UPDATE"
            + " token_hash=VALUES(token_hash),expires_at=VALUES(expires_at)",
        tenant,
        digest(code));
    return Map.of("code", code, "expiresInHours", 24);
  }

  @Transactional
  public void redeem(long account, Map<String, Object> d) {
    if (!"tenant".equals(profile(account).get("role")))
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Liên kết hồ sơ dành cho người thuê.");
    var rows =
        db.queryForList(
            "SELECT tenant_id FROM portal_tenant_invitation WHERE token_hash=? AND expires_at>NOW()"
                + " FOR UPDATE",
            digest(text(d, "code", 100)));
    if (rows.isEmpty()) throw new BusinessException("Mã liên kết không hợp lệ hoặc đã hết hạn.");
    int tenant = ((Number) rows.getFirst().get("tenant_id")).intValue();
    if (db.update(
            "UPDATE nguoi_thue SET tai_khoan_id=? WHERE id=? AND tai_khoan_id IS NULL",
            account,
            tenant)
        != 1) throw new BusinessException("Hồ sơ đã được liên kết.");
    db.update("DELETE FROM portal_tenant_invitation WHERE tenant_id=?", tenant);
  }

  private String digest(String value) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }

  static String optional(Map<String, Object> d, String key, int max) {
    String s = Objects.toString(d.get(key), "").trim();
    if (s.length() > max)
      throw new BusinessException("Trường " + key + " tối đa " + max + " ký tự.");
    return s;
  }

  static String text(Map<String, Object> d, String key, int max) {
    String s = optional(d, key, max);
    if (s.isBlank()) throw new BusinessException("Vui lòng nhập " + key + ".");
    return s;
  }
}
