package com.project.QLPT.service;

import java.util.List;

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

@Service
@RequiredArgsConstructor
public class NguoiThueService {

    private final NguoiThueRepository nguoiThueRepository;
    private final ThanhVienHopDongRepository thanhVienHopDongRepository;

    @Transactional
    public NguoiThueResponse create(NguoiThueRequest request) {

        String cccd = request.cccd().trim();

        if (nguoiThueRepository.existsByCccd(cccd)) {
            throw new BusinessException("CCCD đã tồn tại");
        }

        NguoiThue entity = NguoiThue.builder()
                .hoTen(request.hoTen().trim())
                .cccd(cccd)
                .soDienThoai(trimToNull(request.soDienThoai()))
                .ngaySinh(request.ngaySinh())
                .diaChiThuongTru(trimToNull(request.diaChiThuongTru()))
                .build();

        return toResponse(
                nguoiThueRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public NguoiThueResponse getById(Integer id) {

        return toResponse(findEntity(id));
    }

    @Transactional(readOnly = true)
    public List<NguoiThueResponse> getAll() {

        return nguoiThueRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public NguoiThueResponse update(
            Integer id,
            NguoiThueRequest request) {

        NguoiThue entity = findEntity(id);

        String cccd = request.cccd().trim();

        if (nguoiThueRepository.existsByCccdAndIdNot(cccd, id)) {
            throw new BusinessException("CCCD đã tồn tại");
        }

        entity.setHoTen(request.hoTen().trim());
        entity.setCccd(cccd);
        entity.setSoDienThoai(trimToNull(request.soDienThoai()));
        entity.setNgaySinh(request.ngaySinh());
        entity.setDiaChiThuongTru(
                trimToNull(request.diaChiThuongTru()));

        return toResponse(entity);
    }

    @Transactional(readOnly = true)
    public List<NguoiThueResponse> searchByName(String keyword) {

        return nguoiThueRepository
                .findByHoTenContainingIgnoreCase(keyword.trim())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void delete(Integer id) {

        NguoiThue entity = findEntity(id);

        if (thanhVienHopDongRepository
                .existsByNguoiThue_Id(id)) {

            throw new BusinessException(
                    "Không thể xóa người thuê đã tham gia hợp đồng");
        }

        nguoiThueRepository.delete(entity);
    }

    private NguoiThue findEntity(Integer id) {

        return nguoiThueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy người thuê id = " + id));
    }

    private NguoiThueResponse toResponse(NguoiThue entity) {

        return new NguoiThueResponse(
                entity.getId(),
                entity.getHoTen(),
                entity.getCccd(),
                entity.getSoDienThoai(),
                entity.getNgaySinh(),
                entity.getDiaChiThuongTru());
    }

    private String trimToNull(String value) {

        if (value == null) {
            return null;
        }

        String result = value.trim();

        return result.isEmpty() ? null : result;
    }
}