package com.project.QLPT.repository;
import java.util.Optional;
import com.project.QLPT.entity.TinDang;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
public interface TinDangRepository extends JpaRepository<TinDang,Integer>,JpaSpecificationExecutor<TinDang> {
 boolean existsByPhong_Id(Integer id);
 @EntityGraph(attributePaths={"phong","phong.nhaTro"})
 Optional<TinDang> findByIdAndPhong_NhaTro_ChuTro_Id(Integer id,Integer ownerId);
 @Lock(LockModeType.PESSIMISTIC_WRITE)
 @Query("select t from TinDang t where t.id=:id and t.phong.nhaTro.chuTro.id=:ownerId")
 Optional<TinDang> findOwnedForUpdate(@Param("id") Integer id,@Param("ownerId") Integer ownerId);
 @Lock(LockModeType.PESSIMISTIC_WRITE)
 @Query("select t from TinDang t where t.id=:id")
 Optional<TinDang> findForUpdate(@Param("id") Integer id);
 @Override @EntityGraph(attributePaths={"phong","phong.nhaTro"})
 Page<TinDang> findAll(Specification<TinDang> spec,Pageable pageable);
}
