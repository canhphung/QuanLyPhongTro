package com.project.QLPT.entity;
import java.time.LocalDateTime;
import com.project.QLPT.enums.HanhDongTinDang;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name="lich_su_tin_dang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LichSuTinDang {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="tin_dang_id",nullable=false) private TinDang tinDang;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="nguoi_thuc_hien_id",nullable=false) private TaiKhoan nguoiThucHien;
 @Column(name="phien_ban",nullable=false) private Integer phienBan;
 @Enumerated(EnumType.STRING) @Column(name="hanh_dong",nullable=false,length=30) private HanhDongTinDang hanhDong;
 @Column(name="ly_do",length=1000) private String lyDo;
 @Column(name="thoi_diem",nullable=false) private LocalDateTime thoiDiem;
}
