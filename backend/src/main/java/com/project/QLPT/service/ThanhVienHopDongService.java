package com.project.QLPT.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.project.QLPT.dto.request.ThanhVienHopDongRequest;
import com.project.QLPT.dto.response.ThanhVienHopDongResponse;
import com.project.QLPT.entity.HopDong;
import com.project.QLPT.entity.NguoiThue;
import com.project.QLPT.entity.ThanhVienHopDong;
import com.project.QLPT.entity.id.ThanhVienHopDongId;
import com.project.QLPT.enums.TrangThaiHopDong;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.exception.ResourceNotFoundException;
import com.project.QLPT.repository.NguoiThueRepository;
import com.project.QLPT.repository.ThanhVienHopDongRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;

@Service
public class ThanhVienHopDongService {

    private final ThanhVienHopDongRepository thanhVienHopDongRepository;
    private final OwnedContractAccess access;
    private final CurrentAccountService currentAccount;
    private final NguoiThueRepository nguoiThueRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public ThanhVienHopDongService(ThanhVienHopDongRepository thanhVienHopDongRepository,
            OwnedContractAccess access, CurrentAccountService currentAccount,
            NguoiThueRepository nguoiThueRepository) {
        this.thanhVienHopDongRepository = thanhVienHopDongRepository;
        this.access = access;
        this.currentAccount = currentAccount;
        this.nguoiThueRepository = nguoiThueRepository;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ThanhVienHopDongResponse create(Integer hopDongId, ThanhVienHopDongRequest request) {
        HopDong hopDong = findHopDongForUpdate(hopDongId);
        validateDangHieuLuc(hopDong);
        validateRequest(hopDong, request);

        NguoiThue nguoiThue = findNguoiThue(request.nguoiThueId());
        ThanhVienHopDongId id = new ThanhVienHopDongId(hopDongId, nguoiThue.getId());
        if (thanhVienHopDongRepository.existsById(id)) {
            throw new BusinessException("Người thuê đã có trong hợp đồng; hãy cập nhật thành viên hiện có");
        }
        validateDaiDien(hopDongId, nguoiThue.getId(), request);

        ThanhVienHopDong entity = ThanhVienHopDong.builder()
                .id(id)
                .hopDong(hopDong)
                .nguoiThue(nguoiThue)
                .ngayVao(request.ngayVao())
                .ngayRoi(request.ngayRoi())
                .laDaiDien(request.laDaiDien())
                .build();

        return toResponse(thanhVienHopDongRepository.saveAndFlush(entity));
    }

    @Transactional(readOnly = true)
    public List<ThanhVienHopDongResponse> getByHopDong(Integer hopDongId, boolean dangO) {
        findHopDong(hopDongId);
        List<ThanhVienHopDong> entities = thanhVienHopDongRepository.findOwnedMembers(
                hopDongId, currentAccount.getChuTro().getId(), dangO);
        return entities.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ThanhVienHopDongResponse getById(Integer hopDongId, Integer nguoiThueId) {
        findHopDong(hopDongId);
        return toResponse(findEntity(hopDongId, nguoiThueId));
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ThanhVienHopDongResponse update(Integer hopDongId, Integer nguoiThueId,
            ThanhVienHopDongRequest request) {
        HopDong hopDong = findHopDongForUpdate(hopDongId);
        validateDangHieuLuc(hopDong);
        validateRequest(hopDong, request);
        if (!nguoiThueId.equals(request.nguoiThueId())) {
            throw new BusinessException("Không thể đổi người thuê của thành viên hợp đồng");
        }

        findNguoiThue(nguoiThueId);
        ThanhVienHopDong entity = findEntity(hopDongId, nguoiThueId);
        validateDaiDien(hopDongId, nguoiThueId, request);
        entity.setNgayVao(request.ngayVao());
        entity.setNgayRoi(request.ngayRoi());
        entity.setLaDaiDien(request.laDaiDien());
        return toResponse(entity);
    }

    // Xóa dùng cho bản ghi nhập nhầm. Rời phòng: PUT với ngayRoi để giữ lịch sử.
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void delete(Integer hopDongId, Integer nguoiThueId) {
        HopDong hopDong = findHopDongForUpdate(hopDongId);
        validateDangHieuLuc(hopDong);
        findNguoiThue(nguoiThueId);
        thanhVienHopDongRepository.delete(findEntity(hopDongId, nguoiThueId));
        thanhVienHopDongRepository.flush();
    }

    private void validateRequest(HopDong hopDong, ThanhVienHopDongRequest request) {
        if (request.nguoiThueId() == null || request.nguoiThueId() <= 0) {
            throw new BusinessException("Mã người thuê phải lớn hơn 0");
        }
        if (request.ngayVao() == null || request.laDaiDien() == null) {
            throw new BusinessException("Ngày vào và trạng thái đại diện không được để trống");
        }
        if (request.ngayVao().isBefore(hopDong.getNgayBatDau())
                || request.ngayVao().isAfter(hopDong.getNgayKetThuc())) {
            throw new BusinessException("Ngày vào phải nằm trong thời hạn hợp đồng");
        }
        if (request.ngayRoi() != null) {
            if (request.ngayRoi().isBefore(request.ngayVao())) {
                throw new BusinessException("Ngày rời không được trước ngày vào");
            }
            if (request.ngayRoi().isAfter(hopDong.getNgayKetThuc())) {
                throw new BusinessException("Ngày rời không được sau ngày kết thúc hợp đồng");
            }
            if (Boolean.TRUE.equals(request.laDaiDien())) {
                throw new BusinessException("Thành viên đã ghi ngày rời không thể là người đại diện");
            }
        }
    }

    private void validateDaiDien(Integer hopDongId, Integer nguoiThueId,
            ThanhVienHopDongRequest request) {
        if (Boolean.TRUE.equals(request.laDaiDien())
                && thanhVienHopDongRepository
                        .existsByHopDong_IdAndLaDaiDienTrueAndNgayRoiIsNullAndNguoiThue_IdNot(
                                hopDongId, nguoiThueId)) {
            throw new BusinessException("Hợp đồng đã có người đại diện chưa rời phòng");
        }
    }

    private void validateDangHieuLuc(HopDong hopDong) {
        if (hopDong.getTrangThai() != TrangThaiHopDong.DANG_HIEU_LUC) {
            throw new BusinessException("Chỉ chỉnh sửa thành viên của hợp đồng đang hiệu lực");
        }
    }

    private HopDong findHopDong(Integer id) { return access.get(id); }

    private HopDong findHopDongForUpdate(Integer id) { return access.lock(id); }

    private NguoiThue findNguoiThue(Integer id) {
        // Sau khóa phòng/hợp đồng, khóa hồ sơ người để tránh xóa hồ sơ đồng thời.
        var tenant = nguoiThueRepository.findOwnedForUpdate(id, currentAccount.getChuTro().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người thuê"));
        entityManager.refresh(tenant, LockModeType.PESSIMISTIC_WRITE);
        return tenant;
    }

    private ThanhVienHopDong findEntity(Integer hopDongId, Integer nguoiThueId) {
        return thanhVienHopDongRepository.findOwnedMember(hopDongId, nguoiThueId,
                currentAccount.getChuTro().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên"));
    }

    private ThanhVienHopDongResponse toResponse(ThanhVienHopDong entity) {
        NguoiThue nguoiThue = entity.getNguoiThue();
        return new ThanhVienHopDongResponse(entity.getHopDong().getId(), nguoiThue.getId(),
                nguoiThue.getHoTen(), nguoiThue.getCccd(), nguoiThue.getSoDienThoai(),
                entity.getNgayVao(), entity.getNgayRoi(), entity.getLaDaiDien());
    }
}
