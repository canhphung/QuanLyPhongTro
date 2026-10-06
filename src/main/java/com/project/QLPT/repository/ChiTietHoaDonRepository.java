package com.project.QLPT.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.QLPT.entity.ChiTietHoaDon;

/**
 * Repository truy cập dữ liệu cho {@link ChiTietHoaDon}.
 *
 * <p>
 * Hỗ trợ lấy danh sách dòng chi tiết theo hóa đơn cũng như các
 * kiểm tra phục vụ ràng buộc nghiệp vụ.
 * </p>
 */
public interface ChiTietHoaDonRepository
        extends JpaRepository<ChiTietHoaDon, Integer> {

    /**
     * Lấy danh sách dòng chi tiết của một hóa đơn.
     *
     * @param hoaDonId mã hóa đơn cần lấy chi tiết
     * @return danh sách dòng chi tiết của hóa đơn
     */
    List<ChiTietHoaDon> findByHoaDon_Id(Integer hoaDonId);

    /**
     * Kiểm tra xem hóa đơn đã có ít nhất một dòng chi tiết chưa.
     *
     * @param hoaDonId mã hóa đơn cần kiểm tra
     * @return {@code true} nếu hóa đơn đã có dòng chi tiết
     */
    boolean existsByHoaDon_Id(Integer hoaDonId);

    /**
     * Kiểm tra xem một dịch vụ đã xuất hiện trong hóa đơn chưa.
     *
     * <p>
     * Mỗi dịch vụ chỉ được tính một lần trong một hóa đơn.
     * </p>
     *
     * @param hoaDonId mã hóa đơn cần kiểm tra
     * @param dichVuId mã dịch vụ cần kiểm tra
     * @return {@code true} nếu dịch vụ đã có trong hóa đơn
     */
    boolean existsByHoaDon_IdAndDichVu_Id(
            Integer hoaDonId,
            Integer dichVuId);

    /**
     * Kiểm tra xem dịch vụ đã xuất hiện trong bất kỳ hóa đơn nào chưa.
     *
     * <p>
     * Dùng để chặn việc xóa dịch vụ đã được dùng trong hóa đơn.
     * </p>
     *
     * @param dichVuId mã dịch vụ cần kiểm tra
     * @return {@code true} nếu dịch vụ đã được dùng
     */
    boolean existsByDichVu_Id(Integer dichVuId);

    /**
     * Xóa toàn bộ dòng chi tiết của một hóa đơn.
     *
     * @param hoaDonId mã hóa đơn cần xóa chi tiết
     */
    void deleteByHoaDon_Id(Integer hoaDonId);
}