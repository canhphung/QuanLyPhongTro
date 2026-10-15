package com.project.QLPT.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.QLPT.enums.PhuongThucThanhToan;

public record ThanhToanResponse(
        Integer id,
        Integer hoaDonId,
        LocalDateTime ngayThanhToan,
        BigDecimal soTien,
        PhuongThucThanhToan phuongThuc,
        String maGiaoDich) {
}
