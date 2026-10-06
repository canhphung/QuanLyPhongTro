package com.project.QLPT.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.project.QLPT.enums.TrangThaiHoaDon;

/**
 * DTO chứa thông tin một hóa đơn được trả về cho client.
 *
 * <p>
 * {@code tongTien} không nằm trong bảng mà được tính tại chỗ theo công
 * thức: {@code tienPhong + tổng thành tiền của các dòng chi tiết}.
 * </p>
 *
 * @param id              mã định danh của hóa đơn
 * @param hopDongId       mã hợp đồng sinh ra hóa đơn
 * @param soPhong         số phòng của hợp đồng, dùng để hiển thị cho nhanh
 * @param kyThanhToan     kỳ thanh toán của hóa đơn
 * @param ngayLap         ngày lập hóa đơn
 * @param hanThanhToan    hạn thanh toán hóa đơn
 * @param tienPhong       số tiền phòng của kỳ
 * @param tongTien        tổng tiền hóa đơn (tiền phòng + tiền dịch vụ)
 * @param trangThai       trạng thái thanh toán của hóa đơn
 * @param chiTietHoaDons  danh sách dòng chi tiết dịch vụ, chỉ được điền
 *                        dữ liệu khi gọi API xem chi tiết một hóa đơn,
 *                        các API danh sách trả về danh sách rỗng để tránh
 *                        truy vấn thừa
 */
public record HoaDonResponse(

                Integer id,

                Integer hopDongId,

                String soPhong,

                LocalDate kyThanhToan,

                LocalDate ngayLap,

                LocalDate hanThanhToan,

                BigDecimal tienPhong,

                BigDecimal tongTien,

                TrangThaiHoaDon trangThai,

                List<ChiTietHoaDonResponse> chiTietHoaDons) {
}
