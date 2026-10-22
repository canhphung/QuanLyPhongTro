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

  private final org.springframework.security.web.context.SecurityContextRepository contexts;
  private final org.springframework.security.web.csrf.CsrfTokenRepository tokens;

  @GetMapping("/session")
  public Map<String, Object> session(org.springframework.security.web.csrf.CsrfToken token) {
    var result = new LinkedHashMap<String, Object>();
    result.put("csrfToken", token.getToken());
    Long id = accounts.optionalId();
    result.put("user", id == null ? null : accounts.profile(id));
    return result;
  }

  @PostMapping("/auth/{action:login|register}")
  public Map<String, Object> auth(
      @PathVariable String action,
      @RequestBody Map<String, Object> d,
      HttpServletRequest request,
      HttpServletResponse response) {
    rateLimit.check(request.getRemoteAddr());
    if (action.equals("register")) accounts.register(d);
    var authentication = accounts.login(d);
    request.getSession(true);
    request.changeSessionId();
    var context =
        org.springframework.security.core.context.SecurityContextHolder.createEmptyContext();
    context.setAuthentication(authentication);
    org.springframework.security.core.context.SecurityContextHolder.setContext(context);
    contexts.saveContext(context, request, response);
    tokens.saveToken(null, request, response);
    var token = tokens.generateToken(request);
    tokens.saveToken(token, request, response);
    return session(token);
  }

  @PostMapping("/auth/logout")
  public void logout(HttpServletRequest request, HttpServletResponse response) {
    var authentication =
        org.springframework.security.core.context.SecurityContextHolder.getContext()
            .getAuthentication();
    new org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler()
        .logout(request, response, authentication);
    tokens.saveToken(null, request, response);
  }

  @GetMapping("/state")
  public Map<String, Object> state() {
    return app.state(accounts.optionalId());
  }

  @GetMapping("/listings")
  public Object listings() {
    return app.catalog();
  }

  @PutMapping("/profile")
  public void profile(HttpServletRequest r, @RequestBody Map<String, Object> d) {
    accounts.update(accounts.currentId(), d);
  }

  @PostMapping("/tenant-link")
  public void link(HttpServletRequest r, @RequestBody Map<String, Object> d) {
    accounts.redeem(accounts.currentId(), d);
  }

  @PostMapping("/owner/tenants/{tenant}/invitation")
  public Object invite(HttpServletRequest r, @PathVariable int tenant) {
    return accounts.invite(accounts.currentId(), tenant);
  }

  @PostMapping(
      value = "/owner/upload",
      consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
  public Map<String, Object> upload(
      @RequestParam("files") org.springframework.web.multipart.MultipartFile[] files) {
    return Map.of("urls", app.uploadImages(files));
  }

  @PostMapping("/owner/{kind}")
  public void create(
      HttpServletRequest r, @PathVariable String kind, @RequestBody Map<String, Object> d) {
    app.save(accounts.currentId(), kind, null, d);
  }

  @PutMapping("/owner/{kind}/{id}")
  public void update(
      HttpServletRequest r,
      @PathVariable String kind,
      @PathVariable int id,
      @RequestBody Map<String, Object> d) {
    app.save(accounts.currentId(), kind, id, d);
  }

  @DeleteMapping("/owner/{kind}/{id}")
  public void delete(
      HttpServletRequest r,
      @PathVariable String kind,
      @PathVariable int id,
      @RequestParam(required = false) Integer version) {
    app.delete(accounts.currentId(), kind, id, version);
  }

  @PostMapping("/owner/listings/{id}/{action:submit|withdraw|hide}")
  public void listingAction(
      @PathVariable int id, @PathVariable String action, @RequestBody Map<String, Object> d) {
    app.listingAction(accounts.currentId(), id, action, d);
  }

  @PostMapping("/owner/contracts/{id}/{action:end|cancel}")
  public void contractAction(
      HttpServletRequest r,
      @PathVariable int id,
      @PathVariable String action,
      @RequestBody Map<String, Object> d) {
    app.contractAction(accounts.currentId(), id, action, d);
  }

  @PostMapping("/owner/contracts/{id}/members")
  public void addMember(
      HttpServletRequest r, @PathVariable int id, @RequestBody Map<String, Object> d) {
    app.member(accounts.currentId(), id, null, "POST", d);
  }

  @PutMapping("/owner/contracts/{id}/members/{tenant}")
  public void editMember(
      HttpServletRequest r,
      @PathVariable int id,
      @PathVariable int tenant,
      @RequestBody Map<String, Object> d) {
    app.member(accounts.currentId(), id, tenant, "PUT", d);
  }

  @DeleteMapping("/owner/contracts/{id}/members/{tenant}")
  public void deleteMember(HttpServletRequest r, @PathVariable int id, @PathVariable int tenant) {
    app.member(accounts.currentId(), id, tenant, "DELETE", Map.of());
  }

  @PostMapping("/owner/invoices/{id}/lines")
  public void addLine(
      HttpServletRequest r, @PathVariable int id, @RequestBody Map<String, Object> d) {
    app.line(accounts.currentId(), id, null, "POST", d);
  }

  @PutMapping("/owner/invoices/{id}/lines/{line}")
  public void editLine(
      HttpServletRequest r,
      @PathVariable int id,
      @PathVariable int line,
      @RequestBody Map<String, Object> d) {
    app.line(accounts.currentId(), id, line, "PUT", d);
  }

  @DeleteMapping("/owner/invoices/{id}/lines/{line}")
  public void deleteLine(HttpServletRequest r, @PathVariable int id, @PathVariable int line) {
    app.line(accounts.currentId(), id, line, "DELETE", Map.of());
  }

  @PutMapping("/favorites/{room}")
  public void favorite(HttpServletRequest r, @PathVariable int room) {
    app.favorite(accounts.currentId(), room, true);
  }

  @DeleteMapping("/favorites/{room}")
  public void unfavorite(HttpServletRequest r, @PathVariable int room) {
    app.favorite(accounts.currentId(), room, false);
  }

  @PostMapping("/requests")
  public void request(HttpServletRequest r, @RequestBody Map<String, Object> d) {
    app.request(accounts.currentId(), d);
  }

  @PatchMapping("/requests/{id}")
  public void requestStatus(
      HttpServletRequest r, @PathVariable int id, @RequestBody Map<String, Object> d) {
    app.requestStatus(accounts.currentId(), id, d);
  }
}
