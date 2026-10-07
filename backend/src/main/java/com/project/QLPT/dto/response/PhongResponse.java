package com.project.QLPT.dto.response;

import java.math.BigDecimal;

import com.project.QLPT.enums.TrangThaiPhong;

/**
 * DTO chứa thông tin phòng được trả về cho client.
 *
 * <p>Bao gồm các thông tin cơ bản của phòng như số phòng,
 * diện tích, giá thuê và trạng thái hiện tại của phòng.</p>
 *
 * @param id        mã định danh của phòng
 * @param soPhong   số hoặc tên định danh của phòng
 * @param dienTich  diện tích của phòng
 * @param giaThue   giá thuê hiện tại của phòng
 * @param trangThai trạng thái hiện tại của phòng
 */
public record PhongResponse(

    Integer id,
    String soPhong,
    BigDecimal dienTich,
    BigDecimal giaThue,
    TrangThaiPhong trangThai
) {

}