package com.project.QLPT.dto.response;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.project.QLPT.enums.*;
public record TinDangResponse(
 Integer id,Integer phongId,Integer phienBan,String tieuDe,String moTa,
 @JsonFormat(shape=JsonFormat.Shape.STRING) BigDecimal giaThue,
 @JsonFormat(shape=JsonFormat.Shape.STRING) BigDecimal dienTich,
 String diaChi,String soDienThoaiLienHe,List<String> anhUrls,TrangThaiTinDang trangThai,
 String lyDo,LocalDateTime ngayTao,LocalDateTime ngayCapNhat,LocalDateTime ngayGuiDuyet,
 LocalDateTime ngayDuyet,String tenNhaTro,String soPhong,TrangThaiPhong trangThaiPhong,
 boolean dangHienThi,boolean coTheChinhSua,boolean coTheGuiDuyet,boolean coTheXoa
) {}
