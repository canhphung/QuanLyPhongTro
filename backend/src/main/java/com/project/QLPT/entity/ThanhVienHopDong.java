package com.project.QLPT.entity;

import java.time.LocalDate;

import com.project.QLPT.entity.id.ThanhVienHopDongId;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "thanh_vien_hop_dong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThanhVienHopDong {

    @EmbeddedId
    private ThanhVienHopDongId id;

    @MapsId("hopDongId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hop_dong_id", nullable = false)
    private HopDong hopDong;

    @MapsId("nguoiThueId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_thue_id", nullable = false)
    private NguoiThue nguoiThue;

    @Column(name = "ngay_vao", nullable = false)
    private LocalDate ngayVao;

    @Column(name = "ngay_roi")
    private LocalDate ngayRoi;

    @Column(name = "la_dai_dien", nullable = false)
    private Boolean laDaiDien;
}