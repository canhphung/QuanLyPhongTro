package com.project.QLPT.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.QLPT.enums.PhuongThucThanhToan;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ThanhToanRequest(
        @NotNull(message = "Mã hóa đơn không được để trống")
        @Positive(message = "Mã hóa đơn phải lớn hơn 0") Integer hoaDonId,

        // Không gửi ngày thì service dùng hiện tại; kiểm tra tương lai theo Asia/Ho_Chi_Minh tại service.
        LocalDateTime ngayThanhToan,

        @NotNull(message = "Số tiền không được để trống")
        @Positive(message = "Số tiền phải lớn hơn 0")
        @Digits(integer = 19, fraction = 0, message = "Số tiền phải là số nguyên, tối đa 19 chữ số")
        BigDecimal soTien,

        @NotNull(message = "Phương thức thanh toán không được để trống")
        PhuongThucThanhToan phuongThuc,

        @Size(max = 255, message = "Mã giao dịch tối đa 255 ký tự")
        String maGiaoDich) {
}
