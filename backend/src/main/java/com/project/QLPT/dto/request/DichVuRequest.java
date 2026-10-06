package com.project.QLPT.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO chứa dữ liệu yêu cầu khi tạo mới hoặc cập nhật một dịch vụ.
 *
 * <p>
 * Dịch vụ là nguồn giá định mức để tính tiền cho từng dòng
 * xuất hiện trong hóa đơn (ví dụ: điện, nước, internet, dịch vụ vệ sinh...).
 * </p>
 *
 * @param tenDichVu      tên của dịch vụ, ví dụ "Điện", "Nước"
 * @param donViTinh      đơn vị tính của dịch vụ, ví dụ "kWh", "m3", "tháng"
 * @param donGiaHienTai  đơn giá áp dụng tại thời điểm gọi API, không được âm
 * @param tinhTheoChiSo  {@code true} nếu dịch vụ tính theo chỉ số công tơ
 *                       (chỉ số mới - chỉ số cũ), {@code false} nếu tính theo
 *                       số lượng nhập tay
 * @param dangHoatDong   trạng thái hoạt động của dịch vụ, dịch vụ ngừng hoạt
 *                       động sẽ không được đưa vào hóa đơn mới
 */
public record DichVuRequest(

                @NotBlank(message = "Tên dịch vụ không được để trống") @Size(max = 255, message = "Tên dịch vụ tối đa 255 ký tự") String tenDichVu,

                @NotBlank(message = "Đơn vị tính không được để trống") @Size(max = 50, message = "Đơn vị tính tối đa 50 ký tự") String donViTinh,

                @NotNull(message = "Đơn giá không được để trống") @DecimalMin(value = "0", message = "Đơn giá không được là số âm") BigDecimal donGiaHienTai,

                @NotNull(message = "Phải chọn kiểu tính: theo chỉ số hay theo số lượng") Boolean tinhTheoChiSo,

                @NotNull(message = "Trạng thái hoạt động không được để trống") Boolean dangHoatDong) {
}
