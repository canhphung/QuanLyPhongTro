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

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "nguoiThue")
    @org.springframework.data.jpa.repository.Query("""
        select t from ThanhVienHopDong t
        where t.hopDong.id = :contractId
          and t.hopDong.phong.nhaTro.chuTro.id = :ownerId
          and t.nguoiThue.chuTro.id = :ownerId
          and (:dangO = false or t.ngayRoi is null)
        order by t.ngayVao, t.nguoiThue.id
        """)
    List<ThanhVienHopDong> findOwnedMembers(
        @org.springframework.data.repository.query.Param("contractId") Integer contractId,
        @org.springframework.data.repository.query.Param("ownerId") Integer ownerId,
        @org.springframework.data.repository.query.Param("dangO") boolean dangO);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "nguoiThue")
    @org.springframework.data.jpa.repository.Query("""
        select t from ThanhVienHopDong t
        where t.hopDong.id = :contractId and t.nguoiThue.id = :tenantId
          and t.hopDong.phong.nhaTro.chuTro.id = :ownerId
          and t.nguoiThue.chuTro.id = :ownerId
        """)
    java.util.Optional<ThanhVienHopDong> findOwnedMember(
        @org.springframework.data.repository.query.Param("contractId") Integer contractId,
        @org.springframework.data.repository.query.Param("tenantId") Integer tenantId,
        @org.springframework.data.repository.query.Param("ownerId") Integer ownerId);
}
