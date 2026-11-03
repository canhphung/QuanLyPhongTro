package com.project.QLPT.repository.specification;
import java.util.Locale;
import com.project.QLPT.entity.TinDang;
import com.project.QLPT.enums.*;
import org.springframework.data.jpa.domain.Specification;
public final class ListingSpecifications {
 private ListingSpecifications() {}
 public static Specification<TinDang> filter(Integer ownerId,TrangThaiTinDang state,String keyword,boolean publicOnly) {
  return(root,query,cb)->{
   var p=cb.conjunction();
   if(ownerId!=null)p=cb.and(p,cb.equal(root.get("phong").get("nhaTro").get("chuTro").get("id"),ownerId));
   if(state!=null)p=cb.and(p,cb.equal(root.get("trangThai"),state));
   if(publicOnly)p=cb.and(p,cb.equal(root.get("trangThai"),TrangThaiTinDang.DA_DUYET),
     cb.equal(root.get("phong").get("trangThai"),TrangThaiPhong.TRONG),
     cb.isTrue(root.get("phong").get("nhaTro").get("chuTro").get("taiKhoan").get("hoatDong")),cb.isTrue(root.get("phong").get("nhaTro").get("active")));
   if(keyword!=null && !keyword.isBlank()) {
    var escaped=keyword.trim().toLowerCase(Locale.ROOT).replace("!","!!").replace("%","!%").replace("_","!_");
    var pattern="%"+escaped+"%";
    p=cb.and(p,cb.or(cb.like(cb.lower(root.get("tieuDe")),pattern,'!'),cb.like(cb.lower(root.get("diaChi")),pattern,'!')));
   }
   return p;
  };
 }
}
