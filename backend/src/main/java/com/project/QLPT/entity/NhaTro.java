package com.project.QLPT.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "nha_tro")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhaTro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chu_tro_id", nullable = false)
    private ChuTro chuTro;

    @Column(name = "ten_nha_tro", nullable = false, length = 255)
    private String tenNhaTro;

    @Column(name = "dia_chi", nullable = false, length = 500)
    private String diaChi;

    @Column(name="active",nullable=false)
    @Builder.Default
    private Boolean active=true;
}

