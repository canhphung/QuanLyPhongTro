package com.project.QLPT.dto.response;

import java.time.LocalDate;

public record NguoiThueResponse(
        Integer id,
        String hoTen,
        String cccd,
        String soDienThoai,
        LocalDate ngaySinh,
        String diaChiThuongTru
) {
}