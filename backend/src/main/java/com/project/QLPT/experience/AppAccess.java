package com.project.QLPT.experience;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;

/** Session authentication and synchronizer-token CSRF protection for the browser API. */
@Component
public class AppAccess extends OncePerRequestFilter {
  static final String USER = "app.account";
  static final String CSRF = "app.csrf";

  public static long account(HttpServletRequest request) {
    var session = request.getSession(false);
    if (session == null || !(session.getAttribute(USER) instanceof Long id))
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập.");
    return id;
  }

  public static String csrf(HttpSession session) {
    if (session.getAttribute(CSRF) == null)
      session.setAttribute(CSRF, UUID.randomUUID().toString());
    return (String) session.getAttribute(CSRF);
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    String path = request.getServletPath();
    if (path.isEmpty()) path = request.getRequestURI().substring(request.getContextPath().length());
    if (!path.startsWith("/api/") || request.getMethod().equals("OPTIONS")) {
      chain.doFilter(request, response);
      return;
    }
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    // Legacy controllers were global and unauthenticated. Do not leave a bypass around scoped APIs.
    if (!path.startsWith("/api/app/")) {
      reject(
          response,
          request.getSession(false) == null ? 401 : 410,
          "Sử dụng API có phân quyền tại /api/app.");
      return;
    }
    if (!java.util.Set.of("GET", "HEAD").contains(request.getMethod())) {
      var session = request.getSession(false);
      String supplied = request.getHeader("X-CSRF-Token");
      if (session == null
          || supplied == null
          || !MessageDigest.isEqual(
              supplied.getBytes(StandardCharsets.UTF_8),
              csrf(session).getBytes(StandardCharsets.UTF_8))) {
        reject(response, 403, "Phiên làm việc đã thay đổi. Vui lòng tải lại trang.");
        return;
      }
    }
    chain.doFilter(request, response);
  }

  private void reject(HttpServletResponse response, int status, String message) throws IOException {
    response.setStatus(status);
    response.setContentType("application/json;charset=UTF-8");
    response.getWriter().write("{\"message\":\"" + message + "\"}");
  }
}
