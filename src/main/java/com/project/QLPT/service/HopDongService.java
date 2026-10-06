package com.project.QLPT.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.QLPT.dto.request.HopDongRequest;
import com.project.QLPT.dto.response.HopDongResponse;
import com.project.QLPT.entity.HopDong;
import com.project.QLPT.entity.Phong;
import com.project.QLPT.enums.TrangThaiHopDong;
import com.project.QLPT.enums.TrangThaiPhong;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.exception.ResourceNotFoundException;
import com.project.QLPT.repository.HopDongRepository;
import com.project.QLPT.repository.PhongRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service xử lý các nghiệp vụ liên quan đến hợp đồng thuê phòng.
 *
 * <p>Cung cấp các chức năng tạo mới, truy vấn, cập nhật,
 * kết thúc và hủy hợp đồng.</p>
 *
 * <p>Đồng thời đảm bảo các quy tắc nghiệp vụ như phòng phải đang trống
 * khi lập hợp đồng, một phòng không được có nhiều hợp đồng đang hiệu lực, ngày kết thúc phải sau
 * ngày bắt đầu và trạng thái phòng được cập nhật phù hợp với trạng thái của hợp đồng.</p>
 */
@Service
@RequiredArgsConstructor
public class HopDongService {

  private final HopDongRepository hopDongRepository;
  private final PhongRepository phongRepository;

  /**
   * Tạo mới hợp đồng thuê phòng.
   *
   * <p>Chỉ có thể lập hợp đồng khi phòng đang ở trạng thái
   * {@link TrangThaiPhong#TRONG} và chưa có hợp đồng {@link TrangThaiHopDong#DANG_HIEU_LUC}.</p>
   *
   * <p>Sau khi hợp đồng được tạo thành công, trạng thái của phòng
   * được chuyển sang {@link TrangThaiPhong#DANG_THUE}.</p>
   *
   * @param request thông tin hợp đồng cần tạo
   * @return thông tin hợp đồng sau khi được tạo
   * @throws ResourceNotFoundException nếu không tìm thấy phòng
   * @throws BusinessException         nếu ngày hợp đồng không hợp lệ, phòng không trống hoặc phòng
   *                                   đã có hợp đồng đang hiệu lực
   */
  @Transactional
  public HopDongResponse create(HopDongRequest request) {

    validateDate(request);

    Phong phong = findPhong(request.phongId());

    if (phong.getTrangThai()
        != TrangThaiPhong.TRONG) {
      throw new BusinessException(
          "Chỉ có thể lập hợp đồng cho phòng đang trống");
    }

    if (hopDongRepository
        .existsByPhong_IdAndTrangThai(
            phong.getId(),
            TrangThaiHopDong.DANG_HIEU_LUC)) {

      throw new BusinessException(
          "Phòng đã có hợp đồng đang hiệu lực");
    }

    HopDong entity = HopDong.builder()
        .phong(phong)
        .ngayBatDau(request.ngayBatDau())
        .ngayKetThuc(request.ngayKetThuc())
        .giaThueThoaThuan(
            request.giaThueThoaThuan())
        .tienCoc(request.tienCoc())
        .trangThai(
            TrangThaiHopDong.DANG_HIEU_LUC)
        .build();

    phong.setTrangThai(
        TrangThaiPhong.DANG_THUE);

    return toResponse(
        hopDongRepository.save(entity));
  }

  /**
   * Lấy thông tin hợp đồng theo ID.
   *
   * @param id ID của hợp đồng
   * @return thông tin hợp đồng tương ứng
   * @throws ResourceNotFoundException nếu không tìm thấy hợp đồng
   */
  @Transactional(readOnly = true)
  public HopDongResponse getById(Integer id) {
    return toResponse(findEntity(id));
  }

  /**
   * Lấy danh sách tất cả hợp đồng.
   *
   * @return danh sách hợp đồng trong hệ thống
   */
  @Transactional(readOnly = true)
  public List<HopDongResponse> getAll() {

    return hopDongRepository.findAll()
        .stream()
        .map(this::toResponse)
        .toList();
  }

  /**
   * Cập nhật thông tin của hợp đồng.
   *
   * <p>Chỉ hợp đồng đang hiệu lực mới được phép chỉnh sửa.
   * Không cho phép thay đổi phòng của hợp đồng sau khi hợp đồng đã được tạo.</p>
   *
   * @param id      ID của hợp đồng cần cập nhật
   * @param request thông tin mới của hợp đồng
   * @return thông tin hợp đồng sau khi cập nhật
   * @throws ResourceNotFoundException nếu không tìm thấy hợp đồng
   * @throws BusinessException         nếu hợp đồng không đang hiệu lực, yêu cầu thay đổi phòng hoặc
   *                                   ngày hợp đồng không hợp lệ
   */
  @Transactional
  public HopDongResponse update(
      Integer id,
      HopDongRequest request) {

    HopDong entity = findEntity(id);

    if (entity.getTrangThai()
        != TrangThaiHopDong.DANG_HIEU_LUC) {
      throw new BusinessException(
          "Chỉ được chỉnh sửa hợp đồng đang hiệu lực");
    }

    if (!entity.getPhong().getId()
        .equals(request.phongId())) {
      throw new BusinessException(
          "Không thể chuyển hợp đồng sang phòng khác");
    }

    validateDate(request);

    entity.setNgayBatDau(request.ngayBatDau());
    entity.setNgayKetThuc(request.ngayKetThuc());
    entity.setGiaThueThoaThuan(
        request.giaThueThoaThuan());
    entity.setTienCoc(request.tienCoc());

    return toResponse(entity);
  }

  /**
   * Kết thúc một hợp đồng đang hiệu lực.
   *
   * <p>Sau khi hợp đồng được kết thúc, trạng thái hợp đồng được chuyển
   * sang {@link TrangThaiHopDong#DA_KET_THUC} và phòng tương ứng được chuyển về trạng thái
   * {@link TrangThaiPhong#TRONG}.</p>
   *
   * @param id ID của hợp đồng cần kết thúc
   * @return thông tin hợp đồng sau khi kết thúc
   * @throws ResourceNotFoundException nếu không tìm thấy hợp đồng
   * @throws BusinessException         nếu hợp đồng không đang hiệu lực
   */
  @Transactional
  public HopDongResponse ketThuc(Integer id) {

    HopDong entity = findEntity(id);

    if (entity.getTrangThai()
        != TrangThaiHopDong.DANG_HIEU_LUC) {
      throw new BusinessException(
          "Hợp đồng không đang hiệu lực");
    }

    entity.setTrangThai(
        TrangThaiHopDong.DA_KET_THUC);

    entity.getPhong().setTrangThai(
        TrangThaiPhong.TRONG);

    return toResponse(entity);
  }

  /**
   * Hủy một hợp đồng đang hiệu lực.
   *
   * <p>Sau khi hủy, trạng thái hợp đồng được chuyển sang
   * {@link TrangThaiHopDong#DA_HUY} và phòng tương ứng được chuyển về trạng thái
   * {@link TrangThaiPhong#TRONG}.</p>
   *
   * @param id ID của hợp đồng cần hủy
   * @return thông tin hợp đồng sau khi hủy
   * @throws ResourceNotFoundException nếu không tìm thấy hợp đồng
   * @throws BusinessException         nếu hợp đồng không đang hiệu lực
   */
  @Transactional
  public HopDongResponse huy(Integer id) {

    HopDong entity = findEntity(id);

    if (entity.getTrangThai()
        != TrangThaiHopDong.DANG_HIEU_LUC) {
      throw new BusinessException(
          "Chỉ có thể hủy hợp đồng đang hiệu lực");
    }

    entity.setTrangThai(
        TrangThaiHopDong.DA_HUY);

    entity.getPhong().setTrangThai(
        TrangThaiPhong.TRONG);

    return toResponse(entity);
  }

  /**
   * Kiểm tra tính hợp lệ của khoảng thời gian hợp đồng.
   *
   * <p>Ngày kết thúc bắt buộc phải sau ngày bắt đầu.</p>
   *
   * @param request thông tin hợp đồng cần kiểm tra
   * @throws BusinessException nếu ngày kết thúc không sau ngày bắt đầu
   */
  private void validateDate(HopDongRequest request) {

    if (!request.ngayKetThuc()
        .isAfter(request.ngayBatDau())) {
      throw new BusinessException(
          "Ngày kết thúc phải sau ngày bắt đầu");
    }
  }

  /**
   * Tìm entity hợp đồng theo ID.
   *
   * @param id ID của hợp đồng
   * @return entity hợp đồng tương ứng
   * @throws ResourceNotFoundException nếu không tìm thấy hợp đồng
   */
  private HopDong findEntity(Integer id) {

    return hopDongRepository.findById(id)
        .orElseThrow(
            () -> new ResourceNotFoundException(
                "Không tìm thấy hợp đồng id = "
                    + id));
  }

  /**
   * Tìm phòng theo ID.
   *
   * @param id ID của phòng
   * @return entity phòng tương ứng
   * @throws ResourceNotFoundException nếu không tìm thấy phòng
   */
  private Phong findPhong(Integer id) {

    return phongRepository.findById(id)
        .orElseThrow(
            () -> new ResourceNotFoundException(
                "Không tìm thấy phòng id = "
                    + id));
  }

  /**
   * Chuyển đổi entity {@link HopDong} sang DTO {@link HopDongResponse}.
   *
   * @param entity entity hợp đồng cần chuyển đổi
   * @return DTO chứa thông tin hợp đồng
   */
  private HopDongResponse toResponse(
      HopDong entity) {

    return new HopDongResponse(
        entity.getId(),
        entity.getPhong().getId(),
        entity.getPhong().getSoPhong(),
        entity.getNgayBatDau(),
        entity.getNgayKetThuc(),
        entity.getGiaThueThoaThuan(),
        entity.getTienCoc(),
        entity.getTrangThai());
  }
}
