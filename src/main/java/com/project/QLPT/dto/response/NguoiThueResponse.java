package com.project.QLPT.dto.response;

import java.time.LocalDate;

/**
 * DTO chứa thông tin người thuê được trả về cho client.
 *
 * @param id              mã định danh của người thuê
 * @param hoTen           họ và tên của người thuê
 * @param cccd            số căn cước công dân của người thuê
 * @param soDienThoai     số điện thoại liên hệ của người thuê
 * @param ngaySinh        ngày sinh của người thuê
 * @param diaChiThuongTru địa chỉ thường trú của người thuê
 */
public record NguoiThueResponse(
                Integer id,
                String hoTen,
                String cccd,
                String soDienThoai,
                LocalDate ngaySinh,
                String diaChiThuongTru) {
}