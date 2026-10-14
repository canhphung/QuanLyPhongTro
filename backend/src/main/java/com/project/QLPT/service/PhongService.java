package com.project.QLPT.service;

import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.data.domain.Sort;
import com.project.QLPT.dto.request.*;
import com.project.QLPT.dto.response.*;
import com.project.QLPT.entity.*;
import com.project.QLPT.enums.*;
import com.project.QLPT.exception.*;
import com.project.QLPT.repository.*;
import com.project.QLPT.repository.specification.OwnerSpecifications;
import com.project.QLPT.service.support.PageSupport;
import jakarta.persistence.*;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PhongService {
    private final PhongRepository phongRepository;
    private final HopDongRepository hopDongRepository;
    private final NhaTroRepository nhaTroRepository;
    private final CurrentAccountService currentAccount;
    @PersistenceContext private EntityManager entityManager;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PhongResponse create(PhongRequest request) {
        var ownerId = currentAccount.getChuTro().getId();
        // Cùng khóa nhà trọ với thao tác xóa cha để không tạo phòng vào nhà đã bị xóa.
        var house = nhaTroRepository.findOwnedForUpdate(request.nhaTroId(), ownerId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhà trọ"));
        entityManager.refresh(house, LockModeType.PESSIMISTIC_WRITE);
        var number = request.soPhong().trim();
        if (phongRepository.existsByNhaTro_IdAndSoPhong(house.getId(), number))
            throw new BusinessException("Số phòng đã tồn tại trong nhà trọ");
        return toResponse(phongRepository.saveAndFlush(Phong.builder().nhaTro(house)
            .soPhong(number).dienTich(request.dienTich()).giaThue(request.giaThue())
            .trangThai(TrangThaiPhong.TRONG).build()));
    }

    @Transactional(readOnly = true)
    public PhongResponse getById(Integer id) {
        return toResponse(phongRepository.findByIdAndNhaTro_ChuTro_Id(id,
            currentAccount.getChuTro().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng")));
    }

    @Transactional(readOnly = true)
    public List<PhongResponse> getAll() {
        return phongRepository.findAll(OwnerSpecifications.phong(
            currentAccount.getChuTro().getId(), null, null, null), Sort.by("id"))
            .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PhongResponse> getByTrangThai(TrangThaiPhong status) {
        return phongRepository.findAll(OwnerSpecifications.phong(
            currentAccount.getChuTro().getId(), null, null, status), Sort.by("id"))
            .stream().map(this::toResponse).toList();
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PhongResponse update(Integer id, PhongRequest request) {
        var entity = ownedForUpdate(id);
        // Chuyển nhà trọ cần nghiệp vụ riêng khi đã có lịch sử hợp đồng.
        if (!entity.getNhaTro().getId().equals(request.nhaTroId()))
            throw new BusinessException("Không thể chuyển phòng sang nhà trọ khác");
        var number = request.soPhong().trim();
        if (phongRepository.existsByNhaTro_IdAndSoPhongAndIdNot(
                entity.getNhaTro().getId(), number, id))
            throw new BusinessException("Số phòng đã tồn tại trong nhà trọ");
        entity.setSoPhong(number);
        entity.setDienTich(request.dienTich());
        entity.setGiaThue(request.giaThue());
        phongRepository.flush();
        return toResponse(entity);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void delete(Integer id) {
        var entity = ownedForUpdate(id);
        if (hopDongRepository.existsByPhong_Id(id))
            throw new BusinessException("Không thể xóa phòng đã phát sinh hợp đồng");
        phongRepository.delete(entity);
        phongRepository.flush();
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PhongResponse updateTrangThai(Integer id, TrangThaiPhongRequest request) {
        var entity = ownedForUpdate(id);
        if (request.trangThai() == null)
            throw new BusinessException("Trạng thái phòng không được để trống");
        if (request.trangThai() == TrangThaiPhong.DANG_THUE)
            throw new BusinessException("Trạng thái đang thuê được quản lý qua hợp đồng");
        if (entity.getTrangThai() == TrangThaiPhong.DANG_THUE
                || hopDongRepository.existsByPhong_IdAndTrangThai(id, TrangThaiHopDong.DANG_HIEU_LUC))
            throw new BusinessException("Phòng đang thuê; cần xử lý hợp đồng trước");
        entity.setTrangThai(request.trangThai());
        return toResponse(entity);
    }

    @Transactional(readOnly = true)
    public PageResponse<PhongResponse> getPage(int page, int size, String keyword,
            TrangThaiPhong trangThai, String sortBy, String direction, Integer nhaTroId) {
        var pageable = PageSupport.pageable(page, size, sortBy, direction,
            Set.of("id", "soPhong", "dienTich", "giaThue", "trangThai"));
        var ownerId = currentAccount.getChuTro().getId();
        if (nhaTroId != null && nhaTroRepository.findByIdAndChuTro_Id(nhaTroId, ownerId).isEmpty())
            throw new ResourceNotFoundException("Không tìm thấy nhà trọ");
        return PageSupport.response(phongRepository.findAll(
            OwnerSpecifications.phong(ownerId, nhaTroId, keyword, trangThai), pageable), this::toResponse);
    }

    private Phong ownedForUpdate(Integer id) {
        var entity = phongRepository.findOwnedForUpdate(id, currentAccount.getChuTro().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng"));
        entityManager.refresh(entity, LockModeType.PESSIMISTIC_WRITE);
        return entity;
    }

    private PhongResponse toResponse(Phong entity) {
        return new PhongResponse(entity.getId(), entity.getSoPhong(), entity.getDienTich(),
            entity.getGiaThue(), entity.getTrangThai(), entity.getNhaTro().getId(),
            entity.getNhaTro().getTenNhaTro());
    }
}
