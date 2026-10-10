package com.project.QLPT.service;

import com.project.QLPT.repository.ThanhToanRepository;

import java.time.LocalDate;
import java.time.YearMonth;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;

import com.project.QLPT.dto.request.HoaDonRequest;
import com.project.QLPT.dto.response.ChiTietHoaDonResponse;
import com.project.QLPT.dto.response.HoaDonResponse;
import com.project.QLPT.entity.ChiTietHoaDon;
import com.project.QLPT.entity.HoaDon;
import com.project.QLPT.entity.HopDong;
import com.project.QLPT.enums.TrangThaiHoaDon;
import com.project.QLPT.enums.TrangThaiHopDong;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.exception.ResourceNotFoundException;
import com.project.QLPT.repository.ChiTietHoaDonRepository;
import com.project.QLPT.repository.HoaDonRepository;
import com.project.QLPT.repository.HopDongRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service xử lý các nghiệp vụ liên quan đến hóa đơn.
 *
 * <p>
 * Hóa đơn được sinh theo kỳ thanh toán, thuộc về một hợp đồng đang hiệu lực
 * và chỉ tồn tại tối đa một hóa đơn cho mỗi kỳ của cùng một hợp đồng.
 * Tổng tiền hóa đơn được tính bằng {@code tiền phòng + tổng thành tiền
 * của các dòng dịch vụ}. Một hóa đơn chỉ được chỉnh sửa hoặc xóa khi còn
 * ở trạng thái chưa thanh toán.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class HoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final HopDongRepository hopDongRepository;
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;
    private final ThanhToanRepository thanhToanRepository;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Tạo mới một hóa đơn cho một kỳ thanh toán.
     *
     * <p>
     * Hợp đồng phải tồn tại và đang hiệu lực. Chưa có hóa đơn nào cho cùng
     * kỳ thanh toán của hợp đồng này. Tiền phòng được lấy từ yêu cầu hoặc
     * mặc định bằng giá thuê thỏa thuận trong hợp đồng. Hóa đơn mới luôn
     * ở trạng thái chưa thanh toán.
     * </p>
     *
     * @param request thông tin hóa đơn cần tạo
     * @return thông tin hóa đơn sau khi được lưu
     * @throws ResourceNotFoundException nếu không tìm thấy hợp đồng
     * @throws BusinessException         nếu hợp đồng không hiệu lực, đã có
     *                                   hóa đơn cho kỳ này, hoặc hạn thanh
     *                                   toán sớm hơn ngày lập
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public HoaDonResponse create(HoaDonRequest request) {
        HopDong hopDong = findHopDongForUpdate(
            request.hopDongId()
        );

        LocalDate ky = validateKyThanhToan(
            hopDong,
            request.kyThanhToan()
        );

        if (hoaDonRepository
            .existsByHopDong_IdAndKyThanhToanBetween(
                hopDong.getId(),
                ky,
                YearMonth.from(ky).atEndOfMonth()
            )) {
            throw new BusinessException(
                "Hợp đồng đã có hóa đơn cho tháng này"
            );
        }

        if (request.hanThanhToan().isBefore(request.ngayLap())) {
            throw new BusinessException(
                "Hạn thanh toán không được sớm hơn ngày lập"
            );
        }

        BigDecimal tienPhong = layTienPhongKhiTao(
            hopDong,
            ky,
            request.tienPhong()
        );

        HoaDon entity = HoaDon.builder()
            .hopDong(hopDong)
            .kyThanhToan(ky)
            .ngayLap(request.ngayLap())
            .hanThanhToan(request.hanThanhToan())
            .tienPhong(tienPhong)
            .trangThai(TrangThaiHoaDon.CHUA_THANH_TOAN)
            .build();

        return toResponse(hoaDonRepository.save(entity), false);
    }

    /**
     * Lấy thông tin hóa đơn theo ID, kèm đầy đủ danh sách dòng chi tiết.
     *
     * @param id ID của hóa đơn
     * @return thông tin hóa đơn tương ứng
     * @throws ResourceNotFoundException nếu không tìm thấy hóa đơn
     */
    @Transactional(readOnly = true)
    public HoaDonResponse getById(Integer id) {

        return toResponse(findEntity(id), true);
    }

    /**
     * Lấy danh sách tất cả hóa đơn.
     *
     * @return danh sách thông tin hóa đơn, không kèm dòng chi tiết
     */
    @Transactional(readOnly = true)
    public List<HoaDonResponse> getAll() {

        return hoaDonRepository.findAll()
                .stream()
                .map(entity -> toResponse(entity, false))
                .toList();
    }

    /**
     * Lấy danh sách hóa đơn theo trạng thái thanh toán.
     *
     * @param trangThai trạng thái cần lọc
     * @return danh sách hóa đơn có trạng thái tương ứng
     */
    @Transactional(readOnly = true)
    public List<HoaDonResponse> getByTrangThai(
            TrangThaiHoaDon trangThai) {

        return hoaDonRepository.findByTrangThai(trangThai)
                .stream()
                .map(entity -> toResponse(entity, false))
                .toList();
    }

    /**
     * Lấy danh sách hóa đơn của một hợp đồng, xếp theo kỳ giảm dần.
     *
     * @param hopDongId mã hợp đồng cần lấy hóa đơn
     * @return danh sách hóa đơn của hợp đồng
     * @throws ResourceNotFoundException nếu không tìm thấy hợp đồng
     */
    @Transactional(readOnly = true)
    public List<HoaDonResponse> getByHopDong(Integer hopDongId) {

        findHopDong(hopDongId);

        return hoaDonRepository
                .findByHopDong_IdOrderByKyThanhToanDesc(hopDongId)
                .stream()
                .map(entity -> toResponse(entity, false))
                .toList();
    }

    /**
     * Cập nhật thông tin của một hóa đơn.
     *
     * <p>
     * Chỉ cho phép cập nhật hóa đơn ở trạng thái chưa thanh toán. Không được
     * chuyển hóa đơn sang hợp đồng khác.
     * </p>
     *
     * @param id      ID của hóa đơn cần cập nhật
     * @param request thông tin mới của hóa đơn
     * @return thông tin hóa đơn sau khi cập nhật
     * @throws ResourceNotFoundException nếu không tìm thấy hóa đơn hoặc hợp
     *                                   đồng
     * @throws BusinessException         nếu hóa đơn đã thanh toán, chuyển
     *                                   hợp đồng, trùng kỳ hoặc hạn thanh
     *                                   toán không hợp lệ
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public HoaDonResponse update(Integer id, HoaDonRequest request) {
        // Đọc để xác định hợp đồng; hóa đơn không được đổi hợp đồng.
        Integer hopDongId = findEntity(id).getHopDong().getId();

        if (!hopDongId.equals(request.hopDongId())) {
            throw new BusinessException(
                "Không thể chuyển hóa đơn sang hợp đồng khác"
            );
        }

        // Thống nhất thứ tự: hợp đồng trước, hóa đơn sau.
        HopDong hopDong = findHopDongForUpdate(hopDongId);
        HoaDon entity = findHoaDonForUpdate(id);

        validateChuaThanhToan(entity);

        LocalDate ky = validateKyThanhToan(
            hopDong,
            request.kyThanhToan()
        );

        if (hoaDonRepository
            .existsByHopDong_IdAndKyThanhToanBetweenAndIdNot(
                hopDongId,
                ky,
                YearMonth.from(ky).atEndOfMonth(),
                id
            )) {
            throw new BusinessException(
                "Hợp đồng đã có hóa đơn khác cho tháng này"
            );
        }

        if (request.hanThanhToan().isBefore(request.ngayLap())) {
            throw new BusinessException(
                "Hạn thanh toán không được sớm hơn ngày lập"
            );
        }

        entity.setKyThanhToan(ky);
        entity.setNgayLap(request.ngayLap());
        entity.setHanThanhToan(request.hanThanhToan());

        if (request.tienPhong() != null) {
            entity.setTienPhong(request.tienPhong());
        }

        return toResponse(entity, true);
    }

    /**
     * Xóa hóa đơn theo ID.
     *
     * <p>
     * Chỉ cho phép xóa hóa đơn ở trạng thái chưa thanh toán. Các dòng chi
     * tiết của hóa đơn bị xóa kèm theo.
     * </p>
     *
     * @param id ID của hóa đơn cần xóa
     * @throws ResourceNotFoundException nếu không tìm thấy hóa đơn
     * @throws BusinessException         nếu hóa đơn đã bắt đầu thanh toán
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void delete(Integer id) {

        HoaDon entity = findHoaDonForUpdate(id);

        validateChuaThanhToan(entity);

        chiTietHoaDonRepository.deleteByHoaDon_Id(id);
        hoaDonRepository.delete(entity);
    }

    /**
     * Kiểm tra hóa đơn còn ở trạng thái chưa thanh toán.
     *
     * @param entity hóa đơn cần kiểm tra
     * @throws BusinessException nếu hóa đơn đã bắt đầu thanh toán
     */
    private void validateChuaThanhToan(HoaDon entity) {

        boolean daCoKhoanThu =
            thanhToanRepository.existsByHoaDon_Id(entity.getId());

        if (daCoKhoanThu
            || entity.getTrangThai() != TrangThaiHoaDon.CHUA_THANH_TOAN) {
            throw new BusinessException(
                "Không được sửa hoặc xóa hóa đơn đã có thanh toán");
        }
    }

    /**
     * Tìm entity hóa đơn theo ID.
     *
     * @param id ID của hóa đơn
     * @return entity hóa đơn tương ứng
     * @throws ResourceNotFoundException nếu không tìm thấy hóa đơn
     */
    private HoaDon findEntity(Integer id) {

        return hoaDonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy hóa đơn id = " + id));
    }

    /**
     * Tìm entity hợp đồng theo ID.
     *
     * @param id ID của hợp đồng
     * @return entity hợp đồng tương ứng
     * @throws ResourceNotFoundException nếu không tìm thấy hợp đồng
     */
    private HopDong findHopDong(Integer id) {

        return hopDongRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy hợp đồng id = " + id));
    }

    /**
     * Chuyển đổi entity {@link HoaDon} sang DTO {@link HoaDonResponse}.
     *
     * @param entity    entity hóa đơn cần chuyển đổi
     * @param withDetail {@code true} nếu cần kèm danh sách dòng chi tiết
     * @return DTO chứa thông tin hóa đơn
     */
    private HoaDonResponse toResponse(HoaDon entity, boolean withDetail) {

        // Luôn lấy đầy đủ chi tiết để tính tổng tiền.
        List<ChiTietHoaDonResponse> tatCaChiTiet =
            chiTietHoaDonRepository
                .findByHoaDon_Id(entity.getId())
                .stream()
                .map(this::toChiTietResponse)
                .toList();

        BigDecimal tongTien = tinhTongTien(entity, tatCaChiTiet);

        // Chỉ quyết định có trả chi tiết cho client hay không.
        List<ChiTietHoaDonResponse> chiTietTraVe =
            withDetail ? tatCaChiTiet : List.of();

        return new HoaDonResponse(
            entity.getId(),
            entity.getHopDong().getId(),
            entity.getHopDong().getPhong().getSoPhong(),
            entity.getKyThanhToan(),
            entity.getNgayLap(),
            entity.getHanThanhToan(),
            entity.getTienPhong(),
            tongTien,
            entity.getTrangThai(),
            chiTietTraVe);
    }

    /**
     * Chuyển đổi entity {@link ChiTietHoaDon} sang DTO
     * {@link ChiTietHoaDonResponse}.
     *
     * @param entity entity dòng chi tiết cần chuyển đổi
     * @return DTO chứa thông tin dòng chi tiết
     */
    private ChiTietHoaDonResponse toChiTietResponse(ChiTietHoaDon entity) {

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
                tinhThanhTien(entity));
    }

    /**
     * Tính tổng tiền của hóa đơn.
     *
     * <p>
     * Tổng tiền bằng tiền phòng cộng tổng thành tiền của các dòng chi tiết.
     * </p>
     *
     * @param entity      hóa đơn cần tính
     * @param chiTietHoaDons danh sách dòng chi tiết đã chuyển sang DTO
     * @return tổng tiền của hóa đơn
     */
    private BigDecimal tinhTongTien(
            HoaDon entity,
            List<ChiTietHoaDonResponse> chiTietHoaDons) {

        BigDecimal tongDichVu = chiTietHoaDons.stream()
                .map(ChiTietHoaDonResponse::thanhTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return entity.getTienPhong().add(tongDichVu);
    }

    /**
     * Tính thành tiền của một dòng chi tiết.
     *
     * @param entity entity dòng chi tiết cần tính
     * @return thành tiền {@code = soLuong * donGia}, làm tròn về số nguyên
     */
    private BigDecimal tinhThanhTien(ChiTietHoaDon entity) {

        return entity.getSoLuong()
                .multiply(entity.getDonGia())
                .setScale(0, RoundingMode.HALF_UP);
    }

    private HoaDon findHoaDonForUpdate(Integer id) {

        HoaDon entity = entityManager.find(
            HoaDon.class,
            id,
            LockModeType.PESSIMISTIC_WRITE);

        if (entity == null) {
            throw new ResourceNotFoundException(
                "Không tìm thấy hóa đơn id = " + id);
        }

        // Đọc lại dữ liệu mới nhất sau khi lấy khóa.
        entityManager.refresh(entity, LockModeType.PESSIMISTIC_WRITE);

        return entity;
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

        entityManager.refresh(entity, LockModeType.PESSIMISTIC_WRITE);

        return entity;
    }

    private LocalDate validateKyThanhToan(
        HopDong hopDong,
        LocalDate kyThanhToan
    ) {
        if (kyThanhToan == null) {
            throw new BusinessException(
                "Kỳ thanh toán không được để trống"
            );
        }

        YearMonth ky = YearMonth.from(kyThanhToan);
        YearMonth thangBatDau = YearMonth.from(
            hopDong.getNgayBatDau()
        );

        LocalDate ngayCuoi;

        if (hopDong.getTrangThai()
            == TrangThaiHopDong.DANG_HIEU_LUC) {
            ngayCuoi = hopDong.getNgayKetThuc();

        } else if (hopDong.getTrangThai()
            == TrangThaiHopDong.DA_KET_THUC) {

            ngayCuoi = hopDong.getNgayKetThucThucTe();

            if (ngayCuoi == null) {
                throw new BusinessException(
                    "Hợp đồng cũ chưa có ngày kết thúc thực tế; "
                        + "cần đối soát trước khi lập hóa đơn bổ sung"
                );
            }

        } else {
            throw new BusinessException(
                "Chỉ lập hóa đơn cho hợp đồng đang hiệu lực "
                    + "hoặc đã kết thúc có ngày trả phòng thực tế"
            );
        }

        YearMonth thangCuoi = YearMonth.from(ngayCuoi);

        if (ky.isBefore(thangBatDau) || ky.isAfter(thangCuoi)) {
            throw new BusinessException(
                "Kỳ hóa đơn nằm ngoài thời gian thuê của hợp đồng"
            );
        }

        return ky.atDay(1);
    }

    private BigDecimal layTienPhongKhiTao(
        HopDong hopDong,
        LocalDate ky,
        BigDecimal tienPhongNhap
    ) {
        boolean thangDauKhongDu =
            YearMonth.from(ky).equals(
                YearMonth.from(hopDong.getNgayBatDau())
            )
                && hopDong.getNgayBatDau().getDayOfMonth() != 1;

        boolean hopDongDaKetThuc =
            hopDong.getTrangThai()
                == TrangThaiHopDong.DA_KET_THUC;

        if (tienPhongNhap == null
            && (thangDauKhongDu || hopDongDaKetThuc)) {
            throw new BusinessException(
                "Hóa đơn tháng đầu không đủ tháng hoặc lập bổ sung "
                    + "sau kết thúc phải nhập tiền phòng thực tế; "
                    + "nhập 0 nếu không thu thêm tiền phòng"
            );
        }

        return tienPhongNhap != null
            ? tienPhongNhap
            : hopDong.getGiaThueThoaThuan();
    }
}