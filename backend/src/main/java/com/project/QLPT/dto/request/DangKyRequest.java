package com.project.QLPT.dto.request;

import com.project.QLPT.enums.VaiTroTaiKhoan;
import jakarta.validation.constraints.*;

public record DangKyRequest(
    @NotBlank @Email @Size(max = 254) String email,
    @NotBlank @Size(min = 8, max = 72) String password,
    @NotBlank @Size(max = 255) String hoTen,
    @NotNull VaiTroTaiKhoan vaiTro
) {}
