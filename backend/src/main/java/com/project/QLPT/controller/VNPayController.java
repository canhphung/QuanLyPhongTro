package com.project.QLPT.controller;

import com.project.QLPT.exception.BusinessException;
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

    Integer invoiceId;
    BigDecimal customAmount = null;
    try {
      invoiceId =
          request.get("invoiceId") == null
              ? null
              : Integer.valueOf(request.get("invoiceId").toString().trim());
      Object amount = request.get("amount");
      if (amount != null && !amount.toString().isBlank())
        customAmount = new BigDecimal(amount.toString().trim());
    } catch (NumberFormatException e) {
      throw new BusinessException("Mã hóa đơn hoặc số tiền không hợp lệ");
    }
    if (invoiceId == null || invoiceId < 1) {
      return ResponseEntity.badRequest()
          .body(Map.of("message", "Vui lòng cung cấp mã hóa đơn (invoiceId)"));
    }
    Object bank = request.get("bankCode");
    String bankCode = bank == null ? null : bank.toString();

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
