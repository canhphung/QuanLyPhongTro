package com.project.QLPT.repository.specification;

import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;
import com.project.QLPT.entity.*;
import com.project.QLPT.enums.TrangThaiPhong;
import com.project.QLPT.enums.TrangThaiHopDong;

/** Mọi truy vấn danh sách đều áp dụng quyền sở hữu trước khi phân trang. */
public final class OwnerSpecifications {
    private OwnerSpecifications() {}

    public static Specification<HopDong> hopDong(Integer ownerId, String keyword,
            TrangThaiHopDong trangThai) {
        return (root, query, cb) -> {
            var predicate = cb.and(
                cb.equal(root.get("phong").get("nhaTro").get("chuTro").get("id"), ownerId),
                cb.like(cb.lower(root.get("phong").get("soPhong")), pattern(keyword), '!'));
            if (trangThai != null)
                predicate = cb.and(predicate, cb.equal(root.get("trangThai"), trangThai));
            return predicate;
        };
    }

    private static String pattern(String keyword) {
        String value = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);
        return "%" + value.replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
    }

    public static Specification<Phong> phong(Integer ownerId, Integer nhaTroId,
            String keyword, TrangThaiPhong trangThai) {
        return (root, query, cb) -> {
            var predicate = cb.and(
                cb.equal(root.get("nhaTro").get("chuTro").get("id"), ownerId),
                cb.like(cb.lower(root.get("soPhong")), pattern(keyword), '!'));
            if (nhaTroId != null)
                predicate = cb.and(predicate, cb.equal(root.get("nhaTro").get("id"), nhaTroId));
            if (trangThai != null)
                predicate = cb.and(predicate, cb.equal(root.get("trangThai"), trangThai));
            return predicate;
        };
    }

    public static Specification<NguoiThue> nguoiThue(Integer ownerId, String keyword) {
        return (root, query, cb) -> cb.and(
            cb.equal(root.get("chuTro").get("id"), ownerId),
            cb.like(cb.lower(root.get("hoTen")), pattern(keyword), '!'));
    }

    public static Specification<DichVu> dichVu(Integer ownerId, String keyword, Boolean hoatDong) {
        return (root, query, cb) -> {
            var predicate = cb.and(
                cb.equal(root.get("chuTro").get("id"), ownerId),
                cb.like(cb.lower(root.get("tenDichVu")), pattern(keyword), '!'));
            if (hoatDong != null)
                predicate = cb.and(predicate, cb.equal(root.get("dangHoatDong"), hoatDong));
            return predicate;
        };
    }
}
