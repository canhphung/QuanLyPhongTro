package com.project.QLPT.dto.request;
import jakarta.validation.constraints.*;
public record TinDangActionRequest(@NotNull @PositiveOrZero Integer phienBan, @Size(max=1000) String lyDo) {}
