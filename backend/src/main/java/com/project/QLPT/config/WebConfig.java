package com.project.QLPT.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.project.QLPT.service.UploadService;

/** Cấu hình Web dùng chung cho toàn bộ ứng dụng. */
@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Value("${app.cors.allowed-origins}")
  private String[] allowedOrigins;

  private final UploadService uploadService;

  public WebConfig(UploadService uploadService) {
    this.uploadService = uploadService;
  }

  /**
   * Cấu hình CORS cho các REST API.
   *
   * <p>Cho phép frontend React chạy tại localhost:5173/5174 gọi các API có đường dẫn bắt đầu bằng /api/.
   */
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry
        .addMapping("/api/**")
        .allowedOrigins(allowedOrigins)
        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true)
        .maxAge(3600);
  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    String uploadPath = uploadService.getUploadDir().toUri().toString();
    if (!uploadPath.endsWith("/")) {
      uploadPath += "/";
    }
    registry.addResourceHandler("/api/uploads/**")
        .addResourceLocations(uploadPath);
    registry.addResourceHandler("/uploads/**")
        .addResourceLocations(uploadPath);
  }
}
