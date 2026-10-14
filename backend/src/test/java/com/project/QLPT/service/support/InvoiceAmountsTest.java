package com.project.QLPT.service.support;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class InvoiceAmountsTest {
    @Test
    void roundsEveryLineBeforeAdding() {
        var half = InvoiceAmounts.lineTotal(new BigDecimal("0.125"), new BigDecimal("4"));
        assertEquals(0, BigDecimal.ONE.compareTo(half));
        var total = InvoiceAmounts.total(new BigDecimal("7"), List.of(half, half));
        assertEquals(0, new BigDecimal("9").compareTo(total));
    }

    @Test
    void keepsLargeIntegersAndZeroConsumptionExact() {
        assertEquals(0, new BigDecimal("9007199254740993").compareTo(
            InvoiceAmounts.lineTotal(new BigDecimal("9007199254740993"), BigDecimal.ONE)));
        assertEquals(0, BigDecimal.ZERO.compareTo(
            InvoiceAmounts.lineTotal(BigDecimal.ZERO, new BigDecimal("3500"))));
        assertEquals(0, new BigDecimal("3087500").compareTo(
            InvoiceAmounts.total(new BigDecimal("3000000"),
                List.of(InvoiceAmounts.lineTotal(new BigDecimal("25"), new BigDecimal("3500"))))));
    }
}
