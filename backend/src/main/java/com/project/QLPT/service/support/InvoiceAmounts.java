package com.project.QLPT.service.support;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/** Chốt công thức: làm tròn từng dòng về đồng trước khi cộng. */
public final class InvoiceAmounts {
    private InvoiceAmounts() {}
    public static BigDecimal lineTotal(BigDecimal quantity, BigDecimal unitPrice) {
        return quantity.multiply(unitPrice).setScale(0, RoundingMode.HALF_UP);
    }
    public static BigDecimal total(BigDecimal rent, List<BigDecimal> lines) {
        return lines.stream().reduce(rent, BigDecimal::add);
    }
}
