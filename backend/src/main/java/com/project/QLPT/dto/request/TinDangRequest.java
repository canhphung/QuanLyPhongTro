package com.project.QLPT.dto.request;
import java.math.BigDecimal;
import java.util.List;
import jakarta.validation.constraints.*;
public record TinDangRequest(
 @NotNull @Positive Integer phongId,
 @NotBlank @Size(max=255) String tieuDe,
 @NotBlank @Size(max=8000) String moTa,
 @NotNull @Positive @Digits(integer=19,fraction=0) BigDecimal giaThue,
 @NotBlank @Size(max=30) @Pattern(regexp="^[0-9+(). \\-]{8,30}$",message="Số liên hệ phải có 8–30 ký tự số/định dạng điện thoại") String soDienThoaiLienHe,
 @NotNull @Size(max=10) List<@NotBlank @Size(max=2048) String> anhUrls,
 @PositiveOrZero Integer phienBan
) {}
