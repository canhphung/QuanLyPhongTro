package com.project.QLPT.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

/**
 * DTO chứa dữ liệu yêu cầu khi tạo mới hoặc cập nhật một hóa đơn.
 *
 * <p>
 * Hóa đơn được sinh theo kỳ thanh toán và luôn thuộc về một hợp đồng
 * đang hiệu lực. Mỗi hợp đồng chỉ được có tối đa một hóa đơn cho
 * mỗi kỳ thanh toán.
 * </p>
 *
 * @param hopDongId     mã hợp đồng sinh ra hóa đơn
 * @param kyThanhToan   kỳ thanh toán của hóa đơn, ví dụ 2026-10-01
 *                      (đại diện cho tháng 10/2026)
 * @param ngayLap       ngày lập hóa đơn
 * @param hanThanhToan  hạn chót thanh toán hóa đơn, không được sớm hơn
 *                      ngày lập
 * @param tienPhong     số tiền phòng của kỳ, nếu để trống hệ thống tự lấy
 *                      giá thuê thỏa thuận trong hợp đồng
 */
public record HoaDonRequest(

                @NotNull(message = "Mã hợp đồng không được để trống") Integer hopDongId,

                @NotNull(message = "Kỳ thanh toán không được để trống") LocalDate kyThanhToan,

                @NotNull(message = "Ngày lập không được để trống") LocalDate ngayLap,

                @NotNull(message = "Hạn thanh toán không được để trống") LocalDate hanThanhToan,

                @DecimalMin(value = "0", message = "Tiền phòng không được là số âm") BigDecimal tienPhong) {
}
