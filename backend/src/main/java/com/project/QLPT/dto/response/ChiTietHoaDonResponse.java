package com.project.QLPT.dto.response;

import java.math.BigDecimal;

/**
 * DTO chứa thông tin một dòng chi tiết hóa đơn được trả về cho client.
 *
 * <p>
 * Ngoài các trường lưu trong bảng {@code chi_tiet_hoa_don}, DTO còn
 * tính sẵn {@code thanhTien = soLuong * donGia} để client hiển thị
 * mà không phải tự tính.
 * </p>
 *
 * @param id          mã định danh của dòng chi tiết
 * @param hoaDonId    mã hóa đơn chứa dòng chi tiết này
 * @param dichVuId    mã dịch vụ được tính
 * @param tenDichVu   tên dịch vụ lấy từ bảng dịch vụ
 * @param donViTinh   đơn vị tính của dịch vụ
 * @param chiSoCu     chỉ số công tơ kỳ trước, {@code null} nếu dịch vụ
 *                    không tính theo chỉ số
 * @param chiSoMoi    chỉ số công tơ kỳ này, {@code null} nếu dịch vụ
 *                    không tính theo chỉ số
 * @param soLuong     số lượng sử dụng của kỳ
 * @param donGia      đơn giá ghi nhận tại thời điểm lập hóa đơn
 * @param thanhTien   thành tiền của dòng chi tiết
 */
public record ChiTietHoaDonResponse(

                Integer id,

                Integer hoaDonId,

                Integer dichVuId,

                String tenDichVu,

                String donViTinh,

                BigDecimal chiSoCu,

                BigDecimal chiSoMoi,

                BigDecimal soLuong,

                BigDecimal donGia,

                BigDecimal thanhTien) {
}
