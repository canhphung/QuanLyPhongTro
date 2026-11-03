package com.project.QLPT.entity;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.project.QLPT.enums.TrangThaiTinDang;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="tin_dang", uniqueConstraints=@UniqueConstraint(name="uk_tin_dang_phong",columnNames="phong_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TinDang {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="phong_id",nullable=false) private Phong phong;
 @Version @Column(name="phien_ban",nullable=false) private Integer phienBan;
 @Column(name="tieu_de",nullable=false,length=255) private String tieuDe;
 @Column(name="mo_ta",nullable=false,length=8000) private String moTa;
 @Column(name="gia_thue",nullable=false,precision=19,scale=0) private BigDecimal giaThue;
 @Column(name="dien_tich",nullable=false,precision=10,scale=2) private BigDecimal dienTich;
 @Column(name="dia_chi",nullable=false,length=500) private String diaChi;
 @Column(name="so_dien_thoai_lien_he",nullable=false,length=30) private String soDienThoaiLienHe;
 @Enumerated(EnumType.STRING) @Column(name="trang_thai",nullable=false,length=30) private TrangThaiTinDang trangThai;
 @Column(name="ly_do",length=1000) private String lyDo;
 @Column(name="ngay_tao",nullable=false) private LocalDateTime ngayTao;
 @Column(name="ngay_cap_nhat",nullable=false) private LocalDateTime ngayCapNhat;
 @Column(name="ngay_gui_duyet") private LocalDateTime ngayGuiDuyet;
 @Column(name="ngay_duyet") private LocalDateTime ngayDuyet;
 @ElementCollection
 @CollectionTable(name="tin_dang_anh",joinColumns=@JoinColumn(name="tin_dang_id"))
 @OrderColumn(name="thu_tu",nullable=false)
 @Column(name="url",nullable=false,length=2048)
 @Builder.Default private List<String> anhUrls=new ArrayList<>();
}
