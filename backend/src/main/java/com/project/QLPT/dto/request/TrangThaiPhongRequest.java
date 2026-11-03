package com.project.QLPT.dto.request;

import com.project.QLPT.enums.TrangThaiPhong;

import jakarta.validation.constraints.NotNull;

public record TrangThaiPhongRequest(
    @NotNull(message = "Trạng thái phòng không được để trống")
    TrangThaiPhong trangThai
) {
}