package com.project.QLPT.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.project.QLPT.entity.Phong;
import com.project.QLPT.enums.TrangThaiPhong;

/**
 * Repository cung cấp các thao tác truy cập dữ liệu cho {@link Phong}.
 *
 * <p>Kế thừa {@link JpaRepository} để sử dụng các thao tác CRUD cơ bản
 * và bổ sung các truy vấn phục vụ nghiệp vụ quản lý phòng.</p>
 */
public interface PhongRepository
    extends JpaRepository<Phong, Integer> {

  /**
   * Kiểm tra xem số phòng đã tồn tại trong hệ thống hay chưa.
   *
   * <p>Thường được sử dụng khi tạo phòng mới nhằm đảm bảo
   * số phòng không bị trùng lặp.</p>
   *
   * @param soPhong số phòng cần kiểm tra
   * @return {@code true} nếu số phòng đã tồn tại, {@code false} nếu chưa tồn tại
   */
  boolean existsBySoPhong(String soPhong);

  /**
   * Kiểm tra xem số phòng đã được sử dụng bởi một phòng khác hay chưa, đồng thời loại trừ phòng có
   * ID được chỉ định.
   *
   * <p>Phương thức này thường được sử dụng khi cập nhật phòng để kiểm tra
   * trùng số phòng nhưng không tính chính bản ghi đang được chỉnh sửa.</p>
   *
   * @param soPhong số phòng cần kiểm tra
   * @param id      ID của phòng cần loại trừ khỏi quá trình kiểm tra
   * @return {@code true} nếu có phòng khác sử dụng cùng số phòng, {@code false} nếu không tồn tại
   */
  boolean existsBySoPhongAndIdNot(
      String soPhong,
      Integer id);

  /**
   * Tìm tất cả phòng theo trạng thái được chỉ định.
   *
   * <p>Có thể sử dụng để lấy danh sách phòng trống,
   * phòng đang được thuê hoặc các trạng thái phòng khác.</p>
   *
   * @param trangThai trạng thái phòng cần tìm
   * @return danh sách các phòng có trạng thái tương ứng
   */
  List<Phong> findByTrangThai(
      TrangThaiPhong trangThai);

  long countByTrangThai(TrangThaiPhong trangThai);

  Page<Phong> findBySoPhongContainingIgnoreCase(
      String keyword,
      Pageable pageable
  );

  Page<Phong> findByTrangThai(
      TrangThaiPhong trangThai,
      Pageable pageable
  );

  Page<Phong> findByTrangThaiAndSoPhongContainingIgnoreCase(
      TrangThaiPhong trangThai,
      String keyword,
      Pageable pageable
  );
}