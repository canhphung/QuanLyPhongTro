package com.project.QLPT.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.project.QLPT.entity.ThanhToan;

public interface ThanhToanRepository extends JpaRepository<ThanhToan, Integer>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<ThanhToan> {

    List<ThanhToan> findByHoaDon_IdOrderByNgayThanhToanDescIdDesc(Integer hoaDonId);

    boolean existsByHoaDon_Id(Integer hoaDonId);

    @Query("select sum(t.soTien) from ThanhToan t where t.hoaDon.id = :hoaDonId")
    BigDecimal sumSoTienByHoaDonId(@Param("hoaDonId") Integer hoaDonId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"hoaDon", "hoaDon.hopDong", "hoaDon.hopDong.phong", "hoaDon.hopDong.phong.nhaTro"})
    java.util.Optional<ThanhToan> findByIdAndHoaDon_HopDong_Phong_NhaTro_ChuTro_Id(Integer id, Integer ownerId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from ThanhToan t where t.id = :id and t.hoaDon.id = :invoiceId and t.hoaDon.hopDong.phong.nhaTro.chuTro.id = :ownerId")
    java.util.Optional<ThanhToan> findOwnedForUpdate(@Param("id") Integer id,
        @Param("invoiceId") Integer invoiceId, @Param("ownerId") Integer ownerId);

    @Override
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"hoaDon", "hoaDon.hopDong", "hoaDon.hopDong.phong", "hoaDon.hopDong.phong.nhaTro"})
    org.springframework.data.domain.Page<ThanhToan> findAll(
        org.springframework.data.jpa.domain.Specification<ThanhToan> spec,
        org.springframework.data.domain.Pageable pageable);

    @Override
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"hoaDon", "hoaDon.hopDong", "hoaDon.hopDong.phong", "hoaDon.hopDong.phong.nhaTro"})
    java.util.List<ThanhToan> findAll(org.springframework.data.jpa.domain.Specification<ThanhToan> spec,
        org.springframework.data.domain.Sort sort);

    interface ReceiptTotal {
        Integer getInvoiceId();
        BigDecimal getCollected();
    }

    @Query("""
        select t.hoaDon.id as invoiceId, sum(t.soTien) as collected
        from ThanhToan t where t.hoaDon.hopDong.phong.nhaTro.chuTro.id = :ownerId
        group by t.hoaDon.id
        """)
    List<ReceiptTotal> totalsForOwner(@Param("ownerId") Integer ownerId);

    @Query("""
        select sum(t.soTien) from ThanhToan t
        where t.hoaDon.hopDong.phong.nhaTro.chuTro.id = :ownerId
          and t.ngayThanhToan >= :start and t.ngayThanhToan < :end
        """)
    BigDecimal collectedInPeriod(@Param("ownerId") Integer ownerId,
        @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);
}
