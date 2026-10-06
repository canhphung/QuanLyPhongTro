package com.project.QLPT.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.project.QLPT.entity.ThanhToan;

public interface ThanhToanRepository extends JpaRepository<ThanhToan, Integer> {

    List<ThanhToan> findByHoaDon_IdOrderByNgayThanhToanDescIdDesc(Integer hoaDonId);

    boolean existsByHoaDon_Id(Integer hoaDonId);

    @Query("select sum(t.soTien) from ThanhToan t where t.hoaDon.id = :hoaDonId")
    BigDecimal sumSoTienByHoaDonId(@Param("hoaDonId") Integer hoaDonId);
}
