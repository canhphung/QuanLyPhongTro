package com.project.QLPT.service.support;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Quy tắc chung cho yêu cầu xem/thuê phòng ({@code portal_viewing_request}).
 *
 * <p>Yêu cầu "mở" là yêu cầu đang chờ hoặc đã xác nhận và lịch hẹn chưa qua. Khi phòng không còn
 * cho thuê được (đã lập hợp đồng, bảo trì, ngừng hoạt động) hoặc tin bị ẩn, mọi yêu cầu mở của
 * phòng đó được đóng để khách không chờ một phòng đã hết.
 */
@Component
@RequiredArgsConstructor
public class ViewingRequests {
  public static final String CHO_XAC_NHAN = "Chờ xác nhận";
  public static final String DA_XAC_NHAN = "Đã xác nhận";
  public static final String DA_TU_CHOI = "Đã từ chối";
  public static final String DA_HUY = "Đã hủy";
  public static final String PHONG_KHONG_CON_TRONG = "Phòng không còn trống";
  public static final String TIN_DA_AN = "Tin đã ẩn";
  /** Chỉ dùng để hiển thị: yêu cầu chờ xác nhận nhưng lịch hẹn đã qua. */
  public static final String HET_HAN = "Hết hạn";

  public static final Set<String> OPEN = Set.of(CHO_XAC_NHAN, DA_XAC_NHAN);

  private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

  private final JdbcTemplate db;

  public static LocalDateTime now() {
    return LocalDateTime.now(ZONE);
  }

  /** Đóng mọi yêu cầu mở (kể cả đã qua giờ hẹn) của các tin thuộc phòng. */
  public int closeForRoom(int phongId, String reasonStatus) {
    return db.update(
        "UPDATE portal_viewing_request v JOIN tin_dang l ON l.id=v.listing_id SET v.status=?"
            + " WHERE l.phong_id=? AND v.status IN (?,?)",
        reasonStatus,
        phongId,
        CHO_XAC_NHAN,
        DA_XAC_NHAN);
  }

  /** Đóng mọi yêu cầu mở của một tin đăng. */
  public int closeForListing(int listingId, String reasonStatus) {
    return db.update(
        "UPDATE portal_viewing_request SET status=? WHERE listing_id=? AND status IN (?,?)",
        reasonStatus,
        listingId,
        CHO_XAC_NHAN,
        DA_XAC_NHAN);
  }
}
