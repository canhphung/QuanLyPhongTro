package com.project.QLPT.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.QLPT.entity.ThanhVienHopDong;
import com.project.QLPT.entity.id.ThanhVienHopDongId;

public interface ThanhVienHopDongRepository
        extends JpaRepository<ThanhVienHopDong, ThanhVienHopDongId> {

    // Giữ phương thức này để NguoiThueService hiện tại tiếp tục hoạt động.
    boolean existsByNguoiThue_Id(Integer nguoiThueId);

    List<ThanhVienHopDong> findByHopDong_IdOrderByNgayVaoAsc(Integer hopDongId);

    List<ThanhVienHopDong> findByHopDong_IdAndNgayRoiIsNullOrderByNgayVaoAsc(Integer hopDongId);

    boolean existsByHopDong_IdAndLaDaiDienTrueAndNgayRoiIsNullAndNguoiThue_IdNot(
            Integer hopDongId, Integer nguoiThueId);
}
