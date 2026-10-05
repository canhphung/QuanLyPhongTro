package com.project.QLPT.enums;

/**
 * Enum biểu diễn trạng thái thanh toán của hóa đơn.
 */
public enum TrangThaiHoaDon {

    /**
     * Hóa đơn chưa được thanh toán.
     */
    CHUA_THANH_TOAN,

    /**
     * Hóa đơn đã được thanh toán một phần.
     */
    THANH_TOAN_MOT_PHAN,

    /**
     * Hóa đơn đã được thanh toán đầy đủ.
     */
    DA_THANH_TOAN
}