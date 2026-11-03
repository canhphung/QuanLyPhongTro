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
    interface AmountRow {
        Integer getInvoiceId();
        Integer getServiceOwnerId();
        java.math.BigDecimal getQuantity();
        java.math.BigDecimal getPrice();
    }

    @org.springframework.data.jpa.repository.Query("""
        select c.hoaDon.id as invoiceId, c.dichVu.chuTro.id as serviceOwnerId,
            c.soLuong as quantity, c.donGia as price
        from ChiTietHoaDon c where c.hoaDon.hopDong.phong.nhaTro.chuTro.id = :ownerId
        """)
    List<AmountRow> amountsForOwner(@org.springframework.data.repository.query.Param("ownerId") Integer ownerId);

    /**
     * Lấy danh sách dòng chi tiết của một hóa đơn.
     *
     * @param hoaDonId mã hóa đơn cần lấy chi tiết
     * @return danh sách dòng chi tiết của hóa đơn
     */
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "dichVu")
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

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "dichVu")
    @org.springframework.data.jpa.repository.Query("""
        select c from ChiTietHoaDon c where c.hoaDon.id = :invoiceId
          and c.hoaDon.hopDong.phong.nhaTro.chuTro.id = :ownerId
          and c.dichVu.chuTro.id = :ownerId order by c.id
        """)
    List<ChiTietHoaDon> findOwnedLines(
        @org.springframework.data.repository.query.Param("invoiceId") Integer invoiceId,
        @org.springframework.data.repository.query.Param("ownerId") Integer ownerId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "dichVu")
    @org.springframework.data.jpa.repository.Query("""
        select c from ChiTietHoaDon c where c.id = :lineId and c.hoaDon.id = :invoiceId
          and c.hoaDon.hopDong.phong.nhaTro.chuTro.id = :ownerId
          and c.dichVu.chuTro.id = :ownerId
        """)
    java.util.Optional<ChiTietHoaDon> findOwnedLine(
        @org.springframework.data.repository.query.Param("invoiceId") Integer invoiceId,
        @org.springframework.data.repository.query.Param("lineId") Integer lineId,
        @org.springframework.data.repository.query.Param("ownerId") Integer ownerId);
}
