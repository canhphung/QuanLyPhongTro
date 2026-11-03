package com.project.QLPT.dto.response;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonFormat;

public record DashboardResponse(
    long tongPhong, long phongTrong, long phongDangThue, long phongBaoTri,
    long phongNgungHoatDong, long tongHoSoNguoiThue, long hopDongDangHieuLuc,
    long tongHoaDon, long hoaDonConNo,
    /** Phòng đã giữ chỗ hoặc đã ký hợp đồng nhưng chưa tới ngày vào ở. */
    long phongDaDat,
    /** Hợp đồng đã quá ngày kết thúc nhưng chưa ghi nhận trả phòng (người thuê vẫn ở). */
    long hopDongQuaHan,
    @JsonFormat(shape = JsonFormat.Shape.STRING) BigDecimal tongCongNo,
    @JsonFormat(shape = JsonFormat.Shape.STRING) BigDecimal daThuTrongThang,
    String thang
) {}
