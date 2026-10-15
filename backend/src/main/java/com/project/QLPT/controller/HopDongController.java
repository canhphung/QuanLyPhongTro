package com.project.QLPT.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.project.QLPT.dto.request.HopDongRequest;
import com.project.QLPT.dto.request.KetThucHopDongRequest;
import com.project.QLPT.dto.response.HopDongResponse;
import com.project.QLPT.service.HopDongService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller cung cấp các API quản lý hợp đồng thuê phòng.
 *
 * <p>Hỗ trợ các chức năng tạo mới, xem danh sách, xem chi tiết,
 * cập nhật, kết thúc và hủy hợp đồng thuê phòng.</p>
 */
@RestController
@RequestMapping("/api/hop-dong")
@RequiredArgsConstructor
public class HopDongController {

  private final HopDongService hopDongService;

  /**
   * Tạo mới một hợp đồng thuê phòng.
   *
   * <p>Hợp đồng chỉ được tạo khi phòng đáp ứng các điều kiện
   * nghiệp vụ để có thể cho thuê.</p>
   *
   * @param request thông tin hợp đồng cần tạo
   * @return thông tin hợp đồng sau khi được tạo
   */
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public HopDongResponse create(
      @Valid @RequestBody HopDongRequest request) {

    return hopDongService.create(request);
  }

  /**
   * Lấy thông tin hợp đồng theo ID.
   *
   * @param id ID của hợp đồng
   * @return thông tin hợp đồng tương ứng
   */
  @GetMapping("/{id}")
  public HopDongResponse getById(
      @PathVariable Integer id) {

    return hopDongService.getById(id);
  }

  /**
   * Lấy danh sách tất cả hợp đồng.
   *
   * @return danh sách hợp đồng trong hệ thống
   */
  @GetMapping
  public List<HopDongResponse> getAll() {

    return hopDongService.getAll();
  }

  /**
   * Cập nhật thông tin của một hợp đồng.
   *
   * <p>Chỉ hợp đồng đang hiệu lực mới được phép chỉnh sửa
   * và không được chuyển hợp đồng sang phòng khác.</p>
   *
   * @param id      ID của hợp đồng cần cập nhật
   * @param request thông tin mới của hợp đồng
   * @return thông tin hợp đồng sau khi được cập nhật
   */
  @PutMapping("/{id}")
  public HopDongResponse update(
      @PathVariable Integer id,
      @Valid @RequestBody HopDongRequest request) {

    return hopDongService.update(id, request);
  }

  /**
   * Kết thúc một hợp đồng đang hiệu lực.
   *
   * <p>Sau khi kết thúc hợp đồng, phòng thuộc hợp đồng
   * sẽ được chuyển về trạng thái trống.</p>
   *
   * @param id ID của hợp đồng cần kết thúc
   * @return thông tin hợp đồng sau khi kết thúc
   */
  @PatchMapping("/{id}/ket-thuc")
  public HopDongResponse ketThuc(
      @PathVariable Integer id,
      @Valid @RequestBody KetThucHopDongRequest request
  ) {
    return hopDongService.ketThuc(id, request);
  }

  /**
   * Hủy một hợp đồng đang hiệu lực.
   *
   * <p>Sau khi hủy hợp đồng, phòng thuộc hợp đồng
   * sẽ được chuyển về trạng thái trống.</p>
   *
   * @param id ID của hợp đồng cần hủy
   * @return thông tin hợp đồng sau khi hủy
   */
  @PatchMapping("/{id}/huy")
  public HopDongResponse huy(
      @PathVariable Integer id) {

    return hopDongService.huy(id);
  }
}
