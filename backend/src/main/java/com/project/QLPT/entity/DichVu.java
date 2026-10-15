package com.project.QLPT.entity;

import java.math.BigDecimal;

import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "dich_vu", uniqueConstraints = @UniqueConstraint(
    name = "uk_dich_vu_chu_tro_ten", columnNames = {"chu_tro_id", "ten_dich_vu"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DichVu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_dich_vu", nullable = false)
    private String tenDichVu;

    @Column(name = "don_vi_tinh", nullable = false, length = 50)
    private String donViTinh;

    @Column(
            name = "don_gia_hien_tai",
            nullable = false,
            precision = 19,
            scale = 0
    )
    private BigDecimal donGiaHienTai;

    @Column(name = "tinh_theo_chi_so", nullable = false)
    private Boolean tinhTheoChiSo;

    @Column(name = "dang_hoat_dong", nullable = false)
    private Boolean dangHoatDong;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chu_tro_id", nullable = false)
    private ChuTro chuTro;
}
