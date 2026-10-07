package com.project.QLPT.dto.response;

import java.time.LocalDate;

public record ThanhVienHopDongResponse(
        Integer hopDongId,
        Integer nguoiThueId,
        String hoTen,
        String cccd,
        String soDienThoai,
        LocalDate ngayVao,
        LocalDate ngayRoi,
        Boolean laDaiDien) {
}
