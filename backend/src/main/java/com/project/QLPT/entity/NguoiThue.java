package com.project.QLPT.entity;

import java.time.LocalDate;

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

/**
 * Entity đại diện cho người thuê trong hệ thống quản lý phòng trọ.
 *
 * <p>
 * Lưu trữ các thông tin cá nhân cơ bản của người thuê như
 * họ tên, căn cước công dân, số điện thoại, ngày sinh và
 * địa chỉ thường trú.
 * </p>
 *
 * <p>
 * CCCD duy nhất trong phạm vi một chủ trọ.
 * </p>
 */
@Entity
@Table(name = "nguoi_thue", uniqueConstraints = {
        @UniqueConstraint(name = "uk_nguoi_thue_chu_tro_cccd", columnNames = {"chu_tro_id", "cccd"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NguoiThue {

    /**
     * Mã định danh của người thuê.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * Họ và tên của người thuê.
     */
    @Column(name = "ho_ten", nullable = false)
    private String hoTen;

    /**
     * Số căn cước công dân của người thuê.
     *
     * <p>
     * Giá trị này là duy nhất trong phạm vi chủ trọ.
     * </p>
     */
    @Column(name = "cccd", nullable = false, length = 20)
    private String cccd;

    /**
     * Số điện thoại liên hệ của người thuê.
     */
    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    /**
     * Ngày sinh của người thuê.
     */
    @Column(name = "ngay_sinh")
    private LocalDate ngaySinh;

    /**
     * Địa chỉ thường trú của người thuê.
     */
    @Column(name = "dia_chi_thuong_tru", length = 500)
    private String diaChiThuongTru;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chu_tro_id", nullable = false)
    private ChuTro chuTro;

    // Liên kết sau khi xác minh danh tính; không tự ghép theo CCCD/email.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tai_khoan_id")
    private TaiKhoan taiKhoan;
}

