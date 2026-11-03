package com.project.QLPT.service.support;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Quy tắc chung cho yêu cầu xem/thuê phòng ({@code portal_viewing_request}).
 *
 * <p>Vòng đời:
 *
 * <pre>
 * Chờ xác nhận ─┬─> Đã xác nhận ─┬─> Đã xem ──────┐
 *               │                ├─> Khách không đến
 *               │                └────────────────┤
 *               ├─> Đã từ chối / Đã hủy            ├─> Đã giữ chỗ ─┬─> Đã lập hợp đồng
 *               └─ (Đăng ký thuê) ────────────────┘               ├─> Đã hủy giữ chỗ
 *                                                                 └─> Hết hạn giữ chỗ
 * Yêu cầu mở bị đóng tự động: Phòng không còn trống / Tin đã ẩn.
 * </pre>
 *
 * <p>Yêu cầu "mở" là yêu cầu đang chờ hoặc đã xác nhận. Khi phòng không còn cho thuê được (giữ chỗ,
 * lập hợp đồng, bảo trì, ngừng hoạt động) hoặc tin bị ẩn, mọi yêu cầu mở của phòng được đóng.
 */
@Component
@RequiredArgsConstructor
public class ViewingRequests {
  public static final String XEM_PHONG = "Xem phòng";
  public static final String DANG_KY_THUE = "Đăng ký thuê";

  public static final String CHO_XAC_NHAN = "Chờ xác nhận";
  public static final String DA_XAC_NHAN = "Đã xác nhận";
  public static final String DA_TU_CHOI = "Đã từ chối";
  public static final String DA_HUY = "Đã hủy";
  public static final String DA_XEM = "Đã xem";
  public static final String KHONG_DEN = "Khách không đến";
  public static final String DA_GIU_CHO = "Đã giữ chỗ";
  public static final String HUY_GIU_CHO = "Đã hủy giữ chỗ";
  public static final String HET_HAN_GIU_CHO = "Hết hạn giữ chỗ";
  public static final String DA_LAP_HOP_DONG = "Đã lập hợp đồng";
  public static final String PHONG_KHONG_CON_TRONG = "Phòng không còn trống";
  public static final String TIN_DA_AN = "Tin đã ẩn";

  /** Chỉ dùng để hiển thị: yêu cầu chờ xác nhận nhưng lịch hẹn đã qua. */
  public static final String HET_HAN = "Hết hạn";

  public static final Set<String> OPEN = Set.of(CHO_XAC_NHAN, DA_XAC_NHAN);

  /** Giờ nhận lịch xem phòng. */
  public static final LocalTime OPENING = LocalTime.of(7, 0);

  public static final LocalTime CLOSING = LocalTime.of(21, 0);

  /** Đặt lịch tối đa bao nhiêu ngày tới. */
  public static final int MAX_DAYS_AHEAD = 60;

  /** Hai lịch đã xác nhận của cùng phòng phải cách nhau tối thiểu (phút). */
  public static final int SLOT_MINUTES = 30;

  /** Giữ chỗ tối đa bao nhiêu ngày. */
  public static final int MAX_HOLD_DAYS = 30;

  private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

  private final JdbcTemplate db;

  public static LocalDateTime now() {
    return LocalDateTime.now(ZONE);
  }

  /** Đóng mọi yêu cầu mở (kể cả đã qua giờ hẹn) của các tin thuộc phòng. */
  public int closeForRoom(int phongId, String reasonStatus) {
    return db.update(
        "UPDATE portal_viewing_request v JOIN tin_dang l ON l.id=v.listing_id SET"
            + " v.status=?,v.updated_at=CURRENT_TIMESTAMP WHERE l.phong_id=? AND v.status IN"
            + " (?,?)",
        reasonStatus,
        phongId,
        CHO_XAC_NHAN,
        DA_XAC_NHAN);
  }

  /** Đóng mọi yêu cầu mở của một tin đăng. */
  public int closeForListing(int listingId, String reasonStatus) {
    return db.update(
        "UPDATE portal_viewing_request SET status=?,updated_at=CURRENT_TIMESTAMP WHERE"
            + " listing_id=? AND status IN (?,?)",
        reasonStatus,
        listingId,
        CHO_XAC_NHAN,
        DA_XAC_NHAN);
  }
}
