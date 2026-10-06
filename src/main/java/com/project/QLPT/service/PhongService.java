package com.project.QLPT.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.QLPT.dto.request.PhongRequest;
import com.project.QLPT.dto.response.PhongResponse;
import com.project.QLPT.entity.Phong;
import com.project.QLPT.enums.TrangThaiPhong;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.exception.ResourceNotFoundException;
import com.project.QLPT.repository.HopDongRepository;
import com.project.QLPT.repository.PhongRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service xử lý các nghiệp vụ liên quan đến phòng trọ.
 *
 * <p>Cung cấp các chức năng tạo mới, truy vấn, lọc theo trạng thái,
 * cập nhật và xóa phòng.</p>
 *
 * <p>Đồng thời đảm bảo các quy tắc nghiệp vụ như số phòng không được
 * trùng lặp, phòng mới được khởi tạo ở trạng thái {@link TrangThaiPhong#TRONG} và không cho phép
 * xóa phòng đã phát sinh hợp đồng.</p>
 */
@Service
@RequiredArgsConstructor
public class PhongService {

  private final PhongRepository phongRepository;
  private final HopDongRepository hopDongRepository;

  /**
   * Tạo mới một phòng.
   *
   * <p>Số phòng được loại bỏ khoảng trắng ở đầu và cuối trước khi
   * kiểm tra trùng lặp và lưu vào cơ sở dữ liệu.</p>
   *
   * <p>Phòng mới được khởi tạo với trạng thái mặc định là
   * {@link TrangThaiPhong#TRONG}.</p>
   *
   * @param request thông tin phòng cần tạo
   * @return thông tin phòng sau khi được tạo
   * @throws BusinessException nếu số phòng đã tồn tại
   */
  @Transactional
  public PhongResponse create(PhongRequest request) {

    String soPhong = request.soPhong().trim();

    if (phongRepository.existsBySoPhong(soPhong)) {
      throw new BusinessException(
          "Số phòng đã tồn tại");
    }

    Phong entity = Phong.builder()
        .soPhong(soPhong)
        .dienTich(request.dienTich())
        .giaThue(request.giaThue())
        .trangThai(TrangThaiPhong.TRONG)
        .build();

    return toResponse(
        phongRepository.save(entity));
  }

  /**
   * Lấy thông tin phòng theo ID.
   *
   * @param id ID của phòng cần tìm
   * @return thông tin phòng tương ứng
   * @throws ResourceNotFoundException nếu không tìm thấy phòng
   */
  @Transactional(readOnly = true)
  public PhongResponse getById(Integer id) {

    return toResponse(findEntity(id));
  }

  /**
   * Lấy danh sách tất cả phòng trong hệ thống.
   *
   * @return danh sách tất cả phòng
   */
  @Transactional(readOnly = true)
  public List<PhongResponse> getAll() {

    return phongRepository.findAll()
        .stream()
        .map(this::toResponse)
        .toList();
  }

  /**
   * Lấy danh sách phòng theo trạng thái.
   *
   * <p>Có thể sử dụng để lọc các phòng đang trống,
   * đang được thuê hoặc các trạng thái khác được định nghĩa trong {@link TrangThaiPhong}.</p>
   *
   * @param trangThai trạng thái phòng cần tìm
   * @return danh sách phòng có trạng thái tương ứng
   */
  @Transactional(readOnly = true)
  public List<PhongResponse> getByTrangThai(
      TrangThaiPhong trangThai) {

    return phongRepository
        .findByTrangThai(trangThai)
        .stream()
        .map(this::toResponse)
        .toList();
  }

  /**
   * Cập nhật thông tin của một phòng.
   *
   * <p>Số phòng được loại bỏ khoảng trắng ở đầu và cuối trước khi
   * kiểm tra trùng lặp. Khi kiểm tra, phòng hiện tại được loại trừ để tránh coi chính số phòng của
   * nó là dữ liệu bị trùng.</p>
   *
   * <p>Phương thức này chỉ cập nhật số phòng, diện tích và giá thuê;
   * không thay đổi trạng thái của phòng.</p>
   *
   * @param id      ID của phòng cần cập nhật
   * @param request thông tin mới của phòng
   * @return thông tin phòng sau khi cập nhật
   * @throws ResourceNotFoundException nếu không tìm thấy phòng
   * @throws BusinessException         nếu số phòng mới đã được sử dụng bởi một phòng khác
   */
  @Transactional
  public PhongResponse update(
      Integer id,
      PhongRequest request) {

    Phong entity = findEntity(id);

    String soPhong = request.soPhong().trim();

    if (phongRepository
        .existsBySoPhongAndIdNot(
            soPhong,
            id)) {

      throw new BusinessException(
          "Số phòng đã tồn tại");
    }

    entity.setSoPhong(soPhong);
    entity.setDienTich(request.dienTich());
    entity.setGiaThue(request.giaThue());

    return toResponse(entity);
  }

  /**
   * Xóa một phòng khỏi hệ thống.
   *
   * <p>Không cho phép xóa phòng nếu phòng đã từng phát sinh
   * hợp đồng nhằm bảo toàn lịch sử dữ liệu của hệ thống.</p>
   *
   * @param id ID của phòng cần xóa
   * @throws ResourceNotFoundException nếu không tìm thấy phòng
   * @throws BusinessException         nếu phòng đã phát sinh ít nhất một hợp đồng
   */
  @Transactional
  public void delete(Integer id) {

    Phong entity = findEntity(id);

    if (hopDongRepository.existsByPhong_Id(id)) {
      throw new BusinessException(
          "Không thể xóa phòng đã phát sinh hợp đồng");
    }

    phongRepository.delete(entity);
  }

  /**
   * Tìm entity phòng theo ID.
   *
   * @param id ID của phòng cần tìm
   * @return entity phòng tương ứng
   * @throws ResourceNotFoundException nếu không tìm thấy phòng
   */
  private Phong findEntity(Integer id) {

    return phongRepository.findById(id)
        .orElseThrow(() ->
            new ResourceNotFoundException(
                "Không tìm thấy phòng id = " + id));
  }

  /**
   * Chuyển đổi entity {@link Phong} sang DTO {@link PhongResponse}.
   *
   * @param entity entity phòng cần chuyển đổi
   * @return DTO chứa thông tin phòng
   */
  private PhongResponse toResponse(
      Phong entity) {

    return new PhongResponse(
        entity.getId(),
        entity.getSoPhong(),
        entity.getDienTich(),
        entity.getGiaThue(),
        entity.getTrangThai());
  }
}