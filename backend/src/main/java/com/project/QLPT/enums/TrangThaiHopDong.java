package com.project.QLPT.enums;

/**
 * Enum biểu diễn trạng thái của hợp đồng thuê phòng.
 */
public enum TrangThaiHopDong {

    /**
     * Hợp đồng đang có hiệu lực.
     */
    DANG_HIEU_LUC,

    /**
     * Đã quá ngày kết thúc theo hợp đồng nhưng chưa ghi nhận trả phòng; người thuê vẫn đang ở.
     * Cần gia hạn (sửa ngày kết thúc) hoặc kết thúc hợp đồng.
     */
    HET_HAN,

    /**
     * Hợp đồng đã bị hủy.
     */
    DA_HUY,

    /**
     * Hợp đồng đã kết thúc.
     */
    DA_KET_THUC
}
