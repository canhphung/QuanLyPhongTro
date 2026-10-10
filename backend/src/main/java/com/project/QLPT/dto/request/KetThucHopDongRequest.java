package com.project.QLPT.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record KetThucHopDongRequest(

    @NotNull(message = "Ngày kết thúc thực tế không được để trống")
    LocalDate ngayKetThucThucTe,

    @NotBlank(message = "Lý do kết thúc không được để trống")
    @Size(max = 500, message = "Lý do kết thúc tối đa 500 ký tự")
    String lyDoKetThuc

) {
}