package com.project.QLPT.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.QLPT.entity.NguoiThue;

/**
 * Repository cung cấp các thao tác truy cập dữ liệu cho {@link NguoiThue}.
 *
 * <p>
 * Kế thừa {@link JpaRepository} để sử dụng các thao tác CRUD cơ bản
 * và bổ sung các truy vấn liên quan đến CCCD, họ tên và số điện thoại
 * của người thuê.
 * </p>
 */
public interface NguoiThueRepository
        extends JpaRepository<NguoiThue, Integer> {

    /**
     * Tìm người thuê theo số căn cước công dân.
     *
     * @param cccd số căn cước công dân cần tìm
     * @return {@link Optional} chứa người thuê nếu tìm thấy,
     *         ngược lại trả về {@link Optional#empty()}
     */
    Optional<NguoiThue> findByCccd(String cccd);

    /**
     * Kiểm tra xem CCCD đã tồn tại trong hệ thống hay chưa.
     *
     * @param cccd số căn cước công dân cần kiểm tra
     * @return {@code true} nếu CCCD đã tồn tại,
     *         {@code false} nếu chưa tồn tại
     */
    boolean existsByCccd(String cccd);

    /**
     * Kiểm tra xem CCCD đã được sử dụng bởi người thuê khác hay chưa.
     *
     * <p>
     * Thường được sử dụng khi cập nhật người thuê để kiểm tra
     * tính duy nhất của CCCD nhưng bỏ qua chính người thuê đang
     * được cập nhật.
     * </p>
     *
     * @param cccd số căn cước công dân cần kiểm tra
     * @param id   ID của người thuê cần loại trừ khỏi quá trình kiểm tra
     * @return {@code true} nếu CCCD thuộc về một người thuê khác,
     *         {@code false} nếu không
     */
    boolean existsByCccdAndIdNot(String cccd, Integer id);

    /**
     * Tìm kiếm người thuê có họ tên chứa từ khóa được cung cấp,
     * không phân biệt chữ hoa và chữ thường.
     *
     * @param hoTen từ khóa họ tên cần tìm kiếm
     * @return danh sách người thuê có họ tên phù hợp
     */
    List<NguoiThue> findByHoTenContainingIgnoreCase(String hoTen);

    /**
     * Tìm kiếm người thuê có số điện thoại chứa chuỗi được cung cấp.
     *
     * @param soDienThoai chuỗi số điện thoại cần tìm kiếm
     * @return danh sách người thuê có số điện thoại phù hợp
     */
    List<NguoiThue> findBySoDienThoaiContaining(String soDienThoai);
}