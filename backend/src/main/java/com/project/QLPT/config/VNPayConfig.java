package com.project.QLPT.config;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class VNPayConfig {

  @Value("${vnpay.tmn-code:}")
  private String tmnCode;

  @Value("${vnpay.hash-secret:}")
  private String hashSecret;

  @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
  private String payUrl;

  @Value("${vnpay.return-url:http://localhost:5174/thanh-toan/ket-qua}")
  private String returnUrl;

  @Value("${vnpay.version:2.1.0}")
  private String version;

  @Value("${vnpay.command:pay}")
  private String command;

  public static String hmacSHA512(final String key, final String data) {
    try {
      if (key == null || data == null) {
        throw new NullPointerException("Key and data must not be null");
      }
      final Mac hmac512 = Mac.getInstance("HmacSHA512");
      byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
      final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
      hmac512.init(secretKey);
      byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
      byte[] result = hmac512.doFinal(dataBytes);
      StringBuilder sb = new StringBuilder(2 * result.length);
      for (byte b : result) {
        sb.append(String.format("%02x", b & 0xff));
      }
      return sb.toString();
    } catch (Exception ex) {
      return "";
    }
  }

  public static String getIpAddress(HttpServletRequest request) {
    String ipAddress = request.getHeader("X-FORWARDED-FOR");
    if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
      ipAddress = request.getHeader("Proxy-Client-IP");
    }
    if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
      ipAddress = request.getHeader("WL-Proxy-Client-IP");
    }
    if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
      ipAddress = request.getRemoteAddr();
    }
    if ("0:0:0:0:0:0:0:1".equals(ipAddress) || "::1".equals(ipAddress)) {
      ipAddress = "127.0.0.1";
    }
    if (ipAddress != null && ipAddress.contains(",")) {
      ipAddress = ipAddress.split(",")[0].trim();
    }
    return ipAddress != null ? ipAddress : "127.0.0.1";
  }

  /** Đã cấu hình mã website và khóa bí mật (qua biến môi trường) hay chưa. */
  public boolean isConfigured() {
    return tmnCode != null && !tmnCode.isBlank() && hashSecret != null && !hashSecret.isBlank();
  }

  /**
   * Chuỗi tham số đã sắp xếp theo tên và mã hóa URL, bỏ qua giá trị rỗng. Dùng chung cho cả chuỗi
   * ký và query string để hai bên luôn khớp (không sinh dấu {@code &} thừa khi tham số cuối rỗng).
   */
  public static String canonicalQuery(Map<String, String> fields) {
    List<String> names = new ArrayList<>(fields.keySet());
    Collections.sort(names);
    List<String> parts = new ArrayList<>();
    for (String name : names) {
      String value = fields.get(name);
      if (value == null || value.isEmpty()) continue;
      parts.add(
          URLEncoder.encode(name, StandardCharsets.US_ASCII)
              + "="
              + URLEncoder.encode(value, StandardCharsets.US_ASCII));
    }
    return String.join("&", parts);
  }

  public static String hashAllFields(Map<String, String> fields, String secretKey) {
    return hmacSHA512(secretKey, canonicalQuery(fields));
  }
}
