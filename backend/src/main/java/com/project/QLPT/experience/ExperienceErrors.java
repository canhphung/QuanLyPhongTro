
package com.project.QLPT.experience;

import java.time.format.DateTimeParseException;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice(basePackageClasses = ExperienceController.class)
public class ExperienceErrors {

    private static final Logger log =
            LoggerFactory.getLogger(ExperienceErrors.class);

    // Hằng số dùng chung cho key "message"
    private static final String MESSAGE_KEY = "message";

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<?> status(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode())
                .body(Map.of(
                        MESSAGE_KEY,
                        e.getReason() == null
                                ? "Yêu cầu không hợp lệ."
                                : e.getReason()
                ));
    }

    @ExceptionHandler({
        IllegalArgumentException.class,
        DateTimeParseException.class
    })
    ResponseEntity<?> invalid(RuntimeException e) {

        // Ghi chi tiết lỗi ở server thay vì trả debugError cho client
        log.warn("Dữ liệu gửi lên không hợp lệ: {}", e.getMessage());

        return ResponseEntity.badRequest()
                .body(Map.of(
                        MESSAGE_KEY,
                        "Giá trị, ngày hoặc định dạng gửi lên không hợp lệ."
                ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<?> conflict(DataIntegrityViolationException e) {

        // Ghi lỗi cơ sở dữ liệu ở phía server
        log.warn("Vi phạm ràng buộc dữ liệu trong Experience.", e);

        return ResponseEntity.status(409)
                .body(Map.of(
                        MESSAGE_KEY,
                        "Dữ liệu bị trùng hoặc đang được sử dụng. "
                        + "Vui lòng tải lại và kiểm tra các bản ghi liên quan."
                ));
    }
}
