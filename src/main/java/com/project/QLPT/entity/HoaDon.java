package com.project.QLPT.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.project.QLPT.enums.TrangThaiHoaDon;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "hoa_don",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_hoa_don_hop_dong_ky",
            columnNames = {"hop_dong_id", "ky_thanh_toan"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hop_dong_id", nullable = false)
    private HopDong hopDong;

    @Column(name = "ky_thanh_toan", nullable = false)
    private LocalDate kyThanhToan;

    @Column(name = "ngay_lap", nullable = false)
    private LocalDate ngayLap;

    @Column(name = "han_thanh_toan", nullable = false)
    private LocalDate hanThanhToan;

    @Column(
        name = "tien_phong",
        nullable = false,
        precision = 19,
        scale = 0
    )
    private BigDecimal tienPhong;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 30)
    private TrangThaiHoaDon trangThai;
}