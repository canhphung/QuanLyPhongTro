package com.project.QLPT.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.QLPT.entity.HopDong;
import com.project.QLPT.enums.TrangThaiHopDong;

/**
 * Repository cung cấp các thao tác truy cập dữ liệu cho {@link HopDong}.
 *
 * <p>Kế thừa {@link JpaRepository} để sử dụng các thao tác CRUD cơ bản
 * và bổ sung các truy vấn phục vụ nghiệp vụ quản lý hợp đồng thuê phòng.</p>
 */
public interface HopDongRepository
    extends JpaRepository<HopDong, Integer>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<HopDong> {

  /**
   * Kiểm tra xem một phòng có tồn tại hợp đồng với trạng thái được chỉ định hay không.
   *
   * <p>Phương thức này thường được sử dụng để kiểm tra phòng đã có
   * hợp đồng đang hiệu lực trước khi tạo hợp đồng mới.</p>
   *
   * @param phongId   mã định danh của phòng cần kiểm tra
   * @param trangThai trạng thái hợp đồng cần kiểm tra
   * @return {@code true} nếu tồn tại hợp đồng của phòng với trạng thái tương ứng, {@code false} nếu
   * không tồn tại
   */
  boolean existsByPhong_IdAndTrangThai(
      Integer phongId,
      TrangThaiHopDong trangThai);

  /**
   * Kiểm tra xem một phòng có được tham chiếu bởi bất kỳ hợp đồng nào trong hệ thống hay không.
   *
   * <p>Phương thức này không xét trạng thái của hợp đồng. Chỉ cần tồn tại
   * ít nhất một hợp đồng liên kết với phòng thì kết quả sẽ là {@code true}.</p>
   *
   * <p>Có thể sử dụng phương thức này trước khi xóa phòng để tránh xóa
   * phòng đã phát sinh lịch sử hợp đồng.</p>
   *
   * @param phongId mã định danh của phòng cần kiểm tra
   * @return {@code true} nếu phòng đã được sử dụng trong ít nhất một hợp đồng, {@code false} nếu
   * chưa có hợp đồng nào
   */
  boolean existsByPhong_Id(Integer phongId);

  long countByTrangThai(TrangThaiHopDong trangThai);

  @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"phong", "phong.nhaTro"})
  java.util.Optional<HopDong> findByIdAndPhong_NhaTro_ChuTro_Id(Integer id, Integer ownerId);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select h from HopDong h where h.id = :id and h.phong.nhaTro.chuTro.id = :ownerId")
  java.util.Optional<HopDong> findOwnedForUpdate(
      @org.springframework.data.repository.query.Param("id") Integer id,
      @org.springframework.data.repository.query.Param("ownerId") Integer ownerId);

  @Override
  @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"phong", "phong.nhaTro"})
  org.springframework.data.domain.Page<HopDong> findAll(
      org.springframework.data.jpa.domain.Specification<HopDong> specification,
      org.springframework.data.domain.Pageable pageable);

  @Override
  @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"phong", "phong.nhaTro"})
  java.util.List<HopDong> findAll(
      org.springframework.data.jpa.domain.Specification<HopDong> specification,
      org.springframework.data.domain.Sort sort);
}
