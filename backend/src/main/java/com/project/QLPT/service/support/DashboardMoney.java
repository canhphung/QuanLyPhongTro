package com.project.QLPT.service.support;

import java.math.BigDecimal;
import java.util.Map;

public final class DashboardMoney {
    private DashboardMoney() {}
    public record Summary(long invoiceCount, long outstandingCount, BigDecimal outstanding) {}
    public static Summary summarize(Map<Integer, BigDecimal> totals, Map<Integer, BigDecimal> collected) {
        long count = 0;
        var debt = BigDecimal.ZERO;
        for (var row : totals.entrySet()) {
            var paid = collected.getOrDefault(row.getKey(), BigDecimal.ZERO);
            var remaining = row.getValue().subtract(paid);
            if (row.getValue().signum() < 0 || paid.signum() < 0 || remaining.signum() < 0)
                throw new IllegalArgumentException("Dữ liệu thu/tổng hóa đơn không hợp lệ; cần đối soát");
            if (remaining.signum() > 0) { count++; debt = debt.add(remaining); }
        }
        return new Summary(totals.size(), count, debt);
    }
}
