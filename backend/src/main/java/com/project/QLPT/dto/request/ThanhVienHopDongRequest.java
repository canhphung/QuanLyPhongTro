package com.project.QLPT.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ThanhVienHopDongRequest(
        @NotNull(message = "Mã người thuê không được để trống")
        @Positive(message = "Mã người thuê phải lớn hơn 0") Integer nguoiThueId,

        @NotNull(message = "Ngày vào không được để trống") LocalDate ngayVao,

        // null nghĩa là chưa ghi nhận rời phòng.
        LocalDate ngayRoi,

        @NotNull(message = "Phải xác định thành viên có là người đại diện hay không")
        Boolean laDaiDien) {
}
