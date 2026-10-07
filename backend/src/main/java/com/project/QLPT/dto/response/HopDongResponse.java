package com.project.QLPT.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.project.QLPT.enums.TrangThaiHopDong;

/**
 * DTO chứa thông tin hợp đồng thuê phòng được trả về cho client.
 *
 * @param id               mã định danh của hợp đồng
 * @param phongId          mã định danh của phòng thuộc hợp đồng
 * @param soPhong          số phòng được thuê
 * @param ngayBatDau       ngày bắt đầu hiệu lực của hợp đồng
 * @param ngayKetThuc      ngày kết thúc hiệu lực của hợp đồng
 * @param giaThueThoaThuan giá thuê phòng được thỏa thuận trong hợp đồng
 * @param tienCoc          số tiền đặt cọc của hợp đồng
 * @param trangThai        trạng thái hiện tại của hợp đồng
 */
public record HopDongResponse(

    Integer id,
    Integer phongId,
    String soPhong,
    LocalDate ngayBatDau,
    LocalDate ngayKetThuc,
    BigDecimal giaThueThoaThuan,
    BigDecimal tienCoc,
    TrangThaiHopDong trangThai
) {

}
