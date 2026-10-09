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
import com.project.QLPT.repository.HopDongRepository;
import com.project.QLPT.repository.NguoiThueRepository;
import com.project.QLPT.repository.ThanhVienHopDongRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;

@Service
public class ThanhVienHopDongService {

    private final ThanhVienHopDongRepository thanhVienHopDongRepository;
    private final HopDongRepository hopDongRepository;
    private final NguoiThueRepository nguoiThueRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public ThanhVienHopDongService(ThanhVienHopDongRepository thanhVienHopDongRepository,
            HopDongRepository hopDongRepository, NguoiThueRepository nguoiThueRepository) {
        this.thanhVienHopDongRepository = thanhVienHopDongRepository;
        this.hopDongRepository = hopDongRepository;
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

        return toResponse(thanhVienHopDongRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<ThanhVienHopDongResponse> getByHopDong(Integer hopDongId, boolean dangO) {
        findHopDong(hopDongId);
        List<ThanhVienHopDong> entities = dangO
                ? thanhVienHopDongRepository.findByHopDong_IdAndNgayRoiIsNullOrderByNgayVaoAsc(hopDongId)
                : thanhVienHopDongRepository.findByHopDong_IdOrderByNgayVaoAsc(hopDongId);
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
        thanhVienHopDongRepository.delete(findEntity(hopDongId, nguoiThueId));
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

    private HopDong findHopDong(Integer id) {
        return hopDongRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy hợp đồng id = " + id));
    }

    private HopDong findHopDongForUpdate(Integer id) {
        HopDong entity = entityManager.find(
            HopDong.class,
            id,
            LockModeType.PESSIMISTIC_WRITE
        );

        if (entity == null) {
            throw new ResourceNotFoundException(
                "Không tìm thấy hợp đồng id = " + id
            );
        }

        entityManager.refresh(
            entity,
            LockModeType.PESSIMISTIC_WRITE
        );

        return entity;
    }

    private NguoiThue findNguoiThue(Integer id) {
        return nguoiThueRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy người thuê id = " + id));
    }

    private ThanhVienHopDong findEntity(Integer hopDongId, Integer nguoiThueId) {
        return thanhVienHopDongRepository.findById(new ThanhVienHopDongId(hopDongId, nguoiThueId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy người thuê id = " + nguoiThueId + " trong hợp đồng id = " + hopDongId));
    }

    private ThanhVienHopDongResponse toResponse(ThanhVienHopDong entity) {
        NguoiThue nguoiThue = entity.getNguoiThue();
        return new ThanhVienHopDongResponse(entity.getHopDong().getId(), nguoiThue.getId(),
                nguoiThue.getHoTen(), nguoiThue.getCccd(), nguoiThue.getSoDienThoai(),
                entity.getNgayVao(), entity.getNgayRoi(), entity.getLaDaiDien());
    }
}
