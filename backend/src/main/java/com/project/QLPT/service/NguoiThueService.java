package com.project.QLPT.service;

import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Isolation;
import com.project.QLPT.dto.response.PageResponse;
import com.project.QLPT.repository.specification.OwnerSpecifications;
import com.project.QLPT.service.support.PageSupport;
import jakarta.persistence.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.QLPT.dto.request.NguoiThueRequest;
import com.project.QLPT.dto.response.NguoiThueResponse;
import com.project.QLPT.entity.NguoiThue;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.exception.ResourceNotFoundException;
import com.project.QLPT.repository.NguoiThueRepository;
import com.project.QLPT.repository.ThanhVienHopDongRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service xử lý các nghiệp vụ liên quan đến người thuê.
 *
 * <p>
 * Cung cấp các chức năng tạo mới, truy vấn, cập nhật,
 * tìm kiếm và xóa người thuê. Đồng thời đảm bảo các quy tắc
 * nghiệp vụ như tính duy nhất của CCCD và không cho phép xóa
 * người thuê đã tham gia hợp đồng.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class NguoiThueService {

    private final NguoiThueRepository nguoiThueRepository;
    private final CurrentAccountService currentAccount;
    @PersistenceContext private EntityManager entityManager;
    private final ThanhVienHopDongRepository thanhVienHopDongRepository;

    /**
     * Tạo mới một người thuê.
     *
     * <p>
     * CCCD được chuẩn hóa bằng cách loại bỏ khoảng trắng ở hai đầu
     * và phải là duy nhất trong dữ liệu của chủ trọ. Các trường không bắt buộc
     * được chuẩn hóa về {@code null} nếu chỉ chứa khoảng trắng.
     * </p>
     *
     * @param request thông tin người thuê cần tạo
     * @return thông tin người thuê sau khi được lưu
     * @throws BusinessException nếu CCCD đã tồn tại
     */
    @Transactional
    public NguoiThueResponse create(NguoiThueRequest request) {
        var owner = currentAccount.getChuTro();

        String cccd = request.cccd().trim();

        if (nguoiThueRepository.existsByChuTro_IdAndCccd(owner.getId(), cccd)) {
            throw new BusinessException("CCCD đã tồn tại");
        }

        NguoiThue entity = NguoiThue.builder().chuTro(owner)
                .hoTen(request.hoTen().trim())
                .cccd(cccd)
                .soDienThoai(trimToNull(request.soDienThoai()))
                .ngaySinh(request.ngaySinh())
                .diaChiThuongTru(trimToNull(request.diaChiThuongTru()))
                .build();

        return toResponse(
                nguoiThueRepository.saveAndFlush(entity));
    }

    /**
     * Lấy thông tin người thuê theo ID.
     *
     * @param id ID của người thuê
     * @return thông tin người thuê tương ứng
     * @throws ResourceNotFoundException nếu không tìm thấy người thuê
     */
    @Transactional(readOnly = true)
    public NguoiThueResponse getById(Integer id) {

        return toResponse(findEntity(id));
    }

    /**
     * Lấy danh sách tất cả người thuê.
     *
     * @return danh sách thông tin người thuê
     */
    @Transactional(readOnly = true)
    public List<NguoiThueResponse> getAll() {

        return nguoiThueRepository.findAll(OwnerSpecifications.nguoiThue(currentAccount.getChuTro().getId(), null), Sort.by("id"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Cập nhật thông tin của một người thuê.
     *
     * <p>
     * Người thuê phải tồn tại và CCCD mới không được trùng
     * với CCCD của người thuê khác trong dữ liệu của chủ trọ.
     * </p>
     *
     * @param id      ID của người thuê cần cập nhật
     * @param request thông tin mới của người thuê
     * @return thông tin người thuê sau khi cập nhật
     * @throws ResourceNotFoundException nếu không tìm thấy người thuê
     * @throws BusinessException         nếu CCCD đã được sử dụng bởi người thuê
     *                                   khác
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public NguoiThueResponse update(
            Integer id,
            NguoiThueRequest request) {

        NguoiThue entity = ownedForUpdate(id);

        String cccd = request.cccd().trim();

        if (nguoiThueRepository.existsByChuTro_IdAndCccdAndIdNot(currentAccount.getChuTro().getId(), cccd, id)) {
            throw new BusinessException("CCCD đã tồn tại");
        }

        entity.setHoTen(request.hoTen().trim());
        entity.setCccd(cccd);
        entity.setSoDienThoai(trimToNull(request.soDienThoai()));
        entity.setNgaySinh(request.ngaySinh());
        entity.setDiaChiThuongTru(
                trimToNull(request.diaChiThuongTru()));

        nguoiThueRepository.flush();
        return toResponse(entity);
    }

    /**
     * Tìm kiếm người thuê theo họ tên.
     *
     * <p>
     * Tìm kiếm theo một phần tên và không phân biệt
     * chữ hoa, chữ thường.
     * </p>
     *
     * @param keyword từ khóa tìm kiếm
     * @return danh sách người thuê có họ tên phù hợp
     */
    @Transactional(readOnly = true)
    public List<NguoiThueResponse> searchByName(String keyword) {

        return nguoiThueRepository
                .findAll(OwnerSpecifications.nguoiThue(currentAccount.getChuTro().getId(), keyword), Sort.by("id"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Xóa người thuê theo ID.
     *
     * <p>
     * Chỉ cho phép xóa khi người thuê chưa tham gia
     * bất kỳ hợp đồng nào.
     * </p>
     *
     * @param id ID của người thuê cần xóa
     * @throws ResourceNotFoundException nếu không tìm thấy người thuê
     * @throws BusinessException         nếu người thuê đã tham gia hợp đồng
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void delete(Integer id) {

        NguoiThue entity = ownedForUpdate(id);

        if (thanhVienHopDongRepository
                .existsByNguoiThue_Id(id)) {

            throw new BusinessException(
                    "Không thể xóa người thuê đã tham gia hợp đồng");
        }

        nguoiThueRepository.delete(entity);
        nguoiThueRepository.flush();
    }

    /**
     * Tìm entity người thuê theo ID.
     *
     * @param id ID của người thuê
     * @return entity người thuê tương ứng
     * @throws ResourceNotFoundException nếu không tìm thấy người thuê
     */
    private NguoiThue findEntity(Integer id) {

        return nguoiThueRepository.findByIdAndChuTro_Id(id, currentAccount.getChuTro().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy người thuê id = " + id));
    }

    /**
     * Chuyển đổi entity {@link NguoiThue} sang DTO
     * {@link NguoiThueResponse}.
     *
     * @param entity entity người thuê cần chuyển đổi
     * @return DTO chứa thông tin người thuê
     */
    private NguoiThueResponse toResponse(NguoiThue entity) {

        return new NguoiThueResponse(
                entity.getId(),
                entity.getHoTen(),
                entity.getCccd(),
                entity.getSoDienThoai(),
                entity.getNgaySinh(),
                entity.getDiaChiThuongTru());
    }

    /**
     * Loại bỏ khoảng trắng ở hai đầu chuỗi và chuyển chuỗi rỗng
     * thành {@code null}.
     *
     * @param value chuỗi cần chuẩn hóa
     * @return chuỗi sau khi loại bỏ khoảng trắng,
     *         hoặc {@code null} nếu giá trị ban đầu là {@code null}
     *         hoặc chỉ chứa khoảng trắng
     */
    private String trimToNull(String value) {

        if (value == null) {
            return null;
        }

        String result = value.trim();

        return result.isEmpty() ? null : result;
    }

    private NguoiThue ownedForUpdate(Integer id) {
        var entity = nguoiThueRepository.findOwnedForUpdate(id, currentAccount.getChuTro().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người thuê"));
        entityManager.refresh(entity, LockModeType.PESSIMISTIC_WRITE);
        return entity;
    }

    @Transactional(readOnly = true)
    public PageResponse<NguoiThueResponse> getPage(int page, int size, String keyword) {
        var pageable = PageSupport.pageable(page, size, "id", "asc", Set.of("id"));
        return PageSupport.response(nguoiThueRepository.findAll(OwnerSpecifications.nguoiThue(
            currentAccount.getChuTro().getId(), keyword), pageable), this::toResponse);
    }
}
