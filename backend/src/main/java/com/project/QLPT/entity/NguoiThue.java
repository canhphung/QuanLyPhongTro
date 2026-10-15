package com.project.QLPT.entity;

import java.time.LocalDate;

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
 * Mỗi người thuê được xác định duy nhất bởi CCCD.
 * </p>
 */
@Entity
@Table(name = "nguoi_thue", uniqueConstraints = {
        @UniqueConstraint(name = "uk_nguoi_thue_cccd", columnNames = "cccd")
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
     * Giá trị này là duy nhất đối với mỗi người thuê.
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
}