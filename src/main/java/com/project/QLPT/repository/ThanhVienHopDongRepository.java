package com.project.QLPT.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.QLPT.entity.ThanhVienHopDong;
import com.project.QLPT.entity.id.ThanhVienHopDongId;

public interface ThanhVienHopDongRepository
        extends JpaRepository<
            ThanhVienHopDong,
            ThanhVienHopDongId
        > {
}
