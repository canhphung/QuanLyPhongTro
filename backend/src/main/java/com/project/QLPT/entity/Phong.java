package com.project.QLPT.entity;

import java.math.BigDecimal;

import com.project.QLPT.enums.TrangThaiPhong;

import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(
    name = "phong",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_phong_nha_tro_so_phong",
            columnNames = {"nha_tro_id", "so_phong"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Phong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "so_phong", nullable = false, length = 50)
    private String soPhong;

    @Column(
        name = "dien_tich",
        nullable = false,
        precision = 10,
        scale = 2
    )
    private BigDecimal dienTich;

    @Column(
        name = "gia_thue",
        nullable = false,
        precision = 19,
        scale = 0
    )
    private BigDecimal giaThue;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 30)
    private TrangThaiPhong trangThai;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nha_tro_id", nullable = false)
    private NhaTro nhaTro;
}
