package com.project.QLPT.repository;
import java.util.List;
import com.project.QLPT.entity.LichSuTinDang;
import org.springframework.data.jpa.repository.*;
public interface LichSuTinDangRepository extends JpaRepository<LichSuTinDang,Integer> {
 boolean existsByTinDang_Id(Integer id);
 @EntityGraph(attributePaths="nguoiThucHien")
 List<LichSuTinDang> findTop200ByTinDang_IdOrderByIdDesc(Integer id);
}
