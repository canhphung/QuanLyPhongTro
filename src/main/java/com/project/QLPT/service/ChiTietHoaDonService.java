package com.project.QLPT.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Service;
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

import lombok.RequiredArgsConstructor;

/**
 * Service xử lý các nghiệp vụ liên quan đến chi tiết hóa đơn (dòng dịch vụ).
 *
 * <p>
 * Mỗi dòng chi tiết gắn một dịch vụ với một hóa đơn. Tùy theo dịch vụ tính
 * theo chỉ số hay theo số lượng mà hệ thống tự tính ra {@code soLuong}.
 * Chỉ hóa đơn ở trạng thái chưa thanh toán mới được thêm, sửa hoặc xóa dòng
 * chi tiết. Một dịch vụ chỉ xuất hiện tối đa một lần trong một hóa đơn.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class ChiTietHoaDonService {

    private final ChiTietHoaDonRepository chiTietHoaDonRepository;
    private final HoaDonRepository hoaDonRepository;
    private final DichVuRepository dichVuRepository;

    /**
     * Thêm một dòng chi tiết dịch vụ vào hóa đơn.
     *
     * <p>
     * Hóa đơn phải tồn tại và chưa thanh toán. Dịch vụ phải tồn tại, còn
     * hoạt động và chưa xuất hiện trong hóa đơn này. Số lượng được tính
     * theo cấu hình trước của dịch vụ; đơn giá được lấy từ yêu cầu hoặc
     * mặc định bằng đơn giá hiện tại của dịch vụ.
     * </p>
     *
     * @param hoaDonId mã hóa đơn cần thêm dòng chi tiết
     * @param request  thông tin dòng chi tiết cần thêm
     * @return thông tin dòng chi tiết sau khi được lưu
     * @throws ResourceNotFoundException nếu không tìm thấy hóa đơn hoặc dịch
     *                                   vụ
     * @throws BusinessException         nếu hóa đơn đã thanh toán, dịch vụ
     *                                   ngừng hoạt động, trùng dịch vụ hoặc
     *                                   dữ liệu chỉ số/ số lượng không hợp
     *                                   lệ
     */
    @Transactional
    public ChiTietHoaDonResponse create(
            Integer hoaDonId,
            ChiTietHoaDonRequest request) {

        HoaDon hoaDon = findHoaDon(hoaDonId);

        validateChuaThanhToan(hoaDon);

        DichVu dichVu = findDichVu(request.dichVuId());

        if (!Boolean.TRUE.equals(dichVu.getDangHoatDong())) {
            throw new BusinessException("Dịch vụ đã ngừng hoạt động");
        }

        if (chiTietHoaDonRepository
                .existsByHoaDon_IdAndDichVu_Id(
                        hoaDonId,
                        dichVu.getId())) {
            throw new BusinessException(
                    "Dịch vụ đã có trong hóa đơn này");
        }

        BigDecimal soLuong = tinhSoLuong(dichVu, request);
        BigDecimal donGia = request.donGia() != null
                ? request.donGia()
                : dichVu.getDonGiaHienTai();

        ChiTietHoaDon entity = ChiTietHoaDon.builder()
                .hoaDon(hoaDon)
                .dichVu(dichVu)
                .chiSoCu(request.chiSoCu())
                .chiSoMoi(request.chiSoMoi())
                .soLuong(soLuong)
                .donGia(donGia)
                .build();

        return toResponse(
                chiTietHoaDonRepository.save(entity));
    }

    /**
     * Lấy danh sách dòng chi tiết của một hóa đơn.
     *
     * @param hoaDonId mã hóa đơn cần lấy chi tiết
     * @return danh sách dòng chi tiết của hóa đơn
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
     * Cập nhật một dòng chi tiết trong hóa đơn.
     *
     * <p>
     * Không cho phép chuyển dòng chi tiết sang hóa đơn khác cũng như đổi
     * sang dịch vụ đã có sẵn trong hóa đơn.
     * </p>
     *
     * @param hoaDonId  mã hóa đơn chứa dòng chi tiết
     * @param chiTietId mã dòng chi tiết cần cập nhật
     * @param request   thông tin mới của dòng chi tiết
     * @return thông tin dòng chi tiết sau khi cập nhật
     * @throws ResourceNotFoundException nếu không tìm thấy hóa đơn, dịch vụ
     *                                   hoặc dòng chi tiết
     * @throws BusinessException         nếu hóa đơn đã thanh toán hoặc dữ
     *                                   liệu chỉ số/ số lượng không hợp lệ
     */
    @Transactional
    public ChiTietHoaDonResponse update(
            Integer hoaDonId,
            Integer chiTietId,
            ChiTietHoaDonRequest request) {

        HoaDon hoaDon = findHoaDon(hoaDonId);

        validateChuaThanhToan(hoaDon);

        ChiTietHoaDon entity = findChiTiet(hoaDonId, chiTietId);

        if (!entity.getDichVu().getId().equals(request.dichVuId())) {
            throw new BusinessException(
                    "Không thể chuyển dòng chi tiết sang dịch vụ khác; "
                            + "vui lòng xóa dòng cũ và thêm dịch vụ mới");
        }

        DichVu dichVu = entity.getDichVu();

        if (chiTietHoaDonRepository
                .existsByHoaDon_IdAndDichVu_Id(
                        hoaDonId,
                        dichVu.getId())
                && !entity.getId().equals(chiTietId)) {
            throw new BusinessException(
                    "Dịch vụ đã có trong hóa đơn này");
        }

        entity.setChiSoCu(request.chiSoCu());
        entity.setChiSoMoi(request.chiSoMoi());
        entity.setSoLuong(tinhSoLuong(dichVu, request));
        entity.setDonGia(request.donGia() != null
                ? request.donGia()
                : dichVu.getDonGiaHienTai());

        return toResponse(entity);
    }

    /**
     * Xóa một dòng chi tiết khỏi hóa đơn.
     *
     * @param hoaDonId  mã hóa đơn chứa dòng chi tiết
     * @param chiTietId mã dòng chi tiết cần xóa
     * @throws ResourceNotFoundException nếu không tìm thấy hóa đơn hoặc dòng
     *                                   chi tiết
     * @throws BusinessException         nếu hóa đơn đã thanh toán
     */
    @Transactional
    public void delete(Integer hoaDonId, Integer chiTietId) {

        HoaDon hoaDon = findHoaDon(hoaDonId);

        validateChuaThanhToan(hoaDon);

        chiTietHoaDonRepository.delete(
                findChiTiet(hoaDonId, chiTietId));
    }

    /**
     * Kiểm tra hóa đơn còn ở trạng thái chưa thanh toán.
     *
     * @param hoaDon hóa đơn cần kiểm tra
     * @throws BusinessException nếu hóa đơn đã bắt đầu thanh toán
     */
    private void validateChuaThanhToan(HoaDon hoaDon) {

        if (hoaDon.getTrangThai() != TrangThaiHoaDon.CHUA_THANH_TOAN) {
            throw new BusinessException(
                    "Chỉ chỉnh sửa hóa đơn chưa thanh toán");
        }
    }

    /**
     * Tính số lượng của dòng chi tiết dựa trên cấu hình dịch vụ.
     *
     * <ul>
     * <li>Dịch vụ tính theo chỉ số: bắt buộc có chỉ số cũ và chỉ số mới,
     * {@code soLuong = chiSoMoi - chiSoCu}.</li>
     * <li>Dịch vụ tính theo số lượng: chỉ số phải để trống và {@code soLuong}
     * phải lớn hơn 0.</li>
     * </ul>
     *
     * @param dichVu  dịch vụ của dòng chi tiết
     * @param request dữ liệu yêu cầu của dòng chi tiết
     * @return số lượng đã tính
     * @throws BusinessException nếu dữ liệu chỉ số/ số lượng không hợp lệ
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
     * Tính số lượng cho dịch vụ tính theo chỉ số công tơ.
     *
     * @param request dữ liệu yêu cầu của dòng chi tiết
     * @return số lượng {@code = chiSoMoi - chiSoCu}
     * @throws BusinessException nếu thiếu chỉ số hoặc chỉ số mới nhỏ hơn
     *                           chỉ số cũ
     */
    private BigDecimal tinhSoLuongTheoChiSo(ChiTietHoaDonRequest request) {

        if (request.chiSoCu() == null || request.chiSoMoi() == null) {
            throw new BusinessException(
                    "Dịch vụ tính theo chỉ số cần có chỉ số cũ và chỉ số mới");
        }

        if (request.chiSoMoi().compareTo(request.chiSoCu()) < 0) {
            throw new BusinessException(
                    "Chỉ số mới không được nhỏ hơn chỉ số cũ");
        }

        return request.chiSoMoi().subtract(request.chiSoCu());
    }

    /**
     * Tính số lượng cho dịch vụ tính theo số lượng nhập tay.
     *
     * @param request dữ liệu yêu cầu của dòng chi tiết
     * @return số lượng người dùng nhập
     * @throws BusinessException nếu gửi kèm chỉ số hoặc số lượng không lớn
     *                           hơn 0
     */
    private BigDecimal tinhSoLuongTheoSoLuong(ChiTietHoaDonRequest request) {

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
     * Tìm entity hóa đơn theo ID.
     *
     * @param id ID của hóa đơn
     * @return entity hóa đơn tương ứng
     * @throws ResourceNotFoundException nếu không tìm thấy hóa đơn
     */
    private HoaDon findHoaDon(Integer id) {

        return hoaDonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy hóa đơn id = " + id));
    }

    /**
     * Tìm entity dịch vụ theo ID.
     *
     * @param id ID của dịch vụ
     * @return entity dịch vụ tương ứng
     * @throws ResourceNotFoundException nếu không tìm thấy dịch vụ
     */
    private DichVu findDichVu(Integer id) {

        return dichVuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy dịch vụ id = " + id));
    }

    /**
     * Tìm entity dòng chi tiết theo ID thuộc một hóa đơn.
     *
     * @param hoaDonId  mã hóa đơn chứa dòng chi tiết
     * @param chiTietId mã dòng chi tiết cần tìm
     * @return entity dòng chi tiết tương ứng
     * @throws ResourceNotFoundException nếu không tìm thấy dòng chi tiết
     */
    private ChiTietHoaDon findChiTiet(Integer hoaDonId, Integer chiTietId) {

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
     * Chuyển đổi entity {@link ChiTietHoaDon} sang DTO
     * {@link ChiTietHoaDonResponse}.
     *
     * @param entity entity dòng chi tiết cần chuyển đổi
     * @return DTO chứa thông tin dòng chi tiết
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