package com.project.QLPT.exception;

import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.project.QLPT.controller.*;

/** Giới hạn handler vào các API đã chuyển đổi để không thay đổi nghiệp vụ còn lại. */
@RestControllerAdvice(assignableTypes = {PhongController.class, NguoiThueController.class,
    DichVuController.class, HopDongController.class, ThanhVienHopDongController.class})
public class OwnerDataExceptionHandler {
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(DataIntegrityViolationException ex) {
        return ResponseEntity.status(409).body(Map.of("status", 409,
            "message", "Dữ liệu bị trùng hoặc đang được sử dụng; hãy tải lại và kiểm tra"));
    }
}
