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

  @Value("${vnpay.tmn-code:RTUAGMBD}")
  private String tmnCode;

  @Value("${vnpay.hash-secret:FVNTWBSNNOKMGVRMARXUEDPESLSRJDLJ}")
  private String hashSecret;

  @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
  private String payUrl;

  @Value("${vnpay.return-url:http://localhost:5173/thanh-toan/ket-qua}")
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

  public static String hashAllFields(Map<String, String> fields, String secretKey) {
    List<String> fieldNames = new ArrayList<>(fields.keySet());
    Collections.sort(fieldNames);
    StringBuilder sb = new StringBuilder();
    Iterator<String> itr = fieldNames.iterator();
    while (itr.hasNext()) {
      String fieldName = itr.next();
      String fieldValue = fields.get(fieldName);
      if (fieldValue != null && !fieldValue.isEmpty()) {
        try {
          sb.append(fieldName);
          sb.append("=");
          sb.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
          if (itr.hasNext()) {
            sb.append("&");
          }
        } catch (Exception ignored) {
        }
      }
    }
    return hmacSHA512(secretKey, sb.toString());
  }
}
