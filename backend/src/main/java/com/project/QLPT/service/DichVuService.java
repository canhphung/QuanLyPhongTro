package com.project.QLPT.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.QLPT.dto.request.DichVuRequest;
import com.project.QLPT.dto.response.DichVuResponse;
import com.project.QLPT.entity.DichVu;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.exception.ResourceNotFoundException;
import com.project.QLPT.repository.ChiTietHoaDonRepository;
import com.project.QLPT.repository.DichVuRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service xử lý các nghiệp vụ liên quan đến dịch vụ.
 *
 * <p>
 * Cung cấp chức năng tạo mới, truy vấn, cập nhật, tìm kiếm và xóa dịch vụ.
 * Tên dịch vụ được chuẩn hóa loại bỏ khoảng trắng thừa và phải là duy nhất.
 * Không cho phép xóa dịch vụ đã được sử dụng trong bất kỳ hóa đơn nào.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class DichVuService {

    private final DichVuRepository dichVuRepository;
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;

    /**
     * Tạo mới một dịch vụ.
     *
     * <p>
     * Tên dịch vụ được chuẩn hóa bằng cách loại bỏ khoảng trắng thừa ở hai
     * đầu và phải là duy nhất trong hệ thống.
     * </p>
     *
     * @param request thông tin dịch vụ cần tạo
     * @return thông tin dịch vụ sau khi được lưu
     * @throws BusinessException nếu tên dịch vụ đã tồn tại
     */
    @Transactional
    public DichVuResponse create(DichVuRequest request) {

        String tenDichVu = request.tenDichVu().trim();

        if (dichVuRepository.existsByTenDichVu(tenDichVu)) {
            throw new BusinessException("Tên dịch vụ đã tồn tại");
        }

        DichVu entity = DichVu.builder()
                .tenDichVu(tenDichVu)
                .donViTinh(request.donViTinh().trim())
                .donGiaHienTai(request.donGiaHienTai())
                .tinhTheoChiSo(request.tinhTheoChiSo())
                .dangHoatDong(request.dangHoatDong())
                .build();

        return toResponse(
                dichVuRepository.save(entity));
    }

    /**
     * Lấy thông tin dịch vụ theo ID.
     *
     * @param id ID của dịch vụ
     * @return thông tin dịch vụ tương ứng
     * @throws ResourceNotFoundException nếu không tìm thấy dịch vụ
     */
    @Transactional(readOnly = true)
    public DichVuResponse getById(Integer id) {

        return toResponse(findEntity(id));
    }

    /**
     * Lấy danh sách tất cả dịch vụ.
     *
     * @return danh sách thông tin dịch vụ
     */
    @Transactional(readOnly = true)
    public List<DichVuResponse> getAll() {

        return dichVuRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Lấy danh sách dịch vụ đang hoạt động.
     *
     * @return danh sách dịch vụ đang hoạt động
     */
    @Transactional(readOnly = true)
    public List<DichVuResponse> getByDangHoatDong() {

        return dichVuRepository.findByDangHoatDongTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Cập nhật thông tin của một dịch vụ.
     *
     * <p>
     * Dịch vụ phải tồn tại và tên mới không được trùng với tên của dịch vụ
     * khác trong hệ thống.
     * </p>
     *
     * @param id      ID của dịch vụ cần cập nhật
     * @param request thông tin mới của dịch vụ
     * @return thông tin dịch vụ sau khi cập nhật
     * @throws ResourceNotFoundException nếu không tìm thấy dịch vụ
     * @throws BusinessException         nếu tên dịch vụ đã được sử dụng bởi
     *                                   dịch vụ khác
     */
    @Transactional
    public DichVuResponse update(Integer id, DichVuRequest request) {

        DichVu entity = findEntity(id);

        String tenDichVu = request.tenDichVu().trim();

        if (dichVuRepository
                .existsByTenDichVuAndIdNot(tenDichVu, id)) {
            throw new BusinessException("Tên dịch vụ đã tồn tại");
        }

        entity.setTenDichVu(tenDichVu);
        entity.setDonViTinh(request.donViTinh().trim());
        entity.setDonGiaHienTai(request.donGiaHienTai());
        entity.setTinhTheoChiSo(request.tinhTheoChiSo());
        entity.setDangHoatDong(request.dangHoatDong());

        return toResponse(entity);
    }

    /**
     * Tìm kiếm dịch vụ theo tên.
     *
     * <p>
     * Tìm theo một phần tên và không phân biệt chữ hoa, chữ thường.
     * </p>
     *
     * @param keyword từ khóa tìm kiếm
     * @return danh sách dịch vụ có tên phù hợp
     */
    @Transactional(readOnly = true)
    public List<DichVuResponse> searchByName(String keyword) {

        return dichVuRepository
                .findByTenDichVuContainingIgnoreCase(keyword.trim())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Xóa dịch vụ theo ID.
     *
     * <p>
     * Chỉ cho phép xóa khi dịch vụ chưa xuất hiện trong bất kỳ hóa đơn nào.
     * </p>
     *
     * @param id ID của dịch vụ cần xóa
     * @throws ResourceNotFoundException nếu không tìm thấy dịch vụ
     * @throws BusinessException         nếu dịch vụ đã được dùng trong hóa
     *                                   đơn
     */
    @Transactional
    public void delete(Integer id) {

        DichVu entity = findEntity(id);

        if (chiTietHoaDonRepository.existsByDichVu_Id(id)) {
            throw new BusinessException(
                    "Không thể xóa dịch vụ đã được sử dụng trong hóa đơn");
        }

        dichVuRepository.delete(entity);
    }

    /**
     * Tìm entity dịch vụ theo ID.
     *
     * @param id ID của dịch vụ
     * @return entity dịch vụ tương ứng
     * @throws ResourceNotFoundException nếu không tìm thấy dịch vụ
     */
    private DichVu findEntity(Integer id) {

        return dichVuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy dịch vụ id = " + id));
    }

    /**
     * Chuyển đổi entity {@link DichVu} sang DTO {@link DichVuResponse}.
     *
     * @param entity entity dịch vụ cần chuyển đổi
     * @return DTO chứa thông tin dịch vụ
     */
    private DichVuResponse toResponse(DichVu entity) {

        return new DichVuResponse(
                entity.getId(),
                entity.getTenDichVu(),
                entity.getDonViTinh(),
                entity.getDonGiaHienTai(),
                entity.getTinhTheoChiSo(),
                entity.getDangHoatDong());
    }
}