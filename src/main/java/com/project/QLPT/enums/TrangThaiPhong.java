package com.project.QLPT.enums;

/**
 * Enum biểu diễn trạng thái hiện tại của phòng.
 */
public enum TrangThaiPhong {

    /**
     * Phòng đang trống, chưa có người thuê.
     */
    TRONG,

    /**
     * Phòng đang được thuê.
     */
    DANG_THUE,

    /**
     * Phòng đang được bảo trì.
     */
    BAO_TRI,

    /**
     * Phòng đã ngừng hoạt động và không được sử dụng.
     */
    NGUNG_HOAT_DONG
}