package com.project.QLPT.repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.project.QLPT.entity.HoaDon;
import com.project.QLPT.enums.TrangThaiHoaDon;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository truy cập dữ liệu cho {@link HoaDon}.
 *
 * <p>
 * Bổ sung truy vấn kiểm tra hóa đơn theo hợp đồng và kỳ thanh toán
 * để đảm bảo ràng buộc duy nhất ở tầng nghiệp vụ.
 * </p>
 */
public interface HoaDonRepository extends JpaRepository<HoaDon, Integer> {

    /**
     * Kiểm tra xem hợp đồng đã có hóa đơn cho kỳ thanh toán này chưa.
     *
     * @param hopDongId   mã hợp đồng cần kiểm tra
     * @param kyThanhToan kỳ thanh toán cần kiểm tra
     * @return {@code true} nếu đã tồn tại hóa đơn
     */
    boolean existsByHopDong_IdAndKyThanhToan(
            Integer hopDongId,
            LocalDate kyThanhToan);

    boolean existsByHopDong_IdAndKyThanhToanBetween(
        Integer hopDongId,
        LocalDate tuNgay,
        LocalDate denNgay
    );

    boolean existsByHopDong_IdAndKyThanhToanBetweenAndIdNot(
        Integer hopDongId,
        LocalDate tuNgay,
        LocalDate denNgay,
        Integer id
    );

    /**
     * Lấy danh sách hóa đơn của một hợp đồng theo kỳ giảm dần.
     *
     * @param hopDongId mã hợp đồng cần lấy hóa đơn
     * @return danh sách hóa đơn của hợp đồng
     */
    List<HoaDon> findByHopDong_IdOrderByKyThanhToanDesc(
            Integer hopDongId);

    /**
     * Lấy danh sách hóa đơn theo trạng thái thanh toán.
     *
     * @param trangThai trạng thái cần lọc
     * @return danh sách hóa đơn có trạng thái tương ứng
     */
    List<HoaDon> findByTrangThai(TrangThaiHoaDon trangThai);

    Optional<HoaDon> findByIdAndHopDong_Phong_NhaTro_ChuTro_Id(
        Integer id,
        Integer chuTroId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT h FROM HoaDon h
    WHERE h.id = :id
      AND h.hopDong.phong.nhaTro.chuTro.id = :chuTroId
    """)
    Optional<HoaDon> findOwnedForUpdate(
        @Param("id") Integer id,
        @Param("chuTroId") Integer chuTroId
    );
}