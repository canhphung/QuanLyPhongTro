package com.project.QLPT.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

/**
 * DTO chứa dữ liệu yêu cầu khi thêm hoặc sửa một dòng chi tiết hóa đơn.
 *
 * <p>
 * Mỗi dòng chi tiết gắn một dịch vụ với hóa đơn. Tùy theo cấu hình
 * của dịch vụ mà hệ thống xác định số lượng như sau:
 * </p>
 *
 * <ul>
 * <li>Dịch vụ tính theo chỉ số: {@code soLuong = chiSoMoi - chiSoCu}
 * (trường {@code soLuong} gửi lên sẽ bị bỏ qua).</li>
 * <li>Dịch vụ tính theo số lượng: bắt buộc phải gửi {@code soLuong} lớn
 * hơn 0, đồng thời không được gửi chỉ số.</li>
 * </ul>
 *
 * @param dichVuId mã dịch vụ được tính trong dòng chi tiết này
 * @param chiSoCu  chỉ số công tơ kỳ trước, chỉ dùng cho dịch vụ tính theo
 *                 chỉ số
 * @param chiSoMoi  chỉ số công tơ kỳ này, chỉ dùng cho dịch vụ tính theo
 *                 chỉ số
 * @param soLuong  số lượng sử dụng, chỉ dùng cho dịch vụ tính theo số lượng
 * @param donGia   đơn giá ghi nhận vào hóa đơn, nếu để trống hệ thống tự
 *                 lấy đơn giá hiện tại của dịch vụ
 */
public record ChiTietHoaDonRequest(

                @NotNull(message = "Mã dịch vụ không được để trống") Integer dichVuId,

                BigDecimal chiSoCu,

                BigDecimal chiSoMoi,

                @DecimalMin(value = "0", message = "Số lượng không được là số âm") BigDecimal soLuong,

                @DecimalMin(value = "0", message = "Đơn giá không được là số âm") BigDecimal donGia) {
}
