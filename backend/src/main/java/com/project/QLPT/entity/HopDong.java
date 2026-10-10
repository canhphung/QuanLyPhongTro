package com.project.QLPT.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.project.QLPT.enums.TrangThaiHopDong;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "hop_dong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HopDong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "phong_id", nullable = false)
    private Phong phong;

    @Column(name = "ngay_bat_dau", nullable = false)
    private LocalDate ngayBatDau;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDate ngayKetThuc;

    @Column(name = "ngay_ket_thuc_thuc_te")
    private LocalDate ngayKetThucThucTe;

    @Column(name = "ly_do_ket_thuc", length = 500)
    private String lyDoKetThuc;

    @Column(
        name = "gia_thue_thoa_thuan",
        nullable = false,
        precision = 19,
        scale = 0
    )
    private BigDecimal giaThueThoaThuan;

    @Column(
        name = "tien_coc",
        nullable = false,
        precision = 19,
        scale = 0
    )
    private BigDecimal tienCoc;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 30)
    private TrangThaiHopDong trangThai;
}