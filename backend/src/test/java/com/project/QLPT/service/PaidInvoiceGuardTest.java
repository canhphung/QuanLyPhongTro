package com.project.QLPT.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.project.QLPT.dto.request.*;
import com.project.QLPT.entity.*;
import com.project.QLPT.enums.TrangThaiHoaDon;
import com.project.QLPT.exception.BusinessException;
import com.project.QLPT.repository.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class PaidInvoiceGuardTest {
    @Test
    void anyReceiptLocksHeaderAndLinesEvenIfStatusStillUnpaid() {
        verifyLocked(TrangThaiHoaDon.CHUA_THANH_TOAN, true);
    }

    @Test
    void paidStatusLocksHeaderAndLinesEvenWithoutReceipt() {
        verifyLocked(TrangThaiHoaDon.DA_THANH_TOAN, false);
    }

    private void verifyLocked(TrangThaiHoaDon state, boolean hasReceipt) {
        var receipts = mock(ThanhToanRepository.class);
        var lines = mock(ChiTietHoaDonRepository.class);
        var services = mock(DichVuRepository.class);
        var owner = mock(CurrentAccountService.class);
        var invoices = mock(OwnedInvoiceAccess.class);
        var contracts = mock(OwnedContractAccess.class);
        var headers = mock(HoaDonRepository.class);
        var contract = HopDong.builder().id(9).build();
        var invoice = HoaDon.builder().id(1).hopDong(contract).trangThai(state).build();
        when(invoices.get(1)).thenReturn(invoice);
        when(invoices.lock(1)).thenReturn(invoice);
        when(contracts.lock(9)).thenReturn(contract);
        when(receipts.existsByHoaDon_Id(1)).thenReturn(hasReceipt);
        var detailService = new ChiTietHoaDonService(lines, invoices, owner, services, receipts);
        var headerService = new HoaDonService(headers, contracts, invoices, owner, lines, receipts);
        var detail = new ChiTietHoaDonRequest(2, new BigDecimal("100"), new BigDecimal("125"), null, null);
        var date = LocalDate.of(2026, 10, 1);
        var header = new HoaDonRequest(9, date, date, date.plusDays(5), BigDecimal.ZERO);
        assertThrows(BusinessException.class, () -> detailService.create(1, detail));
        assertThrows(BusinessException.class, () -> detailService.update(1, 3, detail));
        assertThrows(BusinessException.class, () -> detailService.delete(1, 3));
        assertThrows(BusinessException.class, () -> headerService.update(1, header));
        assertThrows(BusinessException.class, () -> headerService.delete(1));
        verifyNoInteractions(lines, services, headers);
    }
}
