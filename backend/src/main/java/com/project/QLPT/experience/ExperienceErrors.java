package com.project.QLPT.experience;

import java.time.format.DateTimeParseException;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice(basePackageClasses = ExperienceController.class)
public class ExperienceErrors {
  @ExceptionHandler(ResponseStatusException.class)
  ResponseEntity<?> status(ResponseStatusException e) {
    return ResponseEntity.status(e.getStatusCode())
        .body(Map.of("message", e.getReason() == null ? "Yêu cầu không hợp lệ." : e.getReason()));
  }

  @ExceptionHandler({IllegalArgumentException.class, DateTimeParseException.class})
  ResponseEntity<?> invalid(RuntimeException e) {
    return ResponseEntity.badRequest()
        .body(Map.of("message", "Giá trị, ngày hoặc định dạng gửi lên không hợp lệ."));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  ResponseEntity<?> conflict(DataIntegrityViolationException e) {
    return ResponseEntity.status(409)
        .body(
            Map.of(
                "message",
                "Dữ liệu bị trùng hoặc đang được sử dụng. Vui lòng tải lại và kiểm tra các bản ghi"
                    + " liên quan."));
  }
}
