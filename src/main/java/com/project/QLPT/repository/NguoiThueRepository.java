package com.project.QLPT.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.QLPT.entity.NguoiThue;

public interface NguoiThueRepository
        extends JpaRepository<NguoiThue, Integer> {

    Optional<NguoiThue> findByCccd(String cccd);

    boolean existsByCccd(String cccd);

    boolean existsByCccdAndIdNot(String cccd, Integer id);

    List<NguoiThue> findByHoTenContainingIgnoreCase(String hoTen);

    List<NguoiThue> findBySoDienThoaiContaining(String soDienThoai);
}