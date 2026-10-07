package com.project.QLPT.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.project.QLPT.dto.request.ChiTietHoaDonRequest;
import com.project.QLPT.dto.response.ChiTietHoaDonResponse;
import com.project.QLPT.entity.ChiTietHoaDon;
import com.project.QLPT.entity.DichVu;
import com.project.QLPT.entity.HoaDon;
import com.project.QLPT.enums.TrangThaiHoaDon;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.exception.ResourceNotFoundException;
import com.project.QLPT.repository.ChiTietHoaDonRepository;
import com.project.QLPT.repository.DichVuRepository;
import com.project.QLPT.repository.HoaDonRepository;
import com.project.QLPT.repository.ThanhToanRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;

import lombok.RequiredArgsConstructor;

/**
 * Xử lý nghiệp vụ dòng dịch vụ của hóa đơn.
 *
 * <p>
 * Các thao tác thêm, sửa và xóa đều khóa hóa đơn trước khi kiểm tra
 * điều kiện nghiệp vụ. Không cho phép chỉnh sửa khi hóa đơn đã có
 * khoản thanh toán hoặc không còn ở trạng thái chưa thanh toán.
 * </p>
 *
 * <p>
 * Đơn giá được chốt từ dịch vụ khi tạo dòng chi tiết và được giữ nguyên
 * khi cập nhật chỉ số hoặc số lượng.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class ChiTietHoaDonService {

    private final ChiTietHoaDonRepository chiTietHoaDonRepository;
    private final HoaDonRepository hoaDonRepository;
    private final DichVuRepository dichVuRepository;
    private final ThanhToanRepository thanhToanRepository;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Thêm một dòng dịch vụ vào hóa đơn.
     *
     * <p>
     * Dịch vụ phải đang hoạt động và chưa xuất hiện trong hóa đơn.
     * Đơn giá được lấy từ dữ liệu dịch vụ trên server. Nếu request
     * gửi đơn giá, giá đó phải bằng đơn giá hiện tại.
     * </p>
     *
     * @param hoaDonId mã hóa đơn
     * @param request thông tin dòng dịch vụ
     * @return dòng chi tiết sau khi lưu
     * @throws ResourceNotFoundException nếu không tìm thấy hóa đơn hoặc dịch vụ
     * @throws BusinessException nếu hóa đơn không cho phép chỉnh sửa,
     *                           dịch vụ không hợp lệ hoặc dữ liệu không hợp lệ
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ChiTietHoaDonResponse create(
        Integer hoaDonId,
        ChiTietHoaDonRequest request) {

        HoaDon hoaDon = findHoaDonForUpdate(hoaDonId);

        validateChuaThanhToan(hoaDon);

        DichVu dichVu = findDichVu(request.dichVuId());

        if (!Boolean.TRUE.equals(dichVu.getDangHoatDong())) {
            throw new BusinessException(
                "Dịch vụ đã ngừng hoạt động");
        }

        if (chiTietHoaDonRepository.existsByHoaDon_IdAndDichVu_Id(
            hoaDonId,
            dichVu.getId())) {
            throw new BusinessException(
                "Dịch vụ đã có trong hóa đơn này");
        }

        BigDecimal soLuong = tinhSoLuong(dichVu, request);
        BigDecimal donGia = dichVu.getDonGiaHienTai();

        if (request.donGia() != null
            && request.donGia().compareTo(donGia) != 0) {
            throw new BusinessException(
                "Đơn giá phải bằng đơn giá hiện tại của dịch vụ");
        }

        ChiTietHoaDon entity = ChiTietHoaDon.builder()
            .hoaDon(hoaDon)
            .dichVu(dichVu)
            .chiSoCu(request.chiSoCu())
            .chiSoMoi(request.chiSoMoi())
            .soLuong(soLuong)
            .donGia(donGia)
            .build();

        return toResponse(chiTietHoaDonRepository.save(entity));
    }

    /**
     * Lấy danh sách dòng dịch vụ của một hóa đơn.
     *
     * @param hoaDonId mã hóa đơn
     * @return danh sách dòng chi tiết
     * @throws ResourceNotFoundException nếu không tìm thấy hóa đơn
     */
    @Transactional(readOnly = true)
    public List<ChiTietHoaDonResponse> getByHoaDon(Integer hoaDonId) {

        findHoaDon(hoaDonId);

        return chiTietHoaDonRepository.findByHoaDon_Id(hoaDonId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    /**
     * Cập nhật chỉ số hoặc số lượng của một dòng dịch vụ.
     *
     * <p>
     * Không cho phép đổi dịch vụ hoặc đơn giá đã chốt.
     * Request có thể bỏ đơn giá hoặc gửi đúng đơn giá cũ.
     * </p>
     *
     * @param hoaDonId mã hóa đơn chứa dòng chi tiết
     * @param chiTietId mã dòng chi tiết
     * @param request thông tin cập nhật
     * @return dòng chi tiết sau khi cập nhật
     * @throws ResourceNotFoundException nếu không tìm thấy hóa đơn
     *                                  hoặc dòng chi tiết thuộc hóa đơn
     * @throws BusinessException nếu hóa đơn không cho phép chỉnh sửa,
     *                           thay đổi dịch vụ/đơn giá hoặc dữ liệu không hợp lệ
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ChiTietHoaDonResponse update(
        Integer hoaDonId,
        Integer chiTietId,
        ChiTietHoaDonRequest request) {

        HoaDon hoaDon = findHoaDonForUpdate(hoaDonId);

        validateChuaThanhToan(hoaDon);

        ChiTietHoaDon entity = findChiTiet(hoaDonId, chiTietId);

        if (!entity.getDichVu().getId().equals(request.dichVuId())) {
            throw new BusinessException(
                "Không thể chuyển dòng chi tiết sang dịch vụ khác; "
                    + "vui lòng xóa dòng cũ và thêm dịch vụ mới");
        }

        if (request.donGia() != null
            && request.donGia().compareTo(entity.getDonGia()) != 0) {
            throw new BusinessException(
                "Không được thay đổi đơn giá đã chốt của dòng hóa đơn");
        }

        BigDecimal soLuong = tinhSoLuong(entity.getDichVu(), request);

        entity.setChiSoCu(request.chiSoCu());
        entity.setChiSoMoi(request.chiSoMoi());
        entity.setSoLuong(soLuong);

        // Giữ nguyên entity.donGia để bảo toàn giá lịch sử.
        return toResponse(entity);
    }

    /**
     * Xóa một dòng dịch vụ khỏi hóa đơn chưa có khoản thanh toán.
     *
     * @param hoaDonId mã hóa đơn
     * @param chiTietId mã dòng chi tiết
     * @throws ResourceNotFoundException nếu không tìm thấy hóa đơn
     *                                  hoặc dòng chi tiết thuộc hóa đơn
     * @throws BusinessException nếu hóa đơn không cho phép chỉnh sửa
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void delete(Integer hoaDonId, Integer chiTietId) {

        HoaDon hoaDon = findHoaDonForUpdate(hoaDonId);

        validateChuaThanhToan(hoaDon);

        ChiTietHoaDon entity = findChiTiet(hoaDonId, chiTietId);

        chiTietHoaDonRepository.delete(entity);
    }

    /**
     * Kiểm tra hóa đơn chưa có khoản thu và còn cho phép chỉnh sửa.
     */
    private void validateChuaThanhToan(HoaDon hoaDon) {

        boolean daCoKhoanThu =
            thanhToanRepository.existsByHoaDon_Id(hoaDon.getId());

        if (daCoKhoanThu
            || hoaDon.getTrangThai() != TrangThaiHoaDon.CHUA_THANH_TOAN) {
            throw new BusinessException(
                "Chỉ được thêm, sửa hoặc xóa chi tiết "
                    + "của hóa đơn chưa thanh toán và chưa có khoản thu");
        }
    }

    /**
     * Tính số lượng theo cách tính của dịch vụ.
     */
    private BigDecimal tinhSoLuong(
        DichVu dichVu,
        ChiTietHoaDonRequest request) {

        if (Boolean.TRUE.equals(dichVu.getTinhTheoChiSo())) {
            return tinhSoLuongTheoChiSo(request);
        }

        return tinhSoLuongTheoSoLuong(request);
    }

    /**
     * Tính số lượng bằng chỉ số mới trừ chỉ số cũ.
     *
     * @param request dữ liệu chỉ số
     * @return số lượng sử dụng, có thể bằng 0
     * @throws BusinessException nếu thiếu chỉ số, chỉ số âm
     *                           hoặc chỉ số mới nhỏ hơn chỉ số cũ
     */
    private BigDecimal tinhSoLuongTheoChiSo(
        ChiTietHoaDonRequest request) {

        BigDecimal chiSoCu = request.chiSoCu();
        BigDecimal chiSoMoi = request.chiSoMoi();

        if (chiSoCu == null || chiSoMoi == null) {
            throw new BusinessException(
                "Dịch vụ tính theo chỉ số cần có chỉ số cũ và chỉ số mới");
        }

        if (chiSoCu.signum() < 0 || chiSoMoi.signum() < 0) {
            throw new BusinessException(
                "Chỉ số cũ và chỉ số mới không được âm");
        }

        if (chiSoMoi.compareTo(chiSoCu) < 0) {
            throw new BusinessException(
                "Chỉ số mới không được nhỏ hơn chỉ số cũ");
        }

        return chiSoMoi.subtract(chiSoCu);
    }

    /**
     * Lấy số lượng nhập tay cho dịch vụ không tính theo chỉ số.
     *
     * @param request dữ liệu số lượng
     * @return số lượng lớn hơn 0
     * @throws BusinessException nếu gửi kèm chỉ số
     *                           hoặc số lượng không lớn hơn 0
     */
    private BigDecimal tinhSoLuongTheoSoLuong(
        ChiTietHoaDonRequest request) {

        if (request.chiSoCu() != null || request.chiSoMoi() != null) {
            throw new BusinessException(
                "Dịch vụ này không tính theo chỉ số");
        }

        if (request.soLuong() == null
            || request.soLuong().signum() <= 0) {
            throw new BusinessException(
                "Số lượng phải lớn hơn 0");
        }

        return request.soLuong();
    }

    /**
     * Tìm hóa đơn phục vụ thao tác đọc.
     */
    private HoaDon findHoaDon(Integer id) {

        return hoaDonRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Không tìm thấy hóa đơn id = " + id));
    }

    /**
     * Tìm và khóa ghi hóa đơn phục vụ thao tác thay đổi dữ liệu.
     *
     * <p>
     * Phải gọi trong transaction và trước khi thay đổi Entity.
     * Khóa được giữ đến khi transaction commit hoặc rollback.
     * </p>
     */
    private HoaDon findHoaDonForUpdate(Integer id) {

        HoaDon entity = entityManager.find(
            HoaDon.class,
            id,
            LockModeType.PESSIMISTIC_WRITE);

        if (entity == null) {
            throw new ResourceNotFoundException(
                "Không tìm thấy hóa đơn id = " + id);
        }

        // Đọc lại trạng thái mới nhất sau khi lấy khóa.
        entityManager.refresh(entity, LockModeType.PESSIMISTIC_WRITE);

        return entity;
    }

    /**
     * Tìm dịch vụ theo ID.
     */
    private DichVu findDichVu(Integer id) {

        return dichVuRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Không tìm thấy dịch vụ id = " + id));
    }

    /**
     * Tìm dòng chi tiết và kiểm tra dòng thuộc đúng hóa đơn.
     */
    private ChiTietHoaDon findChiTiet(
        Integer hoaDonId,
        Integer chiTietId) {

        ChiTietHoaDon entity = chiTietHoaDonRepository.findById(chiTietId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Không tìm thấy dòng chi tiết hóa đơn id = "
                    + chiTietId));

        if (!entity.getHoaDon().getId().equals(hoaDonId)) {
            throw new ResourceNotFoundException(
                "Dòng chi tiết id = " + chiTietId
                    + " không thuộc hóa đơn id = " + hoaDonId);
        }

        return entity;
    }

    /**
     * Chuyển Entity thành DTO; làm tròn thành tiền đến đồng.
     */
    private ChiTietHoaDonResponse toResponse(ChiTietHoaDon entity) {

        BigDecimal thanhTien = entity.getSoLuong()
            .multiply(entity.getDonGia())
            .setScale(0, RoundingMode.HALF_UP);

        return new ChiTietHoaDonResponse(
            entity.getId(),
            entity.getHoaDon().getId(),
            entity.getDichVu().getId(),
            entity.getDichVu().getTenDichVu(),
            entity.getDichVu().getDonViTinh(),
            entity.getChiSoCu(),
            entity.getChiSoMoi(),
            entity.getSoLuong(),
            entity.getDonGia(),
            thanhTien);
    }
}