package com.project.QLPT.service.support;

import java.math.BigDecimal;
import com.project.QLPT.enums.TrangThaiHoaDon;

public final class PaymentAmounts {
    private PaymentAmounts() {}
    public static BigDecimal afterChange(BigDecimal collected, BigDecimal oldAmount,
            BigDecimal newAmount, BigDecimal invoiceTotal) {
        var result = collected.subtract(oldAmount).add(newAmount);
        if (result.signum() < 0 || result.compareTo(invoiceTotal) > 0)
            throw new IllegalArgumentException("Tổng số tiền thanh toán không được vượt tổng tiền hóa đơn");
        return result;
    }
    public static TrangThaiHoaDon status(BigDecimal collected, BigDecimal total) {
        if (collected.signum() == 0) return TrangThaiHoaDon.CHUA_THANH_TOAN;
        return collected.compareTo(total) >= 0 ? TrangThaiHoaDon.DA_THANH_TOAN
            : TrangThaiHoaDon.THANH_TOAN_MOT_PHAN;
    }
}
