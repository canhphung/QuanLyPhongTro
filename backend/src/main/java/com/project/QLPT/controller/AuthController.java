package com.project.QLPT.controller;

import java.util.Map;
import org.springframework.http.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import com.project.QLPT.service.AuthService;
import com.project.QLPT.dto.request.DangKyRequest;
import com.project.QLPT.dto.response.TaiKhoanResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService service;

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken(), "headerName", token.getHeaderName());
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public TaiKhoanResponse register(@Valid @RequestBody DangKyRequest request) {
        return service.register(request);
    }

    @GetMapping("/me")
    public TaiKhoanResponse me() { return service.me(); }

    // Login/logout do filter Spring Security xử lý, không viết controller trùng.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> duplicateEmail(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(Map.of("message", "Không thể tạo tài khoản do dữ liệu trùng"));
    }
}
