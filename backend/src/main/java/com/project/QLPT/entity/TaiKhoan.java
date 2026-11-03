package com.project.QLPT.entity;

import java.util.HashSet;
import java.util.Set;
import com.project.QLPT.enums.VaiTroTaiKhoan;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tai_khoan", uniqueConstraints = {
    @UniqueConstraint(name = "uk_tai_khoan_email", columnNames = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaiKhoan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "email", nullable = false, length = 254)
    private String email;

    // Chỉ lưu mật khẩu đã hash; không trả entity qua API.
    @Column(name = "mat_khau_hash", nullable = false, length = 255)
    private String matKhauHash;

    @Column(name = "ho_ten", nullable = false, length = 255)
    private String hoTen;

    @Column(name = "hoat_dong", nullable = false)
    @Builder.Default
    private Boolean hoatDong = true;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "tai_khoan_vai_tro",
        joinColumns = @JoinColumn(name = "tai_khoan_id"),
        uniqueConstraints = @UniqueConstraint(
            name = "uk_tai_khoan_vai_tro",
            columnNames = {"tai_khoan_id", "vai_tro"}))
    @Enumerated(EnumType.STRING)
    @Column(name = "vai_tro", nullable = false, length = 30)
    @Builder.Default
    private Set<VaiTroTaiKhoan> vaiTros = new HashSet<>();
}

