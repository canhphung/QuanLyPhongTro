package com.project.QLPT.entity.id;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ThanhVienHopDongId implements Serializable {

    @Column(name = "hop_dong_id")
    private Integer hopDongId;

    @Column(name = "nguoi_thue_id")
    private Integer nguoiThueId;
}