package com.project.QLPT.service;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.project.QLPT.exception.BusinessException;

@Service
public class UploadService {

  private final Path uploadDir;

  public UploadService(@Value("${app.upload.dir:uploads}") String dir) {
    this.uploadDir = Paths.get(dir).toAbsolutePath().normalize();
    try {
      Files.createDirectories(this.uploadDir);
    } catch (IOException e) {
      throw new RuntimeException("Không thể khởi tạo thư mục lưu trữ ảnh: " + e.getMessage(), e);
    }
  }

  public Path getUploadDir() {
    return this.uploadDir;
  }

  public List<String> storeImages(MultipartFile[] files) {
    if (files == null || files.length == 0) {
      throw new BusinessException("Vui lòng chọn ít nhất một hình ảnh.");
    }
    List<String> urls = new ArrayList<>();
    for (MultipartFile file : files) {
      if (file == null || file.isEmpty()) continue;
      String contentType = file.getContentType();
      if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
        throw new BusinessException("Chỉ chấp nhận tệp hình ảnh (jpg, png, webp, gif...)");
      }
      String originalName = file.getOriginalFilename();
      String ext = "";
      if (originalName != null && originalName.contains(".")) {
        ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
      } else {
        ext = ".jpg";
      }
      // Only allow safe image extensions
      if (!Set.of(".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg").contains(ext)) {
        throw new BusinessException("Định dạng ảnh không được hỗ trợ: " + ext);
      }
      String filename = UUID.randomUUID().toString() + ext;
      try {
        Path target = this.uploadDir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        urls.add("/api/uploads/" + filename);
      } catch (IOException e) {
        throw new BusinessException("Lỗi lưu ảnh: " + e.getMessage());
      }
    }
    return urls;
  }
}
