package com.project.QLPT.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.project.QLPT.dto.request.PhongRequest;
import com.project.QLPT.dto.response.PhongResponse;
import com.project.QLPT.enums.TrangThaiPhong;
import com.project.QLPT.service.PhongService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller cung cấp các API quản lý phòng trọ.
 *
 * <p>Hỗ trợ các chức năng tạo mới, xem chi tiết, lấy danh sách,
 * lọc phòng theo trạng thái, cập nhật và xóa phòng.</p>
 */
@RestController
@RequestMapping("/api/phong")
@RequiredArgsConstructor
public class PhongController {

  private final PhongService phongService;

  /**
   * Tạo mới một phòng.
   *
   * <p>Dữ liệu yêu cầu được kiểm tra hợp lệ trước khi chuyển
   * đến tầng service để xử lý nghiệp vụ.</p>
   *
   * @param request thông tin phòng cần tạo
   * @return thông tin phòng sau khi được tạo
   */
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public PhongResponse create(
      @Valid @RequestBody PhongRequest request) {

    return phongService.create(request);
  }

  /**
   * Lấy thông tin phòng theo ID.
   *
   * @param id ID của phòng cần tìm
   * @return thông tin phòng tương ứng
   */
  @GetMapping("/{id}")
  public PhongResponse getById(
      @PathVariable Integer id) {

    return phongService.getById(id);
  }

  /**
   * Lấy danh sách tất cả phòng trong hệ thống.
   *
   * @return danh sách tất cả phòng
   */
  @GetMapping
  public List<PhongResponse> getAll() {

    return phongService.getAll();
  }

  /**
   * Lấy danh sách phòng theo trạng thái.
   *
   * <p>Trạng thái được truyền thông qua query parameter
   * {@code value}. Giá trị phải tương ứng với một trạng thái được định nghĩa trong
   * {@link TrangThaiPhong}.</p>
   *
   * <p>Ví dụ:
   * {@code GET /api/phong/trang-thai?value=TRONG}</p>
   *
   * @param trangThai trạng thái phòng cần lọc
   * @return danh sách phòng có trạng thái tương ứng
   */
  @GetMapping("/trang-thai")
  public List<PhongResponse> getByTrangThai(
      @RequestParam("value")
      TrangThaiPhong trangThai) {

    return phongService.getByTrangThai(trangThai);
  }

  /**
   * Cập nhật thông tin của một phòng.
   *
   * <p>Cho phép cập nhật các thông tin như số phòng,
   * diện tích và giá thuê. Trạng thái phòng không được thay đổi trực tiếp thông qua API này.</p>
   *
   * @param id      ID của phòng cần cập nhật
   * @param request thông tin mới của phòng
   * @return thông tin phòng sau khi được cập nhật
   */
  @PutMapping("/{id}")
  public PhongResponse update(
      @PathVariable Integer id,
      @Valid @RequestBody PhongRequest request) {

    return phongService.update(id, request);
  }

  /**
   * Xóa một phòng khỏi hệ thống.
   *
   * <p>Phòng chỉ có thể được xóa nếu chưa từng phát sinh
   * hợp đồng. Khi xóa thành công, API trả về HTTP 204 (No Content).</p>
   *
   * @param id ID của phòng cần xóa
   */
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(
      @PathVariable Integer id) {

    phongService.delete(id);
  }
}