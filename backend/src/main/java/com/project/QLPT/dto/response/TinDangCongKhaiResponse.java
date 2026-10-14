package com.project.QLPT.dto.response;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;
// Chỉ nội dung đã kiểm duyệt; không lộ ID phòng/chủ/tài khoản hoặc lý do nội bộ.
public record TinDangCongKhaiResponse(Integer id,String tieuDe,String moTa,
 @JsonFormat(shape=JsonFormat.Shape.STRING) BigDecimal giaThue,
 @JsonFormat(shape=JsonFormat.Shape.STRING) BigDecimal dienTich,
 String diaChi,String soDienThoaiLienHe,List<String> anhUrls,LocalDateTime ngayDuyet) {}
