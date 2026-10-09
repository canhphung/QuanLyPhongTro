package com.project.QLPT.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Cấu hình Web dùng chung cho toàn bộ ứng dụng.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

  /**
   * Cấu hình CORS cho các REST API.
   *
   * Cho phép frontend React chạy tại localhost:5173
   * gọi các API có đường dẫn bắt đầu bằng /api/.
   */
  @Override
  public void addCorsMappings(CorsRegistry registry) {

    registry.addMapping("/api/**")
        //Địa chỉ frontend
        .allowedOrigins("http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "http://localhost:5174",
                        "http://127.0.0.1:5174")
        .allowedMethods(
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH",
            "OPTIONS")
        .allowedHeaders("*")
        .maxAge(3600);
  }
}