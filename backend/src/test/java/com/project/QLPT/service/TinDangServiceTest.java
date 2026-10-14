package com.project.QLPT.service;
import java.math.BigDecimal;
import java.util.*;
import com.project.QLPT.dto.request.*;
import com.project.QLPT.entity.*;
import com.project.QLPT.enums.*;
import com.project.QLPT.exception.*;
import com.project.QLPT.repository.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.test.util.ReflectionTestUtils;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TinDangServiceTest {
 final TinDangRepository repository=mock(TinDangRepository.class);
 final LichSuTinDangRepository history=mock(LichSuTinDangRepository.class);
 final PhongRepository rooms=mock(PhongRepository.class);
 final CurrentAccountService current=mock(CurrentAccountService.class);
 final EntityManager em=mock(EntityManager.class);
 final TinDangService service=new TinDangService(repository,history,rooms,current);
 final TaiKhoan admin=TaiKhoan.builder().id(1).hoTen("ADMIN").vaiTros(Set.of(VaiTroTaiKhoan.ADMIN)).build();
 final TaiKhoan ownerAccount=TaiKhoan.builder().id(2).hoTen("Chủ").build();
 final ChuTro owner=ChuTro.builder().id(2).taiKhoan(ownerAccount).build();
 final NhaTro house=NhaTro.builder().id(3).chuTro(owner).tenNhaTro("Nhà").diaChi("Địa chỉ").build();
 final Phong room=Phong.builder().id(4).nhaTro(house).soPhong("P101").dienTich(new BigDecimal("25"))
   .giaThue(new BigDecimal("100")).trangThai(TrangThaiPhong.TRONG).build();
 TinDangServiceTest(){ReflectionTestUtils.setField(service,"entityManager",em);}
 TinDang tin(TrangThaiTinDang state) {
  return TinDang.builder().id(5).phong(room).phienBan(7).tieuDe("Tin").moTa("Mô tả")
   .giaThue(new BigDecimal("100")).dienTich(new BigDecimal("25")).diaChi("Địa chỉ")
   .soDienThoaiLienHe("0901234567").anhUrls(new ArrayList<>(List.of("https://example.test/a.jpg"))).trangThai(state).build();
 }
 void adminLock(TinDang tin) {
  when(current.getTaiKhoan()).thenReturn(admin);
  when(repository.findById(5)).thenReturn(Optional.of(tin));
  when(rooms.findForUpdate(4)).thenReturn(Optional.of(room));
  when(repository.findForUpdate(5)).thenReturn(Optional.of(tin));
 }
 void ownerLock(TinDang tin) {
  when(current.getChuTro()).thenReturn(owner);
  when(current.getTaiKhoan()).thenReturn(ownerAccount);
  when(repository.findByIdAndPhong_NhaTro_ChuTro_Id(5,2)).thenReturn(Optional.of(tin));
  when(rooms.findOwnedForUpdate(4,2)).thenReturn(Optional.of(room));
  when(repository.findOwnedForUpdate(5,2)).thenReturn(Optional.of(tin));
 }
 @Test void staleAdminDecisionDoesNotPublishOrWriteHistory() {
  var tin=tin(TrangThaiTinDang.CHO_DUYET);adminLock(tin);
  assertThrows(OptimisticLockingFailureException.class,()->service.approve(5,new TinDangActionRequest(6,null)));
  assertEquals(TrangThaiTinDang.CHO_DUYET,tin.getTrangThai());
  verify(repository,never()).flush();verify(history,never()).saveAndFlush(any());
 }
 @Test void approvalLocksRoomBeforeListingAndRecordsActorAndReviewedVersion() {
  var tin=tin(TrangThaiTinDang.CHO_DUYET);adminLock(tin);
  var result=service.approve(5,new TinDangActionRequest(7,null));
  assertEquals(TrangThaiTinDang.DA_DUYET,result.trangThai());assertTrue(result.dangHienThi());
  var order=inOrder(rooms,repository);order.verify(repository).findById(5);
  order.verify(rooms).findForUpdate(4);order.verify(repository).findForUpdate(5);
  verify(history).saveAndFlush(argThat(row->row.getNguoiThucHien()==admin &&
    row.getPhienBan()==7 && row.getHanhDong()==HanhDongTinDang.DUYET));
 }
 @Test void rejectedRoomStatusCannotBeApproved() {
  var tin=tin(TrangThaiTinDang.CHO_DUYET);adminLock(tin);room.setTrangThai(TrangThaiPhong.DANG_THUE);
  assertThrows(BusinessException.class,()->service.approve(5,new TinDangActionRequest(7,null)));
  verify(history,never()).saveAndFlush(any());
 }
 @Test void editingApprovedContentImmediatelyMakesItDraft() {
  var tin=tin(TrangThaiTinDang.DA_DUYET);ownerLock(tin);
  var result=service.update(5,new TinDangRequest(4,"Nội dung mới","Mô tả mới",new BigDecimal("200"),
    "0901234567",List.of("https://example.test/a.jpg"),7));
  assertEquals(TrangThaiTinDang.NHAP,result.trangThai());assertFalse(result.dangHienThi());
 }
 @Test void foreignOwnerCannotReadOrEditTin() {
  when(current.getChuTro()).thenReturn(owner);
  when(repository.findByIdAndPhong_NhaTro_ChuTro_Id(5,2)).thenReturn(Optional.empty());
  assertThrows(ResourceNotFoundException.class,()->service.ownerGet(5));
  assertThrows(ResourceNotFoundException.class,()->service.update(5,new TinDangRequest(4,"Tin","Mô tả",
    new BigDecimal("100"),"0901234567",List.of(),7)));
  verifyNoInteractions(rooms,history);verify(repository,never()).flush();
 }
 @Test void historyPreventsDeletingAWithdrawnDraft() {
  var tin=tin(TrangThaiTinDang.NHAP);ownerLock(tin);
  when(history.existsByTinDang_Id(5)).thenReturn(true);
  assertThrows(BusinessException.class,()->service.delete(5,7));
  verify(repository,never()).delete(any());
 }
}
