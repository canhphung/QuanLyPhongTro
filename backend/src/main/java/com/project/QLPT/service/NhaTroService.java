package com.project.QLPT.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.data.domain.*;
import com.project.QLPT.dto.request.NhaTroRequest;
import com.project.QLPT.dto.response.*;
import com.project.QLPT.entity.NhaTro;
import com.project.QLPT.repository.*;
import com.project.QLPT.exception.*;
import jakarta.persistence.*;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NhaTroService {
    private final NhaTroRepository repository;
    private final PhongRepository phongRepository;
    private final CurrentAccountService currentAccount;
    @PersistenceContext private EntityManager entityManager;

    @Transactional
    public NhaTroResponse create(NhaTroRequest request) {
        var owner = currentAccount.getChuTro();
        return response(repository.save(NhaTro.builder().chuTro(owner)
            .tenNhaTro(request.tenNhaTro().trim()).diaChi(request.diaChi().trim()).build()));
    }

    @Transactional(readOnly = true)
    public PageResponse<NhaTroResponse> getPage(int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw new BusinessException("page từ 0; size từ 1 đến 100");
        }
        var result = repository.findByChuTro_Id(currentAccount.getChuTro().getId(),
            PageRequest.of(page, size, Sort.by("id")));
        return new PageResponse<>(result.getContent().stream().map(this::response).toList(),
            result.getNumber(), result.getSize(), result.getTotalElements(),
            result.getTotalPages(), result.isFirst(), result.isLast());
    }

    @Transactional(readOnly = true)
    public NhaTroResponse getById(Integer id) {
        return response(repository.findByIdAndChuTro_Id(id, currentAccount.getChuTro().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhà trọ")));
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public NhaTroResponse update(Integer id, NhaTroRequest request) {
        var entity = ownedForUpdate(id);
        entity.setTenNhaTro(request.tenNhaTro().trim());
        entity.setDiaChi(request.diaChi().trim());
        return response(entity);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void delete(Integer id) {
        var entity = ownedForUpdate(id);
        if (phongRepository.existsByNhaTro_Id(id)) {
            throw new BusinessException("Không thể xóa nhà trọ đã có phòng");
        }
        repository.delete(entity);
    }

    private NhaTro ownedForUpdate(Integer id) {
        var entity = repository.findOwnedForUpdate(id, currentAccount.getChuTro().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhà trọ"));
        entityManager.refresh(entity, LockModeType.PESSIMISTIC_WRITE);
        return entity;
    }

    private NhaTroResponse response(NhaTro entity) {
        return new NhaTroResponse(entity.getId(), entity.getTenNhaTro(), entity.getDiaChi());
    }
}
