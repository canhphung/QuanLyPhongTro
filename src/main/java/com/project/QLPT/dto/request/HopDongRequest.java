package com.project.QLPT.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * DTO chứa dữ liệu yêu cầu khi tạo mới hoặc cập nhật hợp đồng thuê phòng.
 *
 * @param phongId          mã định danh của phòng được thuê
 * @param ngayBatDau       ngày bắt đầu hiệu lực của hợp đồng
 * @param ngayKetThuc      ngày kết thúc hiệu lực của hợp đồng
 * @param giaThueThoaThuan giá thuê phòng được thỏa thuận trong hợp đồng
 * @param tienCoc          số tiền đặt cọc của hợp đồng, không được âm
 */
public record HopDongRequest(

    @NotNull(message = "Phòng không được để trống")
    Integer phongId,

    @NotNull(message = "Ngày bắt đầu không được để trống")
    LocalDate ngayBatDau,

    @NotNull(message = "Ngày kết thúc không được để trống")
    LocalDate ngayKetThuc,

    @NotNull(message = "Giá thuê thỏa thuận không được để trống")
    @Positive(message = "Giá thuê thỏa thuận phải lớn hơn 0")
    BigDecimal giaThueThoaThuan,

    @NotNull(message = "Tiền cọc không được để trống")
    @PositiveOrZero(message = "Tiền cọc không được âm")
    BigDecimal tienCoc
) {

}
