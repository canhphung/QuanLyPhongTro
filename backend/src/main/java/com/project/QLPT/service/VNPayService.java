package com.project.QLPT.service;

import com.project.QLPT.config.VNPayConfig;
import com.project.QLPT.entity.HoaDon;
import com.project.QLPT.entity.ThanhToan;
import com.project.QLPT.enums.PhuongThucThanhToan;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.exception.ResourceNotFoundException;
import com.project.QLPT.repository.ChiTietHoaDonRepository;
import com.project.QLPT.repository.HoaDonRepository;
import com.project.QLPT.repository.ThanhToanRepository;
import com.project.QLPT.service.support.InvoiceAmounts;
import com.project.QLPT.service.support.PaymentAmounts;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Thanh toán hóa đơn qua VNPAY.
 *
 * <p>Mỗi lần tạo link thanh toán được lưu một dòng trong {@code vnpay_giao_dich} (khóa chính là
 * {@code vnp_TxnRef}) cùng số tiền dự kiến. Khi VNPAY gọi IPN hoặc người dùng quay lại trang kết
 * quả, giao dịch được xử lý đúng một lần: khóa dòng giao dịch rồi khóa hóa đơn, đối chiếu số tiền,
 * rồi mới ghi nhận thanh toán. Hai đường IPN và trang kết quả dùng chung một hàm nên không ghi trùng.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {

  static final String CHO_THANH_TOAN = "CHO_THANH_TOAN";
  static final String DA_GHI_NHAN = "DA_GHI_NHAN";
  static final String THAT_BAI = "THAT_BAI";
  static final String CAN_HOAN_TIEN = "CAN_HOAN_TIEN";

  /** Link thanh toán hết hạn sau bao nhiêu phút (vnp_ExpireDate). */
  private static final int EXPIRE_MINUTES = 15;

  private final VNPayConfig vnpConfig;
  private final HoaDonRepository hoaDonRepository;
  private final ChiTietHoaDonRepository chiTietHoaDonRepository;
  private final ThanhToanRepository thanhToanRepository;
  private final CurrentAccountService currentAccount;
  private final JdbcTemplate db;

  @PersistenceContext private EntityManager entityManager;

  private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
  private static final DateTimeFormatter DATE_FORMATTER =
      DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

  // ------------------------------------------------------------------ tạo link

  @Transactional(isolation = Isolation.READ_COMMITTED)
  public Map<String, Object> createPaymentUrl(
      Integer invoiceId, BigDecimal customAmount, String bankCode, HttpServletRequest request) {
    if (!vnpConfig.isConfigured())
      throw new BusinessException(
          "Chưa cấu hình VNPAY (VNPAY_TMN_CODE, VNPAY_HASH_SECRET) trên máy chủ.");
    int account = currentAccount.getTaiKhoan().getId().intValue();
    requireAccess(invoiceId, account);

    HoaDon hoaDon = lockInvoice(invoiceId);
    BigDecimal conLai = remaining(hoaDon);
    if (conLai.signum() <= 0)
      throw new BusinessException("Hóa đơn #" + invoiceId + " đã được thanh toán đầy đủ.");

    // Các link khác của hóa đơn còn đang chờ (chưa hết hạn) cũng có thể được thanh toán; không
    // cho tổng số tiền đang chờ vượt phần còn nợ để tránh thu vượt khi mở nhiều tab.
    LocalDateTime now = LocalDateTime.now(BUSINESS_ZONE);
    BigDecimal dangCho =
        db.queryForObject(
            "SELECT COALESCE(SUM(so_tien),0) FROM vnpay_giao_dich WHERE hoa_don_id=? AND"
                + " trang_thai=? AND het_han>?",
            BigDecimal.class,
            invoiceId,
            CHO_THANH_TOAN,
            now);
    BigDecimal conTheTao = conLai.subtract(dangCho == null ? BigDecimal.ZERO : dangCho);
    if (conTheTao.signum() <= 0)
      throw new BusinessException(
          "Hóa đơn đang có giao dịch VNPAY chờ thanh toán. Hoàn tất giao dịch đó hoặc thử lại sau "
              + EXPIRE_MINUTES
              + " phút.");

    BigDecimal soTien = customAmount == null ? conTheTao : customAmount;
    if (soTien.signum() <= 0 || soTien.stripTrailingZeros().scale() > 0)
      throw new BusinessException("Số tiền thanh toán phải là số nguyên dương (VND).");
    if (soTien.compareTo(conTheTao) > 0)
      throw new BusinessException(
          "Số tiền thanh toán tối đa " + conTheTao.toPlainString() + " ₫ cho hóa đơn này.");

    String txnRef = invoiceId + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    LocalDateTime expire = now.plusMinutes(EXPIRE_MINUTES);
    db.update(
        "INSERT INTO vnpay_giao_dich(txn_ref,hoa_don_id,tai_khoan_id,so_tien,trang_thai,het_han)"
            + " VALUES(?,?,?,?,?,?)",
        txnRef,
        invoiceId,
        account,
        soTien,
        CHO_THANH_TOAN,
        expire);

    String roomNumber =
        hoaDon.getHopDong() != null && hoaDon.getHopDong().getPhong() != null
            ? hoaDon.getHopDong().getPhong().getSoPhong()
            : "";
    String orderInfo =
        "Thanh toan hoa don #" + invoiceId + (roomNumber.isEmpty() ? "" : " P." + roomNumber);

    Map<String, String> vnpParams = new HashMap<>();
    vnpParams.put("vnp_Version", vnpConfig.getVersion());
    vnpParams.put("vnp_Command", vnpConfig.getCommand());
    vnpParams.put("vnp_TmnCode", vnpConfig.getTmnCode());
    vnpParams.put("vnp_Amount", soTien.multiply(BigDecimal.valueOf(100)).toBigInteger().toString());
    vnpParams.put("vnp_CurrCode", "VND");
    vnpParams.put("vnp_TxnRef", txnRef);
    vnpParams.put("vnp_OrderInfo", orderInfo);
    vnpParams.put("vnp_OrderType", "billpayment");
    vnpParams.put("vnp_Locale", "vn");
    vnpParams.put("vnp_ReturnUrl", vnpConfig.getReturnUrl());
    vnpParams.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));
    // VNPAY so thời gian theo giờ Việt Nam, không phụ thuộc múi giờ của máy chủ.
    vnpParams.put("vnp_CreateDate", now.format(DATE_FORMATTER));
    vnpParams.put("vnp_ExpireDate", expire.format(DATE_FORMATTER));
    if (bankCode != null && !bankCode.isBlank()) vnpParams.put("vnp_BankCode", bankCode.trim());

    String query = VNPayConfig.canonicalQuery(vnpParams);
    String secureHash = VNPayConfig.hmacSHA512(vnpConfig.getHashSecret(), query);

    Map<String, Object> result = new LinkedHashMap<>();
    result.put("paymentUrl", vnpConfig.getPayUrl() + "?" + query + "&vnp_SecureHash=" + secureHash);
    result.put("txnRef", txnRef);
    result.put("invoiceId", invoiceId);
    result.put("amount", soTien);
    result.put("orderInfo", orderInfo);
    return result;
  }

  // ------------------------------------------------------------------ IPN và trang kết quả

  /** VNPAY gọi máy chủ (server-to-server). Trả mã theo đặc tả IPN của VNPAY. */
  @Transactional(isolation = Isolation.READ_COMMITTED)
  public Map<String, String> processIpn(Map<String, String> params) {
    if (!validSignature(params)) return Map.of("RspCode", "97", "Message", "Invalid Checksum");
    Outcome outcome = settle(params);
    return Map.of("RspCode", outcome.rspCode(), "Message", outcome.rspMessage());
  }

  /** Trang kết quả phía trình duyệt. Xử lý như IPN (nếu IPN chưa tới) và trả thông điệp cho người dùng. */
  @Transactional(isolation = Isolation.READ_COMMITTED)
  public Map<String, Object> verifyAndProcessReturn(Map<String, String> params) {
    Map<String, Object> response = new LinkedHashMap<>();
    String txnRef = params.get("vnp_TxnRef");
    response.put("invoiceId", invoiceIdOf(txnRef));
    response.put("amount", amountOf(params));
    response.put("txnRef", txnRef);
    response.put("transactionNo", params.get("vnp_TransactionNo"));
    response.put("bankCode", params.get("vnp_BankCode"));
    response.put("responseCode", params.get("vnp_ResponseCode"));

    if (!validSignature(params)) {
      response.put("success", false);
      response.put("message", "Chữ ký xác thực giao dịch VNPAY không hợp lệ.");
      return response;
    }
    Outcome outcome = settle(params);
    response.put("success", outcome.paid());
    response.put("message", outcome.userMessage());
    return response;
  }

  private record Outcome(String rspCode, String rspMessage, boolean paid, String userMessage) {}

  /**
   * Ghi nhận kết quả của một giao dịch đúng một lần. Khóa dòng giao dịch trước, rồi khóa hóa đơn.
   */
  private Outcome settle(Map<String, String> params) {
    String txnRef = params.get("vnp_TxnRef");
    if (txnRef == null || txnRef.isBlank())
      return new Outcome("01", "Order not found", false, "Không tìm thấy giao dịch.");
    var rows =
        db.queryForList(
            "SELECT hoa_don_id,so_tien,trang_thai FROM vnpay_giao_dich WHERE txn_ref=? FOR UPDATE",
            txnRef);
    if (rows.isEmpty())
      return new Outcome("01", "Order not found", false, "Không tìm thấy giao dịch.");
    var row = rows.getFirst();
    int invoiceId = ((Number) row.get("hoa_don_id")).intValue();
    BigDecimal expected = new BigDecimal(row.get("so_tien").toString());
    String state = row.get("trang_thai").toString();

    BigDecimal amount = amountOf(params);
    if (amount == null || amount.compareTo(expected) != 0)
      return new Outcome("04", "Invalid amount", false, "Số tiền giao dịch không khớp.");

    if (!CHO_THANH_TOAN.equals(state)) return alreadyProcessed(state);

    String responseCode = params.get("vnp_ResponseCode");
    String transactionStatus = params.get("vnp_TransactionStatus");
    boolean success =
        "00".equals(responseCode) && (transactionStatus == null || "00".equals(transactionStatus));
    String transactionNo = params.get("vnp_TransactionNo");
    if (!success) {
      mark(txnRef, THAT_BAI, null, transactionNo);
      return new Outcome("00", "Confirm Success", false, errorMessage(responseCode));
    }

    HoaDon hoaDon = lockInvoice(invoiceId);
    BigDecimal conLai = remaining(hoaDon);
    if (amount.compareTo(conLai) > 0) {
      // Tiền đã bị trừ nhưng hóa đơn không còn đủ nợ (đã thu bằng cách khác): không ghi vượt,
      // đánh dấu để chủ trọ hoàn tiền cho khách.
      mark(txnRef, CAN_HOAN_TIEN, null, transactionNo);
      log.warn("VNPAY {}: số tiền {} vượt phần còn nợ {} của hóa đơn #{}", txnRef, amount, conLai, invoiceId);
      return new Outcome(
          "00",
          "Confirm Success",
          false,
          "Hóa đơn đã được thanh toán trước đó. Giao dịch này cần được hoàn tiền; vui lòng liên hệ"
              + " chủ trọ.");
    }

    ThanhToan thanhToan =
        thanhToanRepository.saveAndFlush(
            ThanhToan.builder()
                .hoaDon(hoaDon)
                .soTien(amount)
                .phuongThuc(PhuongThucThanhToan.CHUYEN_KHOAN)
                .maGiaoDich("VNPAY_" + (blank(transactionNo) ? txnRef : transactionNo))
                .ngayThanhToan(payDate(params))
                .build());
    BigDecimal daThu =
        Optional.ofNullable(thanhToanRepository.sumSoTienByHoaDonId(invoiceId))
            .orElse(BigDecimal.ZERO);
    hoaDon.setTrangThai(PaymentAmounts.status(daThu, total(hoaDon)));
    hoaDonRepository.saveAndFlush(hoaDon);
    mark(txnRef, DA_GHI_NHAN, thanhToan.getId(), transactionNo);
    log.info("VNPAY {}: ghi nhận {} VND cho hóa đơn #{}", txnRef, amount, invoiceId);
    return new Outcome(
        "00",
        "Confirm Success",
        true,
        "Giao dịch thanh toán qua VNPAY thành công. Hóa đơn đã được tự động gạch nợ.");
  }

  private Outcome alreadyProcessed(String state) {
    return switch (state) {
      case DA_GHI_NHAN ->
          new Outcome(
              "02", "Order already confirmed", true, "Giao dịch đã được ghi nhận trước đó.");
      case CAN_HOAN_TIEN ->
          new Outcome(
              "02",
              "Order already confirmed",
              false,
              "Hóa đơn đã được thanh toán trước đó. Giao dịch này cần được hoàn tiền; vui lòng"
                  + " liên hệ chủ trọ.");
      default ->
          new Outcome(
              "02", "Order already confirmed", false, "Giao dịch không thành công hoặc đã bị hủy.");
    };
  }

  // ------------------------------------------------------------------ tiện ích

  /** Người gọi phải là chủ trọ của hóa đơn hoặc người thuê có tên trong hợp đồng. */
  private void requireAccess(Integer invoiceId, int account) {
    Integer count =
        db.queryForObject(
            "SELECT COUNT(*) FROM hoa_don i JOIN hop_dong h ON h.id=i.hop_dong_id JOIN phong p ON"
                + " p.id=h.phong_id JOIN nha_tro b ON b.id=p.nha_tro_id JOIN chu_tro c ON"
                + " c.id=b.chu_tro_id WHERE i.id=? AND (c.tai_khoan_id=? OR EXISTS(SELECT 1 FROM"
                + " thanh_vien_hop_dong tv JOIN nguoi_thue n ON n.id=tv.nguoi_thue_id WHERE"
                + " tv.hop_dong_id=h.id AND n.tai_khoan_id=?))",
            Integer.class,
            invoiceId,
            account,
            account);
    if (count == null || count == 0)
      throw new ResourceNotFoundException("Không tìm thấy hóa đơn #" + invoiceId);
  }

  private HoaDon lockInvoice(Integer invoiceId) {
    HoaDon hoaDon =
        hoaDonRepository
            .findById(invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn #" + invoiceId));
    entityManager.refresh(hoaDon, LockModeType.PESSIMISTIC_WRITE);
    return hoaDon;
  }

  private BigDecimal total(HoaDon hoaDon) {
    List<BigDecimal> lines =
        chiTietHoaDonRepository.findByHoaDon_Id(hoaDon.getId()).stream()
            .map(l -> InvoiceAmounts.lineTotal(l.getSoLuong(), l.getDonGia()))
            .toList();
    return InvoiceAmounts.total(hoaDon.getTienPhong(), lines);
  }

  private BigDecimal remaining(HoaDon hoaDon) {
    BigDecimal daThu =
        Optional.ofNullable(thanhToanRepository.sumSoTienByHoaDonId(hoaDon.getId()))
            .orElse(BigDecimal.ZERO);
    return total(hoaDon).subtract(daThu);
  }

  private void mark(String txnRef, String state, Integer paymentId, String transactionNo) {
    db.update(
        "UPDATE vnpay_giao_dich SET trang_thai=?,thanh_toan_id=?,ma_giao_dich_vnpay=?,"
            + "updated_at=CURRENT_TIMESTAMP WHERE txn_ref=?",
        state,
        paymentId,
        blank(transactionNo) ? null : transactionNo,
        txnRef);
  }

  private boolean validSignature(Map<String, String> params) {
    if (!vnpConfig.isConfigured()) return false;
    Map<String, String> clean = new HashMap<>(params);
    String secureHash = clean.remove("vnp_SecureHash");
    clean.remove("vnp_SecureHashType");
    if (secureHash == null) return false;
    String expected = VNPayConfig.hashAllFields(clean, vnpConfig.getHashSecret());
    return expected.equalsIgnoreCase(secureHash);
  }

  private static BigDecimal amountOf(Map<String, String> params) {
    try {
      return new BigDecimal(params.get("vnp_Amount")).divide(BigDecimal.valueOf(100));
    } catch (RuntimeException e) {
      return null;
    }
  }

  private static Integer invoiceIdOf(String txnRef) {
    try {
      return Integer.parseInt(txnRef.split("_")[0]);
    } catch (RuntimeException e) {
      return null;
    }
  }

  private static LocalDateTime payDate(Map<String, String> params) {
    String value = params.get("vnp_PayDate");
    if (value != null && value.length() == 14) {
      try {
        return LocalDateTime.parse(value, DATE_FORMATTER);
      } catch (RuntimeException ignored) {
        // dùng thời điểm hiện tại
      }
    }
    return LocalDateTime.now(BUSINESS_ZONE);
  }

  private static boolean blank(String s) {
    return s == null || s.isBlank();
  }

  private static String errorMessage(String responseCode) {
    if (responseCode == null) return "Giao dịch thanh toán VNPAY không thành công.";
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
