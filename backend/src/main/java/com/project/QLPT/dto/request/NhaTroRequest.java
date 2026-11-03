package com.project.QLPT.dto.request;

import jakarta.validation.constraints.*;

public record NhaTroRequest(
    @NotBlank @Size(max = 255) String tenNhaTro,
    @NotBlank @Size(max = 500) String diaChi
) {}
