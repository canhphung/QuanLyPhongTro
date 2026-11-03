package com.project.QLPT.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import com.project.QLPT.entity.*;
import com.project.QLPT.enums.VaiTroTaiKhoan;
import com.project.QLPT.repository.*;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CurrentAccountService {
    private final TaiKhoanRepository taiKhoanRepository;
    private final ChuTroRepository chuTroRepository;

    @Transactional(readOnly = true)
    public TaiKhoan getTaiKhoan() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cần đăng nhập");
        }
        var account = taiKhoanRepository.findByEmailIgnoreCase(auth.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (!Boolean.TRUE.equals(account.getHoatDong())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tài khoản bị khóa");
        }
        return account;
    }

    @Transactional(readOnly = true)
    public ChuTro getChuTro() {
        var account = getTaiKhoan();
        if (!account.getVaiTros().contains(VaiTroTaiKhoan.CHU_TRO)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return chuTroRepository.findByTaiKhoan_Id(account.getId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Chưa có hồ sơ chủ trọ"));
    }
}
