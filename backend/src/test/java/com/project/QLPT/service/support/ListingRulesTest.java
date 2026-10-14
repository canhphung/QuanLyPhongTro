package com.project.QLPT.service.support;
import java.math.BigDecimal;
import java.util.List;
import com.project.QLPT.enums.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class ListingRulesTest {
 @Test void onlyVacantDraftWithImagesCanSubmit() {
  assertTrue(ListingRules.canSubmit(TrangThaiTinDang.NHAP,TrangThaiPhong.TRONG,1));
  assertFalse(ListingRules.canSubmit(TrangThaiTinDang.CHO_DUYET,TrangThaiPhong.TRONG,1));
  assertFalse(ListingRules.canSubmit(TrangThaiTinDang.NHAP,TrangThaiPhong.DANG_THUE,1));
  assertFalse(ListingRules.canSubmit(TrangThaiTinDang.NHAP,TrangThaiPhong.TRONG,0));
 }
 @Test void approvalRequiresPendingAndVacantRoom() {
  assertThrows(IllegalArgumentException.class,()->ListingRules.approving(TrangThaiTinDang.NHAP,TrangThaiPhong.TRONG));
  assertThrows(IllegalArgumentException.class,()->ListingRules.approving(TrangThaiTinDang.CHO_DUYET,TrangThaiPhong.BAO_TRI));
 }
 @Test void imageUrlsRejectUnsafeAndDuplicateValues() {
  assertEquals(List.of("https://example.test/a.jpg"),ListingRules.images(List.of(" https://example.test/a.jpg ")));
  for(var url:List.of("javascript:alert(1)","http://example.test/x","data:image/svg+xml,xxx","https://a:b@example.test/x","https://example.test/x#fragment"))
   assertThrows(IllegalArgumentException.class,()->ListingRules.images(List.of(url)));
  assertThrows(IllegalArgumentException.class,()->ListingRules.images(List.of("https://example.test/a","https://example.test/a")));
 }
 @Test void priceAndReasonAreBoundedWithoutFloatingPoint() {
  assertDoesNotThrow(()->ListingRules.price(new BigDecimal("9007199254740993")));
  assertThrows(IllegalArgumentException.class,()->ListingRules.price(new BigDecimal("10000000000000000000")));
  assertThrows(IllegalArgumentException.class,()->ListingRules.price(new BigDecimal("0.5")));
  assertThrows(IllegalArgumentException.class,()->ListingRules.reason(" "));
 }
}
