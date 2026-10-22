package com.project.QLPT.service.support;

import java.math.BigDecimal;
import java.net.URI;
import java.util.*;
import com.project.QLPT.enums.*;

public final class ListingRules {
 private ListingRules() {}

 public static boolean editable(TrangThaiTinDang state) { return state!=TrangThaiTinDang.CHO_DUYET; }

 public static boolean canSubmit(TrangThaiTinDang state,TrangThaiPhong room,int images) {
  return Set.of(TrangThaiTinDang.NHAP,TrangThaiTinDang.TU_CHOI,TrangThaiTinDang.DA_AN).contains(state)
    && room==TrangThaiPhong.TRONG && images>0;
 }

 public static void submitting(TrangThaiTinDang state,TrangThaiPhong room,int images) {
  if(!canSubmit(state,room,images))throw new IllegalArgumentException("Chỉ gửi tin nháp/từ chối/ẩn có ảnh, thuộc phòng đang trống");
 }

 public static void approving(TrangThaiTinDang state,TrangThaiPhong room) {
  if(state!=TrangThaiTinDang.CHO_DUYET || room!=TrangThaiPhong.TRONG)
   throw new IllegalArgumentException("Chỉ duyệt tin đang chờ và phòng đang trống");
 }

 public static String reason(String value) {
  if(value==null || value.isBlank() || value.trim().length()>1000)
   throw new IllegalArgumentException("Cần lý do từ 1 đến 1000 ký tự");
  return value.trim();
 }

 public static List<String> images(List<String> input) {
  if(input==null || input.size()>10)throw new IllegalArgumentException("Tối đa 10 ảnh");
  var result=new ArrayList<String>();
  for(var value:input) {
   if (value == null || value.trim().isBlank()) continue;
   String trimmed = value.trim();
   if (trimmed.length() > 2048) throw new IllegalArgumentException("Đường dẫn ảnh quá dài");
   boolean isLocalUpload = trimmed.startsWith("/api/uploads/") || trimmed.startsWith("/uploads/");
   if (!isLocalUpload) {
    try {
     var uri=new URI(trimmed).normalize();
     boolean isHttps = "https".equalsIgnoreCase(uri.getScheme()) && uri.getHost() != null;
     boolean isLocalHttp = "http".equalsIgnoreCase(uri.getScheme()) && ("localhost".equalsIgnoreCase(uri.getHost()) || "127.0.0.1".equals(uri.getHost()));
     if ((!isHttps && !isLocalHttp) || uri.getRawUserInfo() != null || uri.getFragment() != null) {
      throw new IllegalArgumentException("URL ảnh phải là HTTPS hoặc ảnh tải lên từ máy");
     }
     trimmed = uri.toASCIIString();
    } catch(java.net.URISyntaxException ex) {
     throw new IllegalArgumentException("URL ảnh không hợp lệ");
    }
   }
   if(result.contains(trimmed))throw new IllegalArgumentException("URL ảnh bị trùng");
   result.add(trimmed);
  }
  return result;
 }

 public static void price(BigDecimal value) {
  if(value==null || value.signum()<=0 || value.stripTrailingZeros().scale()>0
    || value.stripTrailingZeros().precision()-value.stripTrailingZeros().scale()>19)
   throw new IllegalArgumentException("Giá đăng phải nguyên dương, tối đa 19 chữ số");
 }
}
