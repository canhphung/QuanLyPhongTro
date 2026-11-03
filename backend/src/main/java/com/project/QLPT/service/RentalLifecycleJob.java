package com.project.QLPT.service;

import com.project.QLPT.service.support.ViewingRequests;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cập nhật trạng thái theo thời gian, chạy lúc khởi động và 00:05 hằng ngày (giờ Việt Nam).
 *
 * <ul>
 *   <li>Hợp đồng đang hiệu lực đã qua ngày kết thúc → {@code HET_HAN} (người thuê vẫn ở, phòng
 *       vẫn đang thuê; chủ trọ cần gia hạn hoặc kết thúc).
 *   <li>Phòng {@code DA_DAT} có hợp đồng đã tới ngày bắt đầu → {@code DANG_THUE}.
 *   <li>Giữ chỗ quá hạn mà chưa lập hợp đồng → "Hết hạn giữ chỗ", phòng trả về {@code TRONG}.
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RentalLifecycleJob {
  private final JdbcTemplate db;

  @EventListener(ApplicationReadyEvent.class)
  public void onStartup() {
    run();
  }

  @Scheduled(cron = "0 5 0 * * *", zone = "Asia/Ho_Chi_Minh")
  @Transactional
  public void run() {
    LocalDate today = ViewingRequests.now().toLocalDate();
    int expired =
        db.update(
            "UPDATE hop_dong SET trang_thai='HET_HAN' WHERE trang_thai='DANG_HIEU_LUC' AND"
                + " ngay_ket_thuc<?",
            today);
    int movedIn =
        db.update(
            "UPDATE phong p JOIN hop_dong h ON h.phong_id=p.id SET p.trang_thai='DANG_THUE'"
                + " WHERE p.trang_thai='DA_DAT' AND h.trang_thai IN ('DANG_HIEU_LUC','HET_HAN')"
                + " AND h.ngay_bat_dau<=?",
            today);
    // Trả phòng trước, rồi mới đổi trạng thái yêu cầu (điều kiện dựa vào yêu cầu còn giữ chỗ).
    int released =
        db.update(
            "UPDATE phong p SET p.trang_thai='TRONG' WHERE p.trang_thai='DA_DAT' AND EXISTS("
                + "SELECT 1 FROM portal_viewing_request v JOIN tin_dang l ON l.id=v.listing_id"
                + " WHERE l.phong_id=p.id AND v.status=? AND v.hold_until<?) AND NOT EXISTS("
                + "SELECT 1 FROM hop_dong h WHERE h.phong_id=p.id AND h.trang_thai IN"
                + " ('DANG_HIEU_LUC','HET_HAN'))",
            ViewingRequests.DA_GIU_CHO,
            today);
    int holds =
        db.update(
            "UPDATE portal_viewing_request SET status=?,updated_at=CURRENT_TIMESTAMP WHERE"
                + " status=? AND hold_until<?",
            ViewingRequests.HET_HAN_GIU_CHO,
            ViewingRequests.DA_GIU_CHO,
            today);
    if (expired + movedIn + released + holds > 0)
      log.info(
          "Rental lifecycle: {} hợp đồng hết hạn, {} phòng vào ở, {} giữ chỗ hết hạn ({} phòng"
              + " trả về trống)",
          expired,
          movedIn,
          holds,
          released);
  }
}
