package com.project.QLPT.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.time.ZoneId;
import org.springframework.data.domain.Sort;
import lombok.RequiredArgsConstructor;
import com.project.QLPT.dto.response.PageResponse;
import com.project.QLPT.repository.specification.OwnerSpecifications;
import com.project.QLPT.service.support.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.project.QLPT.dto.request.ThanhToanRequest;
import com.project.QLPT.dto.response.ThanhToanResponse;
import com.project.QLPT.entity.HoaDon;
import com.project.QLPT.entity.ThanhToan;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.exception.ResourceNotFoundException;
import com.project.QLPT.repository.ChiTietHoaDonRepository;
import com.project.QLPT.repository.ThanhToanRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;

@Service
@RequiredArgsConstructor
public class ThanhToanService {

    private final ThanhToanRepository thanhToanRepository;
    private final OwnedInvoiceAccess invoices;
    private final CurrentAccountService currentAccount;
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;

    @PersistenceContext
    private EntityManager entityManager;

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
        BigDecimal tongSauThu = afterChange(daThanhToan, BigDecimal.ZERO, request.soTien(), tongTien);

        ThanhToan entity = ThanhToan.builder()
                .hoaDon(hoaDon)
                .ngayThanhToan(request.ngayThanhToan() != null
                        ? request.ngayThanhToan() : LocalDateTime.now(BUSINESS_ZONE))
                .soTien(request.soTien())
                .phuongThuc(request.phuongThuc())
                .maGiaoDich(trimToNull(request.maGiaoDich()))
                .build();

        ThanhToan saved = thanhToanRepository.saveAndFlush(entity);
        capNhatTrangThai(hoaDon, tongSauThu, tongTien);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ThanhToanResponse getById(Integer id) {
        return toResponse(findEntity(id));
    }

    @Transactional(readOnly = true)
    public List<ThanhToanResponse> getAll() {
        return thanhToanRepository.findAll(OwnerSpecifications.thanhToan(
            currentAccount.getChuTro().getId(), null), Sort.by(Sort.Direction.DESC, "ngayThanhToan")
            .and(Sort.by(Sort.Direction.DESC, "id"))).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ThanhToanResponse> getByHoaDon(Integer hoaDonId) {
        findHoaDon(hoaDonId);
        return thanhToanRepository.findAll(OwnerSpecifications.thanhToan(
                currentAccount.getChuTro().getId(), hoaDonId), Sort.by(Sort.Direction.DESC, "ngayThanhToan")
                .and(Sort.by(Sort.Direction.DESC, "id")))
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
        ThanhToan entity = findThanhToanForUpdate(id, hoaDonId);
        BigDecimal tongTien = tinhTongTien(hoaDon);
        // Trừ khoản cũ trước khi kiểm tra khoản mới để không cộng trùng.
        BigDecimal tongSauSua = afterChange(tinhDaThanhToan(hoaDon.getId()),
                entity.getSoTien(), request.soTien(), tongTien);

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
        ThanhToan entity = findThanhToanForUpdate(id, hoaDonId);

        BigDecimal tongTien = tinhTongTien(hoaDon);
        BigDecimal tongSauXoa = afterChange(tinhDaThanhToan(hoaDonId), entity.getSoTien(),
                BigDecimal.ZERO, tongTien);

        thanhToanRepository.delete(entity);
        thanhToanRepository.flush();
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
        if (request.ngayThanhToan() != null && request.ngayThanhToan().getYear() < 1000) {
            throw new BusinessException("Ngày thanh toán phải từ năm 1000 trở đi");
        }
        if (request.ngayThanhToan() != null && request.ngayThanhToan().isAfter(LocalDateTime.now(BUSINESS_ZONE))) {
            throw new BusinessException("Ngày thanh toán không được nằm trong tương lai");
        }
    }

    private BigDecimal tinhTongTien(HoaDon hoaDon) {
        var lines = chiTietHoaDonRepository.findByHoaDon_Id(hoaDon.getId());
        var ownerId = currentAccount.getChuTro().getId();
        if (lines.stream().anyMatch(line -> !line.getDichVu().getChuTro().getId().equals(ownerId)))
            throw new BusinessException("Hóa đơn có dịch vụ không cùng chủ; cần đối soát");
        return InvoiceAmounts.total(hoaDon.getTienPhong(), lines.stream()
            .map(line -> InvoiceAmounts.lineTotal(line.getSoLuong(), line.getDonGia())).toList());
    }

    private BigDecimal tinhDaThanhToan(Integer hoaDonId) {
        BigDecimal result = thanhToanRepository.sumSoTienByHoaDonId(hoaDonId);
        return result == null ? BigDecimal.ZERO : result;
    }

    private void capNhatTrangThai(HoaDon hoaDon, BigDecimal daThanhToan, BigDecimal tongTien) {
        hoaDon.setTrangThai(PaymentAmounts.status(daThanhToan, tongTien));
    }

    private ThanhToan findEntity(Integer id) {
        return thanhToanRepository.findByIdAndHoaDon_HopDong_Phong_NhaTro_ChuTro_Id(
                id, currentAccount.getChuTro().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thanh toán"));
    }

    private HoaDon findHoaDon(Integer id) { return invoices.get(id); }

    private HoaDon findHoaDonForUpdate(Integer id) { return invoices.lock(id); }

    private ThanhToan findThanhToanForUpdate(Integer id, Integer invoiceId) {
        var receipt = thanhToanRepository.findOwnedForUpdate(id, invoiceId,
                currentAccount.getChuTro().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thanh toán"));
        entityManager.refresh(receipt, LockModeType.PESSIMISTIC_WRITE);
        return receipt;
    }

    private ThanhToanResponse toResponse(ThanhToan entity) {
        return new ThanhToanResponse(entity.getId(), entity.getHoaDon().getId(),
                entity.getNgayThanhToan(), entity.getSoTien(), entity.getPhuongThuc(), entity.getMaGiaoDich(), entity.getHoaDon().getKyThanhToan(),
                entity.getHoaDon().getHopDong().getPhong().getSoPhong(),
                entity.getHoaDon().getHopDong().getPhong().getNhaTro().getTenNhaTro());
    }

    private String trimToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    private BigDecimal afterChange(BigDecimal collected, BigDecimal oldAmount,
            BigDecimal newAmount, BigDecimal total) {
        try { return PaymentAmounts.afterChange(collected, oldAmount, newAmount, total); }
        catch (IllegalArgumentException ex) { throw new BusinessException(ex.getMessage()); }
    }

    @Transactional(readOnly = true)
    public PageResponse<ThanhToanResponse> getPage(int page, int size, Integer hoaDonId) {
        var pageable = PageSupport.pageable(page, size, "id", "desc", Set.of("id"));
        if (hoaDonId != null) invoices.get(hoaDonId);
        return PageSupport.response(thanhToanRepository.findAll(
            OwnerSpecifications.thanhToan(currentAccount.getChuTro().getId(), hoaDonId),
            pageable), this::toResponse);
    }
}
