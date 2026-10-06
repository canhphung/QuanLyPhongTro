package com.project.QLPT.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.QLPT.entity.DichVu;

/**
 * Repository truy cập dữ liệu cho {@link DichVu}.
 *
 * <p>
 * Bổ sung các truy vấn liên quan đến tên dịch vụ và trạng thái
 * hoạt động, phục vụ kiểm tra tính duy nhất và tìm kiếm.
 * </p>
 */
public interface DichVuRepository extends JpaRepository<DichVu, Integer> {

    /**
     * Kiểm tra xem tên dịch vụ đã tồn tại hay chưa.
     *
     * @param tenDichVu tên dịch vụ cần kiểm tra
     * @return {@code true} nếu tên đã tồn tại, ngược lại là {@code false}
     */
    boolean existsByTenDichVu(String tenDichVu);

    /**
     * Kiểm tra xem tên dịch vụ đã được sử dụng bởi dịch vụ khác hay chưa.
     *
     * <p>
     * Dùng khi cập nhật dịch vụ để kiểm tra tính duy nhất nhưng bỏ qua
     * chính dịch vụ đang được cập nhật.
     * </p>
     *
     * @param tenDichVu  tên dịch vụ cần kiểm tra
     * @param id         mã dịch vụ cần loại trừ khỏi quá trình kiểm tra
     * @return {@code true} nếu tên thuộc về một dịch vụ khác
     */
    boolean existsByTenDichVuAndIdNot(String tenDichVu, Integer id);

    /**
     * Lấy danh sách dịch vụ đang hoạt động.
     *
     * @return danh sách dịch vụ có trạng thái hoạt động
     */
    List<DichVu> findByDangHoatDongTrue();

    /**
     * Tìm kiếm dịch vụ tên chứa từ khóa, không phân biệt hoa thường.
     *
     * @param tenDichVu từ khóa cần tìm
     * @return danh sách dịch vụ phù hợp với từ khóa
     */
    List<DichVu> findByTenDichVuContainingIgnoreCase(String tenDichVu);
}