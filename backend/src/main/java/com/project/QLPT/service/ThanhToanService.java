package com.project.QLPT.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.project.QLPT.dto.request.ThanhToanRequest;
import com.project.QLPT.dto.response.ThanhToanResponse;
import com.project.QLPT.entity.HoaDon;
import com.project.QLPT.entity.ThanhToan;
import com.project.QLPT.enums.TrangThaiHoaDon;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.exception.ResourceNotFoundException;
import com.project.QLPT.repository.ChiTietHoaDonRepository;
import com.project.QLPT.repository.HoaDonRepository;
import com.project.QLPT.repository.ThanhToanRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;

@Service
public class ThanhToanService {

    private final ThanhToanRepository thanhToanRepository;
    private final HoaDonRepository hoaDonRepository;
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public ThanhToanService(ThanhToanRepository thanhToanRepository,
            HoaDonRepository hoaDonRepository,
            ChiTietHoaDonRepository chiTietHoaDonRepository) {
        this.thanhToanRepository = thanhToanRepository;
        this.hoaDonRepository = hoaDonRepository;
        this.chiTietHoaDonRepository = chiTietHoaDonRepository;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ThanhToanResponse create(ThanhToanRequest request) {
        validateRequest(request);
        // Khóa hóa đơn để các yêu cầu thanh toán cùng hóa đơn xử lý lần lượt.
        HoaDon hoaDon = findHoaDonForUpdate(request.hoaDonId());
        BigDecimal tongTien = tinhTongTien(hoaDon);
        BigDecimal daThanhToan = tinhDaThanhToan(hoaDon.getId());

        if (daThanhToan.compareTo(tongTien) >= 0) {
            throw new BusinessException("Hóa đơn đã được thanh toán đầy đủ");
        }
        validateKhongVuotTongTien(daThanhToan.add(request.soTien()), tongTien);

        ThanhToan entity = ThanhToan.builder()
                .hoaDon(hoaDon)
                .ngayThanhToan(request.ngayThanhToan() != null
                        ? request.ngayThanhToan() : LocalDateTime.now())
                .soTien(request.soTien())
                .phuongThuc(request.phuongThuc())
                .maGiaoDich(trimToNull(request.maGiaoDich()))
                .build();

        ThanhToan saved = thanhToanRepository.save(entity);
        capNhatTrangThai(hoaDon, daThanhToan.add(request.soTien()), tongTien);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ThanhToanResponse getById(Integer id) {
        return toResponse(findEntity(id));
    }

    @Transactional(readOnly = true)
    public List<ThanhToanResponse> getAll() {
        return thanhToanRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ThanhToanResponse> getByHoaDon(Integer hoaDonId) {
        findHoaDon(hoaDonId);
        return thanhToanRepository.findByHoaDon_IdOrderByNgayThanhToanDescIdDesc(hoaDonId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ThanhToanResponse update(Integer id, ThanhToanRequest request) {

        validateRequest(request);

        // Đọc để xác định hóa đơn; chưa khóa khoản thu.
        Integer hoaDonId = findEntity(id).getHoaDon().getId();

        if (!hoaDonId.equals(request.hoaDonId())) {
            throw new BusinessException(
                "Không thể chuyển thanh toán sang hóa đơn khác");
        }

        HoaDon hoaDon = findHoaDonForUpdate(hoaDonId);
        ThanhToan entity = findThanhToanForUpdate(id);
        BigDecimal tongTien = tinhTongTien(hoaDon);
        // Trừ khoản cũ trước khi kiểm tra khoản mới để không cộng trùng.
        BigDecimal tongSauSua = tinhDaThanhToan(hoaDon.getId())
                .subtract(entity.getSoTien()).add(request.soTien());
        validateKhongVuotTongTien(tongSauSua, tongTien);

        entity.setSoTien(request.soTien());
        entity.setPhuongThuc(request.phuongThuc());
        entity.setMaGiaoDich(trimToNull(request.maGiaoDich()));
        // Khi sửa, bỏ ngày nghĩa là giữ nguyên ngày thanh toán cũ.
        if (request.ngayThanhToan() != null) {
            entity.setNgayThanhToan(request.ngayThanhToan());
        }
        capNhatTrangThai(hoaDon, tongSauSua, tongTien);
        return toResponse(entity);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void delete(Integer id) {

        Integer hoaDonId = findEntity(id).getHoaDon().getId();

        HoaDon hoaDon = findHoaDonForUpdate(hoaDonId);
        ThanhToan entity = findThanhToanForUpdate(id);

        BigDecimal tongSauXoa = tinhDaThanhToan(hoaDonId)
            .subtract(entity.getSoTien());

        BigDecimal tongTien = tinhTongTien(hoaDon);

        thanhToanRepository.delete(entity);
        capNhatTrangThai(hoaDon, tongSauXoa, tongTien);
    }

    private void validateRequest(ThanhToanRequest request) {
        if (request.hoaDonId() == null || request.hoaDonId() <= 0) {
            throw new BusinessException("Mã hóa đơn phải lớn hơn 0");
        }
        if (request.soTien() == null || request.soTien().signum() <= 0) {
            throw new BusinessException("Số tiền phải lớn hơn 0");
        }
        BigDecimal amount = request.soTien().stripTrailingZeros();
        if (amount.scale() > 0 || amount.precision() - amount.scale() > 19) {
            throw new BusinessException("Số tiền phải là số nguyên, tối đa 19 chữ số");
        }
        if (request.phuongThuc() == null) {
            throw new BusinessException("Phương thức thanh toán không được để trống");
        }
        if (request.ngayThanhToan() != null && request.ngayThanhToan().isAfter(LocalDateTime.now())) {
            throw new BusinessException("Ngày thanh toán không được nằm trong tương lai");
        }
    }

    private BigDecimal tinhTongTien(HoaDon hoaDon) {
        BigDecimal tienDichVu = chiTietHoaDonRepository.findByHoaDon_Id(hoaDon.getId())
                .stream()
                .map(ct -> ct.getSoLuong().multiply(ct.getDonGia()).setScale(0, RoundingMode.HALF_UP))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return hoaDon.getTienPhong().add(tienDichVu);
    }

    private BigDecimal tinhDaThanhToan(Integer hoaDonId) {
        BigDecimal result = thanhToanRepository.sumSoTienByHoaDonId(hoaDonId);
        return result == null ? BigDecimal.ZERO : result;
    }

    private void validateKhongVuotTongTien(BigDecimal tongThanhToan, BigDecimal tongTien) {
        if (tongThanhToan.compareTo(tongTien) > 0) {
            throw new BusinessException("Tổng số tiền thanh toán không được vượt tổng tiền hóa đơn");
        }
    }

    private void capNhatTrangThai(HoaDon hoaDon, BigDecimal daThanhToan, BigDecimal tongTien) {
        if (daThanhToan.compareTo(tongTien) >= 0) {
            hoaDon.setTrangThai(TrangThaiHoaDon.DA_THANH_TOAN);
        } else if (daThanhToan.signum() > 0) {
            hoaDon.setTrangThai(TrangThaiHoaDon.THANH_TOAN_MOT_PHAN);
        } else {
            hoaDon.setTrangThai(TrangThaiHoaDon.CHUA_THANH_TOAN);
        }
    }

    private ThanhToan findEntity(Integer id) {
        return thanhToanRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy thanh toán id = " + id));
    }

    private HoaDon findHoaDon(Integer id) {
        return hoaDonRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy hóa đơn id = " + id));
    }

    private HoaDon findHoaDonForUpdate(Integer id) {
        HoaDon entity = entityManager.find(HoaDon.class, id, LockModeType.PESSIMISTIC_WRITE);
        if (entity == null) {
            throw new ResourceNotFoundException("Không tìm thấy hóa đơn id = " + id);
        }
        // Có thể hóa đơn đã được nạp qua quan hệ trước khi lấy khóa.
        entityManager.refresh(entity, LockModeType.PESSIMISTIC_WRITE);
        return entity;
    }

    private ThanhToan findThanhToanForUpdate(Integer id) {

        ThanhToan entity = entityManager.find(
            ThanhToan.class,
            id,
            LockModeType.PESSIMISTIC_WRITE);

        if (entity == null) {
            throw new ResourceNotFoundException(
                "Không tìm thấy thanh toán id = " + id);
        }

        // Entity có thể đã được đọc trước khi chờ khóa hóa đơn.
        entityManager.refresh(entity, LockModeType.PESSIMISTIC_WRITE);

        return entity;
    }

    private ThanhToanResponse toResponse(ThanhToan entity) {
        return new ThanhToanResponse(entity.getId(), entity.getHoaDon().getId(),
                entity.getNgayThanhToan(), entity.getSoTien(), entity.getPhuongThuc(), entity.getMaGiaoDich());
    }

    private String trimToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }
}
