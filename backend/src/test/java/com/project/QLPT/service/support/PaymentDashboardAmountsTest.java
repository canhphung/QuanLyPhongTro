package com.project.QLPT.service.support;
import java.math.BigDecimal;
import java.util.Map;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import com.project.QLPT.enums.TrangThaiHoaDon;
class PaymentDashboardAmountsTest {
 private BigDecimal n(String s) { return new BigDecimal(s); }
 @Test void editingSubtractsOldReceiptAndDeletingRestoresDebt() {
  assertEquals(n("70"),PaymentAmounts.afterChange(n("60"),n("20"),n("30"),n("100")));
  assertEquals(n("60"),PaymentAmounts.afterChange(n("100"),n("40"),n("0"),n("100")));
  assertThrows(IllegalArgumentException.class,()->PaymentAmounts.afterChange(n("60"),n("0"),n("41"),n("100")));
 }
 @Test void receiptStatusesFollowCollectedAmount() {
  assertEquals(TrangThaiHoaDon.CHUA_THANH_TOAN,PaymentAmounts.status(n("0"),n("100")));
  assertEquals(TrangThaiHoaDon.THANH_TOAN_MOT_PHAN,PaymentAmounts.status(n("40"),n("100")));
  assertEquals(TrangThaiHoaDon.DA_THANH_TOAN,PaymentAmounts.status(n("100"),n("100")));
 }
 @Test void dashboardCountsDebtWithoutLosingLargeAmounts() {
  var summary=DashboardMoney.summarize(Map.of(1,n("100"),2,n("20"),3,n("9007199254740993")),
    Map.of(1,n("40"),2,n("20")));
  assertEquals(3,summary.invoiceCount()); assertEquals(2,summary.outstandingCount());
  assertEquals(n("9007199254741053"),summary.outstanding());
 }
 @Test void corruptOverpaymentIsReportedInsteadOfOffsettingOtherDebt() {
  assertThrows(IllegalArgumentException.class,()->DashboardMoney.summarize(
    Map.of(1,n("10"),2,n("100")),Map.of(1,n("11"))));
 }
 @Test void emptyOwnerHasZeroDebt() {
  var summary=DashboardMoney.summarize(Map.of(),Map.of());
  assertEquals(0,summary.invoiceCount()); assertEquals(BigDecimal.ZERO,summary.outstanding());
 }
}
