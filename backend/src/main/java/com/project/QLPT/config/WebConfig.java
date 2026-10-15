package com.project.QLPT.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Cấu hình Web dùng chung cho toàn bộ ứng dụng. */
@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Value("${app.cors.allowed-origins}")
  private String[] allowedOrigins;

  /**
   * Cấu hình CORS cho các REST API.
   *
   * <p>Cho phép frontend React chạy tại localhost:5173 gọi các API có đường dẫn bắt đầu bằng /api/.
   */
  @Override
  public void addCorsMappings(CorsRegistry registry) {

    registry
        .addMapping("/api/**")
        // Địa chỉ frontend
        .allowedOrigins(allowedOrigins)
        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true)
        .maxAge(3600);
  }
}
