package com.project.QLPT.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

import com.project.QLPT.enums.PhuongThucThanhToan;

public record ThanhToanResponse(
        Integer id,
        Integer hoaDonId,
        LocalDateTime ngayThanhToan,
        @JsonFormat(shape = JsonFormat.Shape.STRING) BigDecimal soTien,
        PhuongThucThanhToan phuongThuc,
        String maGiaoDich, LocalDate kyThanhToan, String soPhong, String tenNhaTro) {
}
