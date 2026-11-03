package com.project.QLPT.dto.request;

import java.math.BigDecimal;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record KetThucHopDongRequest(

    @NotNull(message = "Ngày kết thúc thực tế không được để trống")
    LocalDate ngayKetThucThucTe,

    @NotBlank(message = "Lý do kết thúc không được để trống")
    @Size(max = 500, message = "Lý do kết thúc tối đa 500 ký tự")
    String lyDoKetThuc,

    @NotNull(message = "Cần nhập số tiền cọc hoàn trả (nhập 0 nếu không hoàn)")
    @PositiveOrZero(message = "Tiền cọc hoàn trả không được âm")
    @Digits(integer = 19, fraction = 0)
    BigDecimal tienCocHoanTra,

    @Size(max = 500, message = "Ghi chú quyết toán tối đa 500 ký tự")
    String ghiChuQuyetToan
) {
}