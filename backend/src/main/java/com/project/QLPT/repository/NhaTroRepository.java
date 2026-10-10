package com.project.QLPT.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.project.QLPT.entity.NhaTro;

public interface NhaTroRepository extends JpaRepository<NhaTro, Integer> {
    java.util.Optional<NhaTro> findByIdAndChuTro_Id(Integer id, Integer chuTroId);
    org.springframework.data.domain.Page<NhaTro> findByChuTro_Id(Integer chuTroId,
        org.springframework.data.domain.Pageable pageable);
}

