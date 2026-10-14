package com.project.QLPT.service;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.project.QLPT.dto.request.DangKyRequest;
import com.project.QLPT.dto.response.TaiKhoanResponse;
import com.project.QLPT.entity.*;
import com.project.QLPT.enums.VaiTroTaiKhoan;
import com.project.QLPT.repository.*;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final TaiKhoanRepository taiKhoanRepository;
    private final ChuTroRepository chuTroRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentAccountService currentAccount;

    @Transactional
    public TaiKhoanResponse register(DangKyRequest request) {
        if (request.vaiTro() != VaiTroTaiKhoan.CHU_TRO
                && request.vaiTro() != VaiTroTaiKhoan.NGUOI_THUE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không được tự đăng ký ADMIN");
        }
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu tối đa 72 byte UTF-8");
        }
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (taiKhoanRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được sử dụng");
        }
        TaiKhoan account = TaiKhoan.builder()
            .email(email).hoTen(request.hoTen().trim())
            .matKhauHash(passwordEncoder.encode(request.password()))
            .hoatDong(true).vaiTros(Set.of(request.vaiTro())).build();
        account = taiKhoanRepository.saveAndFlush(account);
        if (request.vaiTro() == VaiTroTaiKhoan.CHU_TRO) {
            chuTroRepository.save(ChuTro.builder()
                .taiKhoan(account).tenHienThi(account.getHoTen()).build());
        }
        return toResponse(account);
    }

    @Transactional(readOnly = true)
    public TaiKhoanResponse me() { return toResponse(currentAccount.getTaiKhoan()); }

    private TaiKhoanResponse toResponse(TaiKhoan account) {
        return new TaiKhoanResponse(account.getId(), account.getEmail(),
            account.getHoTen(), Set.copyOf(account.getVaiTros()));
    }
}
