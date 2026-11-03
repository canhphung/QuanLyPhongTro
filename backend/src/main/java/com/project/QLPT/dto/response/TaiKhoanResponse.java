package com.project.QLPT.dto.response;

import java.util.Set;
import com.project.QLPT.enums.VaiTroTaiKhoan;

public record TaiKhoanResponse(
    Integer id, String email, String hoTen, Set<VaiTroTaiKhoan> vaiTros
) {}
