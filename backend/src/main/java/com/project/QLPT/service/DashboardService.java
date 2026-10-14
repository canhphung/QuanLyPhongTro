package com.project.QLPT.service;

import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import com.project.QLPT.dto.response.DashboardResponse;
import com.project.QLPT.enums.*;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.repository.*;
import com.project.QLPT.repository.specification.OwnerSpecifications;
import com.project.QLPT.service.support.*;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final PhongRepository phongRepository;
    private final NguoiThueRepository nguoiThueRepository;
    private final HopDongRepository hopDongRepository;
    private final HoaDonRepository hoaDonRepository;
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;
    private final ThanhToanRepository thanhToanRepository;
    private final CurrentAccountService currentAccount;
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public DashboardResponse getThongKe(String thang) {
        YearMonth month;
        try {
            month = thang == null ? YearMonth.now(BUSINESS_ZONE) : YearMonth.parse(thang);
            if (month.getYear() < 1000 || month.isAfter(YearMonth.of(9999, 11)))
                throw new BusinessException("Tháng phải trong khoảng 1000-01 đến 9999-11");
        } catch (DateTimeParseException ex) {
            throw new BusinessException("Tháng phải có định dạng YYYY-MM");
        }
        Integer ownerId = currentAccount.getChuTro().getId();
        // Ba truy vấn bulk, không lặp query tổng tiền theo từng hóa đơn.
        var totals = new HashMap<Integer, BigDecimal>();
        for (var row : hoaDonRepository.rentsForOwner(ownerId))
            totals.put(row.getInvoiceId(), row.getRent());
        for (var row : chiTietHoaDonRepository.amountsForOwner(ownerId)) {
            if (!ownerId.equals(row.getServiceOwnerId()))
                throw new BusinessException("Hóa đơn có dịch vụ không cùng chủ; cần đối soát");
            totals.merge(row.getInvoiceId(), InvoiceAmounts.lineTotal(row.getQuantity(), row.getPrice()), BigDecimal::add);
        }
        var collected = new HashMap<Integer, BigDecimal>();
        for (var row : thanhToanRepository.totalsForOwner(ownerId))
            collected.put(row.getInvoiceId(), row.getCollected());
        DashboardMoney.Summary summary;
        try { summary = DashboardMoney.summarize(totals, collected); }
        catch (IllegalArgumentException ex) { throw new BusinessException(ex.getMessage()); }
        var inMonth = thanhToanRepository.collectedInPeriod(ownerId,
            month.atDay(1).atStartOfDay(), month.plusMonths(1).atDay(1).atStartOfDay());
        if (inMonth == null) inMonth = BigDecimal.ZERO;
        return new DashboardResponse(
            phongRepository.count(OwnerSpecifications.phong(ownerId, null, null, null)),
            roomCount(ownerId, TrangThaiPhong.TRONG), roomCount(ownerId, TrangThaiPhong.DANG_THUE),
            roomCount(ownerId, TrangThaiPhong.BAO_TRI), roomCount(ownerId, TrangThaiPhong.NGUNG_HOAT_DONG),
            nguoiThueRepository.count(OwnerSpecifications.nguoiThue(ownerId, null)),
            hopDongRepository.count(OwnerSpecifications.hopDong(ownerId, null, TrangThaiHopDong.DANG_HIEU_LUC)),
            summary.invoiceCount(), summary.outstandingCount(), summary.outstanding(), inMonth, month.toString());
    }

    private long roomCount(Integer ownerId, TrangThaiPhong state) {
        return phongRepository.count(OwnerSpecifications.phong(ownerId, null, null, state));
    }
}
