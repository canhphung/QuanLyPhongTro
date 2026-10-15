package com.project.QLPT.experience;

import jakarta.servlet.http.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/app")
@RequiredArgsConstructor
public class ExperienceController {
  private final AccountService accounts;
  private final AuthRateLimit rateLimit;
  private final ExperienceService app;

  @GetMapping("/session")
  public Map<String, Object> session(HttpServletRequest r) {
    var result = new LinkedHashMap<String, Object>();
    var session = r.getSession(true);
    result.put("csrfToken", AppAccess.csrf(session));
    var id = (Long) session.getAttribute(AppAccess.USER);
    result.put("user", id == null ? null : accounts.profile(id));
    return result;
  }

  @PostMapping("/auth/{action:login|register}")
  public Map<String, Object> auth(
      @PathVariable String action, @RequestBody Map<String, Object> d, HttpServletRequest r) {
    rateLimit.check(r.getRemoteAddr());
    long id = action.equals("register") ? accounts.register(d) : accounts.login(d);
    r.getSession().invalidate();
    var session = r.getSession(true);
    session.setAttribute(AppAccess.USER, id);
    return session(r);
  }

  @PostMapping("/auth/logout")
  public void logout(HttpServletRequest r) {
    r.getSession().invalidate();
  }

  @GetMapping("/state")
  public Map<String, Object> state(HttpServletRequest r) {
    var s = r.getSession(false);
    return app.state(s == null ? null : (Long) s.getAttribute(AppAccess.USER));
  }

  @GetMapping("/listings")
  public Object listings() {
    return app.catalog();
  }

  @PutMapping("/profile")
  public void profile(HttpServletRequest r, @RequestBody Map<String, Object> d) {
    accounts.update(AppAccess.account(r), d);
  }

  @PostMapping("/tenant-link")
  public void link(HttpServletRequest r, @RequestBody Map<String, Object> d) {
    accounts.redeem(AppAccess.account(r), d);
  }

  @PostMapping("/owner/tenants/{tenant}/invitation")
  public Object invite(HttpServletRequest r, @PathVariable int tenant) {
    return accounts.invite(AppAccess.account(r), tenant);
  }

  @PostMapping("/owner/{kind}")
  public void create(
      HttpServletRequest r, @PathVariable String kind, @RequestBody Map<String, Object> d) {
    app.save(AppAccess.account(r), kind, null, d);
  }

  @PutMapping("/owner/{kind}/{id}")
  public void update(
      HttpServletRequest r,
      @PathVariable String kind,
      @PathVariable int id,
      @RequestBody Map<String, Object> d) {
    app.save(AppAccess.account(r), kind, id, d);
  }

  @DeleteMapping("/owner/{kind}/{id}")
  public void delete(HttpServletRequest r, @PathVariable String kind, @PathVariable int id) {
    app.delete(AppAccess.account(r), kind, id);
  }

  @PostMapping("/owner/contracts/{id}/{action:end|cancel}")
  public void contractAction(
      HttpServletRequest r,
      @PathVariable int id,
      @PathVariable String action,
      @RequestBody Map<String, Object> d) {
    app.contractAction(AppAccess.account(r), id, action, d);
  }

  @PostMapping("/owner/contracts/{id}/members")
  public void addMember(
      HttpServletRequest r, @PathVariable int id, @RequestBody Map<String, Object> d) {
    app.member(AppAccess.account(r), id, null, "POST", d);
  }

  @PutMapping("/owner/contracts/{id}/members/{tenant}")
  public void editMember(
      HttpServletRequest r,
      @PathVariable int id,
      @PathVariable int tenant,
      @RequestBody Map<String, Object> d) {
    app.member(AppAccess.account(r), id, tenant, "PUT", d);
  }

  @DeleteMapping("/owner/contracts/{id}/members/{tenant}")
  public void deleteMember(HttpServletRequest r, @PathVariable int id, @PathVariable int tenant) {
    app.member(AppAccess.account(r), id, tenant, "DELETE", Map.of());
  }

  @PostMapping("/owner/invoices/{id}/lines")
  public void addLine(
      HttpServletRequest r, @PathVariable int id, @RequestBody Map<String, Object> d) {
    app.line(AppAccess.account(r), id, null, "POST", d);
  }

  @PutMapping("/owner/invoices/{id}/lines/{line}")
  public void editLine(
      HttpServletRequest r,
      @PathVariable int id,
      @PathVariable int line,
      @RequestBody Map<String, Object> d) {
    app.line(AppAccess.account(r), id, line, "PUT", d);
  }

  @DeleteMapping("/owner/invoices/{id}/lines/{line}")
  public void deleteLine(HttpServletRequest r, @PathVariable int id, @PathVariable int line) {
    app.line(AppAccess.account(r), id, line, "DELETE", Map.of());
  }

  @PutMapping("/favorites/{room}")
  public void favorite(HttpServletRequest r, @PathVariable int room) {
    app.favorite(AppAccess.account(r), room, true);
  }

  @DeleteMapping("/favorites/{room}")
  public void unfavorite(HttpServletRequest r, @PathVariable int room) {
    app.favorite(AppAccess.account(r), room, false);
  }

  @PostMapping("/requests")
  public void request(HttpServletRequest r, @RequestBody Map<String, Object> d) {
    app.request(AppAccess.account(r), d);
  }

  @PatchMapping("/requests/{id}")
  public void requestStatus(
      HttpServletRequest r, @PathVariable int id, @RequestBody Map<String, Object> d) {
    app.requestStatus(AppAccess.account(r), id, d);
  }
}
