package com.project.QLPT.security;

import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.transaction.annotation.Transactional;
import com.project.QLPT.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaiKhoanUserDetailsService implements UserDetailsService {
    private final TaiKhoanRepository repository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) {
        var account = repository.findByEmailIgnoreCase(
            email.trim().toLowerCase(Locale.ROOT)
        ).orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản"));
        return User.withUsername(account.getEmail())
            .password(account.getMatKhauHash())
            .disabled(!Boolean.TRUE.equals(account.getHoatDong()))
            .authorities(account.getVaiTros().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name())).toList())
            .build();
    }
}
