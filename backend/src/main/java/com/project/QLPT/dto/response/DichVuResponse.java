package com.project.QLPT.dto.response;

import java.math.BigDecimal;

/**
 * DTO chứa thông tin một dịch vụ được trả về cho client.
 *
 * @param id             mã định danh của dịch vụ
 * @param tenDichVu      tên của dịch vụ
 * @param donViTinh      đơn vị tính của dịch vụ
 * @param donGiaHienTai  đơn giá hiện tại của dịch vụ
 * @param tinhTheoChiSo  {@code true} nếu dịch vụ tính theo chỉ số công tơ
 * @param dangHoatDong   trạng thái hoạt động của dịch vụ
 */
public record DichVuResponse(

                Integer id,

                String tenDichVu,

                String donViTinh,

                BigDecimal donGiaHienTai,

                Boolean tinhTheoChiSo,

                Boolean dangHoatDong) {
}
