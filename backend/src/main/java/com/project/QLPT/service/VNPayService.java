package com.project.QLPT.service;

import com.project.QLPT.config.VNPayConfig;
import com.project.QLPT.entity.HoaDon;
import com.project.QLPT.entity.ThanhToan;
import com.project.QLPT.enums.PhuongThucThanhToan;
import com.project.QLPT.enums.TrangThaiHoaDon;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.exception.ResourceNotFoundException;
import com.project.QLPT.repository.ChiTietHoaDonRepository;
import com.project.QLPT.repository.HoaDonRepository;
import com.project.QLPT.repository.ThanhToanRepository;
import com.project.QLPT.service.support.InvoiceAmounts;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {

  private final VNPayConfig vnpConfig;
  private final HoaDonRepository hoaDonRepository;
  private final ChiTietHoaDonRepository chiTietHoaDonRepository;
  private final ThanhToanRepository thanhToanRepository;

  @PersistenceContext private EntityManager entityManager;

  private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
  private static final DateTimeFormatter DATE_FORMATTER =
      DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

  @Transactional(readOnly = true)
  public Map<String, Object> createPaymentUrl(
      Integer invoiceId,
      BigDecimal customAmount,
      String bankCode,
      HttpServletRequest request) {

    HoaDon hoaDon =
        hoaDonRepository
            .findById(invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn #" + invoiceId));

    BigDecimal tongTien = tinhTongTien(hoaDon);
    BigDecimal daThanhToan =
        Optional.ofNullable(thanhToanRepository.sumSoTienByHoaDonId(invoiceId))
            .orElse(BigDecimal.ZERO);
    BigDecimal conLai = tongTien.subtract(daThanhToan);

    if (conLai.compareTo(BigDecimal.ZERO) <= 0
        || hoaDon.getTrangThai() == TrangThaiHoaDon.DA_THANH_TOAN) {
      throw new BusinessException("Hóa đơn #" + invoiceId + " đã được thanh toán đầy đủ.");
    }

    BigDecimal soTienThanhToan = conLai;
    if (customAmount != null && customAmount.compareTo(BigDecimal.ZERO) > 0) {
      soTienThanhToan = customAmount.min(conLai);
    }

    long vnpAmount = soTienThanhToan.multiply(BigDecimal.valueOf(100)).longValue();
    String vnpTxnRef = invoiceId + "_" + System.currentTimeMillis();

    // Lấy thời gian hiện tại theo wall-clock hệ thống máy chủ (tránh lệch timezone gây lỗi code=15)
    LocalDateTime now = LocalDateTime.now();
    if (ZoneId.systemDefault().getRules().getOffset(java.time.Instant.now()).getTotalSeconds() == 0) {
      now = LocalDateTime.now(BUSINESS_ZONE);
    }
    String createDate = now.format(DATE_FORMATTER);
    String expireDate = now.plusMinutes(30).format(DATE_FORMATTER);

    String roomNumber =
        (hoaDon.getHopDong() != null && hoaDon.getHopDong().getPhong() != null)
            ? hoaDon.getHopDong().getPhong().getSoPhong()
            : "";
    String orderInfo = "Thanh toan hoa don #" + invoiceId + (roomNumber.isEmpty() ? "" : " P." + roomNumber);

    Map<String, String> vnpParams = new HashMap<>();
    vnpParams.put("vnp_Version", vnpConfig.getVersion());
    vnpParams.put("vnp_Command", vnpConfig.getCommand());
    vnpParams.put("vnp_TmnCode", vnpConfig.getTmnCode());
    vnpParams.put("vnp_Amount", String.valueOf(vnpAmount));
    vnpParams.put("vnp_CurrCode", "VND");
    vnpParams.put("vnp_TxnRef", vnpTxnRef);
    vnpParams.put("vnp_OrderInfo", orderInfo);
    vnpParams.put("vnp_OrderType", "billpayment");
    vnpParams.put("vnp_Locale", "vn");
    vnpParams.put("vnp_ReturnUrl", vnpConfig.getReturnUrl());
    vnpParams.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));
    vnpParams.put("vnp_CreateDate", createDate);
    vnpParams.put("vnp_ExpireDate", expireDate);

    if (bankCode != null && !bankCode.isBlank()) {
      vnpParams.put("vnp_BankCode", bankCode.trim());
    }

    // Sắp xếp các trường và tạo URL
    List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
    Collections.sort(fieldNames);

    StringBuilder hashData = new StringBuilder();
    StringBuilder query = new StringBuilder();

    Iterator<String> itr = fieldNames.iterator();
    while (itr.hasNext()) {
      String fieldName = itr.next();
      String fieldValue = vnpParams.get(fieldName);
      if (fieldValue != null && !fieldValue.isEmpty()) {
        try {
          hashData.append(fieldName).append("=").append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
          query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()))
              .append("=")
              .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
          if (itr.hasNext()) {
            query.append("&");
            hashData.append("&");
          }
        } catch (Exception e) {
          log.error("Lỗi mã hóa tham số VNPAY: {}", e.getMessage());
        }
      }
    }

    String secureHash = VNPayConfig.hmacSHA512(vnpConfig.getHashSecret(), hashData.toString());
    String paymentUrl = vnpConfig.getPayUrl() + "?" + query.toString() + "&vnp_SecureHash=" + secureHash;

    Map<String, Object> result = new LinkedHashMap<>();
    result.put("paymentUrl", paymentUrl);
    result.put("txnRef", vnpTxnRef);
    result.put("invoiceId", invoiceId);
    result.put("amount", soTienThanhToan);
    result.put("orderInfo", orderInfo);
    return result;
  }

  @Transactional(isolation = Isolation.READ_COMMITTED)
  public Map<String, String> processIpn(Map<String, String> params) {
    Map<String, String> cleanParams = new HashMap<>(params);
    String secureHash = cleanParams.remove("vnp_SecureHash");
    cleanParams.remove("vnp_SecureHashType");

    String expectedHash = VNPayConfig.hashAllFields(cleanParams, vnpConfig.getHashSecret());
    if (secureHash == null || !expectedHash.equalsIgnoreCase(secureHash)) {
      log.warn("VNPay IPN: Sai chữ ký checksum");
      return Map.of("RspCode", "97", "Message", "Invalid Checksum");
    }

    String txnRef = cleanParams.get("vnp_TxnRef");
    if (txnRef == null || txnRef.isBlank()) {
      return Map.of("RspCode", "01", "Message", "Order Not Found");
    }

    Integer invoiceId;
    try {
      invoiceId = Integer.parseInt(txnRef.split("_")[0]);
    } catch (Exception e) {
      return Map.of("RspCode", "01", "Message", "Invalid Order Ref");
    }

    Optional<HoaDon> optHoaDon = hoaDonRepository.findById(invoiceId);
    if (optHoaDon.isEmpty()) {
      return Map.of("RspCode", "01", "Message", "Order Not Found");
    }

    HoaDon hoaDon = optHoaDon.get();
    entityManager.refresh(hoaDon, LockModeType.PESSIMISTIC_WRITE);

    String transactionNo = cleanParams.get("vnp_TransactionNo");
    String maGiaoDich = "VNPAY_" + (transactionNo != null && !transactionNo.isBlank() ? transactionNo : txnRef);

    if (thanhToanRepository.existsByMaGiaoDich(maGiaoDich)) {
      log.info("VNPay IPN: Giao dịch {} đã được xác nhận trước đó.", maGiaoDich);
      return Map.of("RspCode", "02", "Message", "Order already confirmed");
    }

    String responseCode = cleanParams.get("vnp_ResponseCode");
    String transactionStatus = cleanParams.get("vnp_TransactionStatus");

    if ("00".equals(responseCode) && ("00".equals(transactionStatus) || transactionStatus == null)) {
      // Giao dịch thành công: TỰ ĐỘNG GẠCH NỢ
      BigDecimal soTienThu =
          new BigDecimal(cleanParams.get("vnp_Amount")).divide(BigDecimal.valueOf(100));

      LocalDateTime ngayThanhToan = LocalDateTime.now(BUSINESS_ZONE);
      String payDateStr = cleanParams.get("vnp_PayDate");
      if (payDateStr != null && payDateStr.length() == 14) {
        try {
          ngayThanhToan = LocalDateTime.parse(payDateStr, DATE_FORMATTER);
        } catch (Exception ignored) {
        }
      }

      ThanhToan thanhToan =
          ThanhToan.builder()
              .hoaDon(hoaDon)
              .soTien(soTienThu)
              .phuongThuc(PhuongThucThanhToan.CHUYEN_KHOAN)
              .maGiaoDich(maGiaoDich)
              .ngayThanhToan(ngayThanhToan)
              .build();

      thanhToanRepository.saveAndFlush(thanhToan);

      BigDecimal tongDaThu =
          Optional.ofNullable(thanhToanRepository.sumSoTienByHoaDonId(invoiceId))
              .orElse(BigDecimal.ZERO);
      BigDecimal tongTienHoaDon = tinhTongTien(hoaDon);

      if (tongDaThu.compareTo(tongTienHoaDon) >= 0) {
        hoaDon.setTrangThai(TrangThaiHoaDon.DA_THANH_TOAN);
      } else {
        hoaDon.setTrangThai(TrangThaiHoaDon.THANH_TOAN_MOT_PHAN);
      }
      hoaDonRepository.saveAndFlush(hoaDon);

      log.info(
          "VNPay IPN: Gạch nợ tự động thành công cho hóa đơn #{}. Số tiền: {} VND. Trạng thái: {}",
          invoiceId,
          soTienThu,
          hoaDon.getTrangThai());
    } else {
      log.info("VNPay IPN: Giao dịch thất bại/hủy trên VNPAY cho đơn {}. Mã lỗi: {}", invoiceId, responseCode);
    }

    return Map.of("RspCode", "00", "Message", "Confirm Success");
  }

  @Transactional(isolation = Isolation.READ_COMMITTED)
  public Map<String, Object> verifyAndProcessReturn(Map<String, String> params) {
    Map<String, String> cleanParams = new HashMap<>(params);
    String secureHash = cleanParams.remove("vnp_SecureHash");
    cleanParams.remove("vnp_SecureHashType");

    String expectedHash = VNPayConfig.hashAllFields(cleanParams, vnpConfig.getHashSecret());
    boolean validHash = secureHash != null && expectedHash.equalsIgnoreCase(secureHash);

    String responseCode = cleanParams.get("vnp_ResponseCode");
    String txnRef = cleanParams.get("vnp_TxnRef");
    String transactionNo = cleanParams.get("vnp_TransactionNo");
    String bankCode = cleanParams.get("vnp_BankCode");
    String amountStr = cleanParams.get("vnp_Amount");

    Integer invoiceId = null;
    if (txnRef != null && txnRef.contains("_")) {
      try {
        invoiceId = Integer.parseInt(txnRef.split("_")[0]);
      } catch (Exception ignored) {
      }
    }

    BigDecimal amount = BigDecimal.ZERO;
    if (amountStr != null) {
      try {
        amount = new BigDecimal(amountStr).divide(BigDecimal.valueOf(100));
      } catch (Exception ignored) {
      }
    }

    Map<String, Object> response = new LinkedHashMap<>();
    response.put("invoiceId", invoiceId);
    response.put("amount", amount);
    response.put("txnRef", txnRef);
    response.put("transactionNo", transactionNo);
    response.put("bankCode", bankCode);
    response.put("responseCode", responseCode);

    if (!validHash) {
      response.put("success", false);
      response.put("message", "Chữ ký xác thực giao dịch VNPAY không hợp lệ.");
      return response;
    }

    if ("00".equals(responseCode)) {
      // Đảm bảo gạch nợ ngay lập tức nếu IPN chưa kịp tới
      if (invoiceId != null) {
        String maGiaoDich = "VNPAY_" + (transactionNo != null && !transactionNo.isBlank() ? transactionNo : txnRef);
        if (!thanhToanRepository.existsByMaGiaoDich(maGiaoDich)) {
          Optional<HoaDon> optHoaDon = hoaDonRepository.findById(invoiceId);
          if (optHoaDon.isPresent()) {
            HoaDon hoaDon = optHoaDon.get();
            entityManager.refresh(hoaDon, LockModeType.PESSIMISTIC_WRITE);

            LocalDateTime ngayThanhToan = LocalDateTime.now(BUSINESS_ZONE);
            String payDateStr = cleanParams.get("vnp_PayDate");
            if (payDateStr != null && payDateStr.length() == 14) {
              try {
                ngayThanhToan = LocalDateTime.parse(payDateStr, DATE_FORMATTER);
              } catch (Exception ignored) {
              }
            }

            ThanhToan thanhToan =
                ThanhToan.builder()
                    .hoaDon(hoaDon)
                    .soTien(amount)
                    .phuongThuc(PhuongThucThanhToan.CHUYEN_KHOAN)
                    .maGiaoDich(maGiaoDich)
                    .ngayThanhToan(ngayThanhToan)
                    .build();

            thanhToanRepository.saveAndFlush(thanhToan);

            BigDecimal tongDaThu =
                Optional.ofNullable(thanhToanRepository.sumSoTienByHoaDonId(invoiceId))
                    .orElse(BigDecimal.ZERO);
            BigDecimal tongTienHoaDon = tinhTongTien(hoaDon);

            if (tongDaThu.compareTo(tongTienHoaDon) >= 0) {
              hoaDon.setTrangThai(TrangThaiHoaDon.DA_THANH_TOAN);
            } else {
              hoaDon.setTrangThai(TrangThaiHoaDon.THANH_TOAN_MOT_PHAN);
            }
            hoaDonRepository.saveAndFlush(hoaDon);
          }
        }
      }

      response.put("success", true);
      response.put("message", "Giao dịch thanh toán qua VNPAY thành công. Hóa đơn đã được tự động gạch nợ.");
    } else {
      response.put("success", false);
      response.put("message", getVnPayErrorMessage(responseCode));
    }

    return response;
  }

  private BigDecimal tinhTongTien(HoaDon hoaDon) {
    var lines = chiTietHoaDonRepository.findByHoaDon_Id(hoaDon.getId());
    List<BigDecimal> lineAmounts =
        lines.stream()
            .map(l -> InvoiceAmounts.lineTotal(l.getSoLuong(), l.getDonGia()))
            .toList();
    return InvoiceAmounts.total(hoaDon.getTienPhong(), lineAmounts);
  }

  private String getVnPayErrorMessage(String responseCode) {
    return switch (responseCode) {
      case "07" -> "Trừ tiền thành công nhưng giao dịch bị nghi ngờ gian lận.";
      case "09" -> "Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking tại ngân hàng.";
      case "10" -> "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.";
      case "11" -> "Đã hết hạn chờ thanh toán trên cổng VNPAY.";
      case "12" -> "Thẻ hoặc tài khoản ngân hàng của quý khách đang bị khóa.";
      case "13" -> "Quý khách nhập sai mật khẩu xác thực OTP. Vui lòng thử lại.";
      case "24" -> "Giao dịch bị hủy bởi người dùng.";
      case "51" -> "Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.";
      case "65" -> "Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày.";
      case "75" -> "Ngân hàng thanh toán đang bảo trì hệ thống.";
      case "79" -> "Nhập sai mật khẩu thanh toán quá số lần quy định.";
      default -> "Giao dịch thanh toán VNPAY không thành công (Mã lỗi: " + responseCode + ").";
    };
  }
}
