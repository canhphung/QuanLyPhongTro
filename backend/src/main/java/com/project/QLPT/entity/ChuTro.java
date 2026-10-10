package com.project.QLPT.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chu_tro", uniqueConstraints = {
    @UniqueConstraint(name = "uk_chu_tro_tai_khoan", columnNames = "tai_khoan_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChuTro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tai_khoan_id", nullable = false, unique = true)
    private TaiKhoan taiKhoan;

    @Column(name = "ten_hien_thi", nullable = false, length = 255)
    private String tenHienThi;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;
}

