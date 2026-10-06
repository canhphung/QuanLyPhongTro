
package com.project.QLPT.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "chi_tiet_hoa_don")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietHoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hoa_don_id", nullable = false)
    private HoaDon hoaDon;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dich_vu_id", nullable = false)
    private DichVu dichVu;

    @Column(name = "chi_so_cu", precision = 19, scale = 3)
    private BigDecimal chiSoCu;

    @Column(name = "chi_so_moi", precision = 19, scale = 3)
    private BigDecimal chiSoMoi;

    @Column(
        name = "so_luong",
        nullable = false,
        precision = 19,
        scale = 3
    )
    private BigDecimal soLuong;

    @Column(
        name = "don_gia",
        nullable = false,
        precision = 19,
        scale = 0
    )
    private BigDecimal donGia;
}
