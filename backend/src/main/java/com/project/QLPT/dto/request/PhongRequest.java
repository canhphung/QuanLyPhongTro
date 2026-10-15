package com.project.QLPT.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * DTO chứa dữ liệu yêu cầu khi tạo mới hoặc cập nhật thông tin phòng.
 *
 * <p>Các thông tin bao gồm số phòng, diện tích và giá thuê.
 * Dữ liệu được kiểm tra tính hợp lệ trước khi chuyển đến tầng service để xử lý nghiệp vụ.</p>
 *
 * @param soPhong  số hoặc tên định danh của phòng, không được để trống và có tối đa 50 ký tự
 * @param dienTich diện tích của phòng, phải lớn hơn 0
 * @param giaThue  giá thuê của phòng, phải lớn hơn 0
 */
public record PhongRequest(

    @NotBlank(message = "Số phòng không được để trống")
    @Size(max = 50, message = "Số phòng tối đa 50 ký tự")
    String soPhong,

    @NotNull(message = "Diện tích không được để trống")
    @Positive(message = "Diện tích phải lớn hơn 0")
    BigDecimal dienTich,

    @NotNull(message = "Giá thuê không được để trống")
    @Positive(message = "Giá thuê phải lớn hơn 0")
    BigDecimal giaThue
) {

}