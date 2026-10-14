package com.project.QLPT.dto.response;
import java.time.LocalDateTime;
import com.project.QLPT.enums.HanhDongTinDang;
public record LichSuTinDangResponse(Integer id,Integer phienBan,HanhDongTinDang hanhDong,
 String nguoiThucHien,String lyDo,LocalDateTime thoiDiem) {}
