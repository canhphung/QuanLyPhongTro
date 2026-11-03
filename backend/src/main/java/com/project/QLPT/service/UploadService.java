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

  /** Tối đa số ảnh mỗi lần tải, khớp giới hạn 10 ảnh của một tin đăng. */
  private static final int MAX_FILES = 10;

  public List<String> storeImages(MultipartFile[] files) {
    if (files == null || files.length == 0) {
      throw new BusinessException("Vui lòng chọn ít nhất một hình ảnh.");
    }
    if (files.length > MAX_FILES) {
      throw new BusinessException("Mỗi lần chỉ tải tối đa " + MAX_FILES + " ảnh.");
    }
    List<String> urls = new ArrayList<>();
    for (MultipartFile file : files) {
      if (file == null || file.isEmpty()) continue;
      byte[] bytes;
      try {
        bytes = file.getBytes();
      } catch (IOException e) {
        throw new BusinessException("Không đọc được tệp ảnh.");
      }
      // Xác định định dạng theo nội dung tệp, không tin tên tệp hay Content-Type do client gửi.
      // Không nhận SVG vì SVG có thể chứa script.
      String ext = detectImageExtension(bytes);
      if (ext == null) {
        throw new BusinessException("Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF.");
      }
      String filename = UUID.randomUUID().toString() + ext;
      try {
        Files.write(this.uploadDir.resolve(filename), bytes, StandardOpenOption.CREATE_NEW);
        urls.add("/api/uploads/" + filename);
      } catch (IOException e) {
        throw new BusinessException("Lỗi lưu ảnh: " + e.getMessage());
      }
    }
    if (urls.isEmpty()) {
      throw new BusinessException("Vui lòng chọn ít nhất một hình ảnh.");
    }
    return urls;
  }

  /** Trả về phần mở rộng theo chữ ký đầu tệp, hoặc {@code null} nếu không phải ảnh được hỗ trợ. */
  static String detectImageExtension(byte[] b) {
    if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF)
      return ".jpg";
    if (b.length >= 8
        && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G'
        && b[4] == 0x0D && b[5] == 0x0A && b[6] == 0x1A && b[7] == 0x0A)
      return ".png";
    if (b.length >= 6 && b[0] == 'G' && b[1] == 'I' && b[2] == 'F' && b[3] == '8'
        && (b[4] == '7' || b[4] == '9') && b[5] == 'a')
      return ".gif";
    if (b.length >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
        && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P')
      return ".webp";
    return null;
  }
}
