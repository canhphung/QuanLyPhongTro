package com.project.QLPT.service;
import java.time.*;
import java.util.*;
import com.project.QLPT.entity.*;
import com.project.QLPT.enums.*;
import com.project.QLPT.dto.request.*;
import com.project.QLPT.dto.response.*;
import com.project.QLPT.exception.*;
import com.project.QLPT.repository.*;
import com.project.QLPT.repository.specification.ListingSpecifications;
import com.project.QLPT.service.support.*;
import jakarta.persistence.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service @RequiredArgsConstructor @Transactional(readOnly=true)
public class TinDangService {
 private final TinDangRepository repository;
 private final LichSuTinDangRepository history;
 private final PhongRepository rooms;
 private final CurrentAccountService current;
 @PersistenceContext private EntityManager entityManager;
 private static final ZoneId ZONE=ZoneId.of("Asia/Ho_Chi_Minh");
 private LocalDateTime now(){return LocalDateTime.now(ZONE);}

 @Transactional(isolation=Isolation.READ_COMMITTED)
 public TinDangResponse create(TinDangRequest request) {
  var room=ownerRoom(request.phongId());
  if(repository.existsByPhong_Id(room.getId()))throw new BusinessException("Phòng đã có tin đăng; hãy sửa tin hiện có");
  var time=now();
  var tin=TinDang.builder().phong(room).trangThai(TrangThaiTinDang.NHAP).ngayTao(time).ngayCapNhat(time).build();
  copy(tin,request);
  repository.saveAndFlush(tin);
  return response(tin);
 }
 public PageResponse<TinDangResponse> ownerPage(int page,int size,TrangThaiTinDang state,String keyword) {
  return PageSupport.response(repository.findAll(ListingSpecifications.filter(current.getChuTro().getId(),state,keyword,false),
    PageSupport.pageable(page,size,"id","desc",Set.of("id"))),this::response);
 }
 public TinDangResponse ownerGet(Integer id){return response(ownerEntity(id));}

 @Transactional(isolation=Isolation.READ_COMMITTED)
 public TinDangResponse update(Integer id,TinDangRequest request) {
  var tin=ownerLock(id);
  expected(tin,request.phienBan());
  if(!tin.getPhong().getId().equals(request.phongId()))throw new BusinessException("Không chuyển tin sang phòng khác");
  if(!ListingRules.editable(tin.getTrangThai()))throw new BusinessException("Rút yêu cầu duyệt trước khi sửa nội dung");
  copy(tin,request);
  tin.setTrangThai(TrangThaiTinDang.NHAP);tin.setLyDo(null);tin.setNgayDuyet(null);tin.setNgayGuiDuyet(null);
  tin.setNgayCapNhat(now());repository.flush();
  return response(tin);
 }
 @Transactional(isolation=Isolation.READ_COMMITTED)
 public TinDangResponse submit(Integer id,TinDangActionRequest request) {
  var tin=ownerLock(id);expected(tin,request.phienBan());
  rule(()->ListingRules.submitting(tin.getTrangThai(),tin.getPhong().getTrangThai(),tin.getAnhUrls().size()));
  var sourceVersion=tin.getPhienBan();
  tin.setTrangThai(TrangThaiTinDang.CHO_DUYET);tin.setLyDo(null);tin.setNgayDuyet(null);
  tin.setNgayGuiDuyet(now());record(tin,sourceVersion,HanhDongTinDang.GUI_DUYET,null,current.getTaiKhoan());
  return response(tin);
 }
 @Transactional(isolation=Isolation.READ_COMMITTED)
 public TinDangResponse withdraw(Integer id,TinDangActionRequest request) {
  var tin=ownerLock(id);expected(tin,request.phienBan());
  requireState(tin,TrangThaiTinDang.CHO_DUYET);
  var sourceVersion=tin.getPhienBan();
  tin.setTrangThai(TrangThaiTinDang.NHAP);tin.setNgayGuiDuyet(null);
  record(tin,sourceVersion,HanhDongTinDang.RUT_DUYET,null,current.getTaiKhoan());
  return response(tin);
 }
 @Transactional(isolation=Isolation.READ_COMMITTED)
 public TinDangResponse hideOwner(Integer id,TinDangActionRequest request) {
  var tin=ownerLock(id);expected(tin,request.phienBan());requireState(tin,TrangThaiTinDang.DA_DUYET);
  var version=tin.getPhienBan();tin.setTrangThai(TrangThaiTinDang.DA_AN);
  tin.setLyDo("Chủ trọ ẩn tin");
  record(tin,version,HanhDongTinDang.AN,tin.getLyDo(),current.getTaiKhoan());return response(tin);
 }
 @Transactional(isolation=Isolation.READ_COMMITTED)
 public void delete(Integer id,Integer version) {
  var tin=ownerLock(id);expected(tin,version);
  if(tin.getTrangThai()!=TrangThaiTinDang.NHAP || history.existsByTinDang_Id(id))
   throw new BusinessException("Chỉ xóa nháp chưa có lịch sử gửi/duyệt; tin có lịch sử cần ẩn");
  repository.delete(tin);repository.flush();
 }
 public List<LichSuTinDangResponse> ownerHistory(Integer id){ownerEntity(id);return history(id);}

 public PageResponse<TinDangResponse> adminPage(int page,int size,TrangThaiTinDang state,String keyword) {
  admin();
  return PageSupport.response(repository.findAll(ListingSpecifications.filter(null,state,keyword,false),
    PageSupport.pageable(page,size,"id","desc",Set.of("id"))),this::response);
 }
 public TinDangResponse adminGet(Integer id){admin();return response(entity(id));}
 public List<LichSuTinDangResponse> adminHistory(Integer id){admin();entity(id);return history(id);}

 @Transactional(isolation=Isolation.READ_COMMITTED)
 public TinDangResponse approve(Integer id,TinDangActionRequest request) {
  var actor=admin();var tin=adminLock(id);expected(tin,request.phienBan());
  rule(()->ListingRules.approving(tin.getTrangThai(),tin.getPhong().getTrangThai()));
  var version=tin.getPhienBan();tin.setTrangThai(TrangThaiTinDang.DA_DUYET);tin.setLyDo(null);tin.setNgayDuyet(now());
  record(tin,version,HanhDongTinDang.DUYET,null,actor);return response(tin);
 }
 @Transactional(isolation=Isolation.READ_COMMITTED)
 public TinDangResponse reject(Integer id,TinDangActionRequest request) {
  var actor=admin();var tin=adminLock(id);expected(tin,request.phienBan());requireState(tin,TrangThaiTinDang.CHO_DUYET);
  var reason=reason(request.lyDo());var version=tin.getPhienBan();
  tin.setTrangThai(TrangThaiTinDang.TU_CHOI);tin.setLyDo(reason);tin.setNgayDuyet(null);
  record(tin,version,HanhDongTinDang.TU_CHOI,reason,actor);return response(tin);
 }
 @Transactional(isolation=Isolation.READ_COMMITTED)
 public TinDangResponse hideAdmin(Integer id,TinDangActionRequest request) {
  var actor=admin();var tin=adminLock(id);expected(tin,request.phienBan());requireState(tin,TrangThaiTinDang.DA_DUYET);
  var reason=reason(request.lyDo());var version=tin.getPhienBan();
  tin.setTrangThai(TrangThaiTinDang.DA_AN);tin.setLyDo(reason);
  record(tin,version,HanhDongTinDang.AN,reason,actor);return response(tin);
 }

 public PageResponse<TinDangCongKhaiResponse> publicPage(int page,int size,String keyword) {
  return PageSupport.response(repository.findAll(ListingSpecifications.filter(null,null,keyword,true),
    PageSupport.pageable(page,size,"id","desc",Set.of("id"))),this::publicResponse);
 }
 public TinDangCongKhaiResponse publicGet(Integer id) {
  var spec=ListingSpecifications.filter(null,null,null,true).and((root,q,cb)->cb.equal(root.get("id"),id));
  return publicResponse(repository.findOne(spec).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy tin đăng")));
 }
 private TinDangCongKhaiResponse publicResponse(TinDang tin) {
  return new TinDangCongKhaiResponse(tin.getId(),tin.getTieuDe(),tin.getMoTa(),tin.getGiaThue(),tin.getDienTich(),
    tin.getDiaChi(),tin.getSoDienThoaiLienHe(),List.copyOf(tin.getAnhUrls()),tin.getNgayDuyet());
 }
 private TinDangResponse response(TinDang tin) {
  var room=tin.getPhong();
  // Account hoạt động là điều kiện công khai, không trả thông tin riêng tài khoản.
  var active=Boolean.TRUE.equals(room.getNhaTro().getChuTro().getTaiKhoan().getHoatDong());
  return new TinDangResponse(tin.getId(),room.getId(),tin.getPhienBan(),tin.getTieuDe(),tin.getMoTa(),
    tin.getGiaThue(),tin.getDienTich(),tin.getDiaChi(),tin.getSoDienThoaiLienHe(),List.copyOf(tin.getAnhUrls()),
    tin.getTrangThai(),tin.getLyDo(),tin.getNgayTao(),tin.getNgayCapNhat(),tin.getNgayGuiDuyet(),tin.getNgayDuyet(),
    room.getNhaTro().getTenNhaTro(),room.getSoPhong(),room.getTrangThai(),
    active && tin.getTrangThai()==TrangThaiTinDang.DA_DUYET && room.getTrangThai()==TrangThaiPhong.TRONG,
    ListingRules.editable(tin.getTrangThai()),
    ListingRules.canSubmit(tin.getTrangThai(),room.getTrangThai(),tin.getAnhUrls().size()),
    tin.getTrangThai()==TrangThaiTinDang.NHAP && !history.existsByTinDang_Id(tin.getId()));
 }
 private void copy(TinDang tin,TinDangRequest request) {
  rule(()->ListingRules.price(request.giaThue()));
  List<String> urls;
  try {urls=ListingRules.images(request.anhUrls());} catch(IllegalArgumentException ex){throw new BusinessException(ex.getMessage());}
  tin.setTieuDe(request.tieuDe().trim());tin.setMoTa(request.moTa().trim());tin.setGiaThue(request.giaThue());
  tin.setSoDienThoaiLienHe(request.soDienThoaiLienHe().trim());
  // Snapshot nội dung vị trí/diện tích: phòng/nhà thay đổi không sửa nội dung đã duyệt.
  tin.setDienTich(tin.getPhong().getDienTich());tin.setDiaChi(tin.getPhong().getNhaTro().getDiaChi());
  tin.getAnhUrls().clear();tin.getAnhUrls().addAll(urls);
 }
 private TaiKhoan admin() {
  var actor=current.getTaiKhoan();
  if(!actor.getVaiTros().contains(VaiTroTaiKhoan.ADMIN))throw new ResponseStatusException(HttpStatus.FORBIDDEN);
  return actor;
 }
 private TinDang entity(Integer id){return repository.findById(id).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy tin đăng"));}
 private TinDang ownerEntity(Integer id) {
  return repository.findByIdAndPhong_NhaTro_ChuTro_Id(id,current.getChuTro().getId())
    .orElseThrow(()->new ResourceNotFoundException("Không tìm thấy tin đăng"));
 }
 private Phong ownerRoom(Integer id) {
  var room=rooms.findOwnedForUpdate(id,current.getChuTro().getId()).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy phòng"));
  entityManager.refresh(room,LockModeType.PESSIMISTIC_WRITE);return room;
 }
 private TinDang ownerLock(Integer id) {
  var tin=ownerEntity(id);ownerRoom(tin.getPhong().getId());
  tin=repository.findOwnedForUpdate(id,current.getChuTro().getId()).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy tin đăng"));
  entityManager.refresh(tin,LockModeType.PESSIMISTIC_WRITE);return tin;
 }
 private TinDang adminLock(Integer id) {
  var tin=entity(id);
  var room=rooms.findForUpdate(tin.getPhong().getId()).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy phòng"));
  entityManager.refresh(room,LockModeType.PESSIMISTIC_WRITE);
  tin=repository.findForUpdate(id).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy tin đăng"));
  entityManager.refresh(tin,LockModeType.PESSIMISTIC_WRITE);return tin;
 }
 private void expected(TinDang tin,Integer version) {
  if(version==null || version<0)throw new BusinessException("Cần phiên bản tin đang xem");
  if(!version.equals(tin.getPhienBan()))throw new OptimisticLockingFailureException("Tin đã thay đổi; hãy tải lại trước khi xử lý");
 }
 private void requireState(TinDang tin,TrangThaiTinDang state) {
  if(tin.getTrangThai()!=state)throw new BusinessException("Trạng thái tin không phù hợp thao tác");
 }
 private void rule(Runnable work){try{work.run();}catch(IllegalArgumentException ex){throw new BusinessException(ex.getMessage());}}
 private String reason(String value){try{return ListingRules.reason(value);}catch(IllegalArgumentException ex){throw new BusinessException(ex.getMessage());}}
 private void record(TinDang tin,Integer version,HanhDongTinDang action,String reason,TaiKhoan actor) {
  tin.setNgayCapNhat(now());repository.flush();
  history.saveAndFlush(LichSuTinDang.builder().tinDang(tin).phienBan(version).hanhDong(action)
    .nguoiThucHien(actor).lyDo(reason).thoiDiem(tin.getNgayCapNhat()).build());
 }
 private List<LichSuTinDangResponse> history(Integer id) {
  return history.findTop200ByTinDang_IdOrderByIdDesc(id).stream().map(row->new LichSuTinDangResponse(
    row.getId(),row.getPhienBan(),row.getHanhDong(),row.getNguoiThucHien().getHoTen(),row.getLyDo(),row.getThoiDiem())).toList();
 }
}
