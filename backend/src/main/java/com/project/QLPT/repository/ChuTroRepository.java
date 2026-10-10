package com.project.QLPT.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.project.QLPT.entity.ChuTro;

public interface ChuTroRepository extends JpaRepository<ChuTro, Integer> {
    java.util.Optional<ChuTro> findByTaiKhoan_Id(Integer taiKhoanId);
}

