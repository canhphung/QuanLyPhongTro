package com.project.QLPT.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.DispatcherType;

@Configuration
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
            .requestCache(cache -> cache.disable())
            .httpBasic(basic -> basic.disable())
            .authorizeHttpRequests(auth -> auth
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/csrf").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                .requestMatchers("/api/auth/me").authenticated()
                .requestMatchers("/api/nha-tro", "/api/nha-tro/**").hasRole("CHU_TRO")
                .requestMatchers("/api/phong", "/api/phong/**",
                    "/api/hop-dong", "/api/hop-dong/**",
                    "/api/nguoi-thue", "/api/nguoi-thue/**",
                    "/api/dich-vu", "/api/dich-vu/**").hasRole("CHU_TRO")
                // API cũ chưa lọc chủ sở hữu: chặn đến khi chuyển đổi xong.
                .anyRequest().denyAll()
            )
            .exceptionHandling(errors -> errors
                .authenticationEntryPoint((req, res, ex) ->
                    json(res, 401, "{\"message\":\"Cần đăng nhập\"}"))
                .accessDeniedHandler((req, res, ex) ->
                    json(res, 403, "{\"message\":\"Không có quyền hoặc CSRF không hợp lệ\"}"))
            )
            .formLogin(form -> form
                .loginProcessingUrl("/api/auth/login")
                .usernameParameter("email")
                .passwordParameter("password")
                .successHandler((req, res, auth) ->
                    json(res, 200, "{\"message\":\"Đăng nhập thành công\"}"))
                .failureHandler((req, res, ex) ->
                    json(res, 401, "{\"message\":\"Email hoặc mật khẩu không đúng\"}"))
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .deleteCookies("JSESSIONID")
                .logoutSuccessHandler((req, res, auth) ->
                    json(res, 200, "{\"message\":\"Đã đăng xuất\"}"))
                .permitAll()
            );
        return http.build();
    }

    private static void json(HttpServletResponse response, int status, String body)
            throws java.io.IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(body);
    }
}
