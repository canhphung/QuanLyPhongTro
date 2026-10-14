package com.project.QLPT.repository;

import java.util.Optional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import com.project.QLPT.entity.NhaTro;
import jakarta.persistence.LockModeType;

public interface NhaTroRepository extends JpaRepository<NhaTro, Integer> {
    Optional<NhaTro> findByIdAndChuTro_Id(Integer id, Integer chuTroId);
    Page<NhaTro> findByChuTro_Id(Integer chuTroId, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select n from NhaTro n where n.id = :id and n.chuTro.id = :chuTroId")
    Optional<NhaTro> findOwnedForUpdate(@Param("id") Integer id,
        @Param("chuTroId") Integer chuTroId);
}
