package com.project.QLPT.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.project.QLPT.entity.TaiKhoan;

public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Integer> {
    java.util.Optional<TaiKhoan> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}

