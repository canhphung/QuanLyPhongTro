package com.project.QLPT.dto.response;

public record DashboardResponse(
    long tongPhong,
    long phongTrong,
    long phongDangThue,
    long phongBaoTri,
    long phongNgungHoatDong,
    long tongHoSoNguoiThue,
    long hopDongDangHieuLuc
) {
}