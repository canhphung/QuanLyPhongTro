package com.project.QLPT.controller;

import com.project.QLPT.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment/vnpay")
@RequiredArgsConstructor
public class VNPayController {

  private final VNPayService vnPayService;

  @PostMapping("/create-payment")
  public ResponseEntity<Map<String, Object>> createPayment(
      @RequestBody Map<String, Object> request,
      HttpServletRequest servletRequest) {

    Integer invoiceId = null;
    if (request.get("invoiceId") != null) {
      invoiceId = Integer.parseInt(request.get("invoiceId").toString());
    }
    if (invoiceId == null) {
      return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng cung cấp mã hóa đơn (invoiceId)"));
    }

    BigDecimal customAmount = null;
    if (request.get("amount") != null && !request.get("amount").toString().isBlank()) {
      customAmount = new BigDecimal(request.get("amount").toString());
    }

    String bankCode = (String) request.get("bankCode");

    Map<String, Object> result =
        vnPayService.createPaymentUrl(invoiceId, customAmount, bankCode, servletRequest);

    return ResponseEntity.ok(result);
  }

  @GetMapping("/ipn")
  public ResponseEntity<Map<String, String>> processIpn(
      @RequestParam Map<String, String> allParams) {
    Map<String, String> result = vnPayService.processIpn(allParams);
    return ResponseEntity.ok(result);
  }

  @GetMapping("/verify")
  public ResponseEntity<Map<String, Object>> verifyReturn(
      @RequestParam Map<String, String> allParams) {
    Map<String, Object> result = vnPayService.verifyAndProcessReturn(allParams);
    return ResponseEntity.ok(result);
  }
}
