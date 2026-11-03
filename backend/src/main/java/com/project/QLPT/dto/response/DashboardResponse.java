package com.project.QLPT.dto.response;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonFormat;

public record DashboardResponse(
    long tongPhong, long phongTrong, long phongDangThue, long phongBaoTri,
    long phongNgungHoatDong, long tongHoSoNguoiThue, long hopDongDangHieuLuc,
    long tongHoaDon, long hoaDonConNo,
    @JsonFormat(shape = JsonFormat.Shape.STRING) BigDecimal tongCongNo,
    @JsonFormat(shape = JsonFormat.Shape.STRING) BigDecimal daThuTrongThang,
    String thang
) {}
