package com.project.QLPT.experience;

import com.project.QLPT.exception.BusinessException;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.LocalDate;
import java.util.*;
import java.util.HexFormat;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AccountService {
  private final JdbcTemplate db;
  private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder(12);
  // Equal-cost verification for unknown accounts avoids an email-existence timing shortcut.
  private final String dummyHash = passwords.encode(UUID.randomUUID().toString());

  public Map<String, Object> profile(long id) {
    var rows =
        db.queryForList(
            "SELECT id,email,name,role,phone,birthday,address FROM app_account WHERE id=?", id);
    if (rows.isEmpty())
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập đã hết hạn.");
    var result = rows.getFirst();
    result.put("role", result.get("role").toString().toLowerCase(Locale.ROOT));
    result.put(
        "linkedTenantIds",
        db.queryForList(
            "SELECT tenant_id FROM app_tenant_link WHERE account_id=?", Integer.class, id));
    return ExperienceService.normalizeDates(result);
  }

  public void owner(long id) {
    if (!"OWNER"
        .equals(db.queryForObject("SELECT role FROM app_account WHERE id=?", String.class, id)))
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Chỉ chủ trọ có quyền thực hiện thao tác này.");
  }

  @Transactional
  public long register(Map<String, Object> data) {
    String email = email(data), password = password(data, 72);
    if (password.getBytes(StandardCharsets.UTF_8).length > 72 || password.length() < 8)
      throw new BusinessException("Mật khẩu cần ít nhất 8 ký tự và tối đa 72 byte.");
    String role = text(data, "role", 10).toUpperCase(Locale.ROOT);
    if (!Set.of("TENANT", "OWNER").contains(role))
      throw new BusinessException("Vai trò không hợp lệ.");
    String name = text(data, "name", 255);
    if (db.queryForObject("SELECT COUNT(*) FROM app_account WHERE email=?", Integer.class, email)
        > 0) throw new BusinessException("Email đã được đăng ký.");
    db.update(
        "INSERT INTO app_account(email,password_hash,name,role) VALUES(?,?,?,?)",
        email,
        passwords.encode(password),
        name,
        role);
    return db.queryForObject("SELECT id FROM app_account WHERE email=?", Long.class, email);
  }

  public long login(Map<String, Object> data) {
    String email = email(data), password = password(data, 72);
    var rows = db.queryForList("SELECT id,password_hash FROM app_account WHERE email=?", email);
    String hash = rows.isEmpty() ? dummyHash : rows.getFirst().get("password_hash").toString();
    boolean matches = passwords.matches(password, hash);
    if (rows.isEmpty() || !matches)
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu chưa đúng.");
    return ((Number) rows.getFirst().get("id")).longValue();
  }

  @Transactional
  public void update(long id, Map<String, Object> data) {
    String birthday = optional(data, "birthday", 10);
    if (!birthday.isEmpty() && LocalDate.parse(birthday).isAfter(LocalDate.now()))
      throw new BusinessException("Ngày sinh không được trong tương lai.");
    // Email is the login identity, changed only through a separately verified flow.
    db.update(
        "UPDATE app_account SET name=?,phone=?,birthday=?,address=? WHERE id=?",
        text(data, "name", 255),
        optional(data, "phone", 20),
        birthday.isEmpty() ? null : LocalDate.parse(birthday),
        optional(data, "address", 500),
        id);
  }

  @Transactional
  public Map<String, Object> invite(long owner, int tenant) {
    owner(owner);
    if (db.queryForObject(
            "SELECT COUNT(*) FROM nguoi_thue WHERE id=? AND owner_id=?",
            Integer.class,
            tenant,
            owner)
        != 1) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người thuê.");
    if (db.queryForObject(
            "SELECT COUNT(*) FROM app_tenant_link WHERE tenant_id=?", Integer.class, tenant)
        > 0) throw new BusinessException("Hồ sơ đã được liên kết với một tài khoản.");
    byte[] bytes = new byte[24];
    new SecureRandom().nextBytes(bytes);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    db.update(
        "INSERT INTO app_tenant_invitation(tenant_id,token_hash,expires_at)"
            + " VALUES(?,?,DATE_ADD(NOW(),INTERVAL 24 HOUR)) ON DUPLICATE KEY UPDATE"
            + " token_hash=VALUES(token_hash),expires_at=VALUES(expires_at)",
        tenant,
        digest(token));
    return Map.of("code", token, "expiresInHours", 24);
  }

  @Transactional
  public void redeem(long account, Map<String, Object> data) {
    if (!"tenant".equals(profile(account).get("role")))
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Liên kết hồ sơ dành cho tài khoản người thuê.");
    String token = text(data, "code", 100);
    var rows =
        db.queryForList(
            "SELECT tenant_id FROM app_tenant_invitation WHERE token_hash=? AND expires_at>NOW()"
                + " FOR UPDATE",
            digest(token));
    if (rows.isEmpty()) throw new BusinessException("Mã liên kết không hợp lệ hoặc đã hết hạn.");
    int tenant = ((Number) rows.getFirst().get("tenant_id")).intValue();
    db.update("INSERT INTO app_tenant_link(tenant_id,account_id) VALUES(?,?)", tenant, account);
    db.update("DELETE FROM app_tenant_invitation WHERE tenant_id=?", tenant);
  }

  static String digest(String token) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }

  static String optional(Map<String, Object> data, String key, int max) {
    String value = Objects.toString(data.get(key), "").trim();
    if (value.length() > max)
      throw new BusinessException("Trường " + key + " tối đa " + max + " ký tự.");
    return value;
  }

  static String text(Map<String, Object> data, String key, int max) {
    String value = optional(data, key, max);
    if (value.isBlank()) throw new BusinessException("Vui lòng nhập " + key + ".");
    return value;
  }

  private String password(Map<String, Object> data, int max) {
    String value = Objects.toString(data.get("password"), "");
    if (value.isEmpty()
        || value.length() > max
        || value.getBytes(StandardCharsets.UTF_8).length > 72)
      throw new BusinessException("Mật khẩu không hợp lệ.");
    return value;
  }

  private String email(Map<String, Object> data) {
    String email = text(data, "email", 254).toLowerCase(Locale.ROOT);
    if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))
      throw new BusinessException("Email không hợp lệ.");
    return email;
  }
}
