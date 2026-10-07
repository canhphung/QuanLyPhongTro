package com.project.QLPT.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.project.QLPT.dto.request.ChiTietHoaDonRequest;
import com.project.QLPT.dto.response.ChiTietHoaDonResponse;
import com.project.QLPT.service.ChiTietHoaDonService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller cung cấp các API quản lý chi tiết hóa đơn.
 *
 * <p>
 * Các API được đặt lồng theo hóa đơn cha để phản ánh đúng quan hệ:
 * mỗi dòng chi tiết luôn thuộc về một hóa đơn
 * ({@code /api/hoa-don/{hoaDonId}/chi-tiet}).
 * </p>
 */
@RestController
@RequestMapping("/api/hoa-don/{hoaDonId}/chi-tiet")
@RequiredArgsConstructor
public class ChiTietHoaDonController {

    private final ChiTietHoaDonService chiTietHoaDonService;

    /**
     * Thêm một dòng chi tiết (dịch vụ) vào hóa đơn.
     *
     * @param hoaDonId ID của hóa đơn chứa dòng chi tiết
     * @param request  thông tin dòng chi tiết cần thêm
     * @return thông tin dòng chi tiết sau khi được tạo
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ChiTietHoaDonResponse create(
            @PathVariable Integer hoaDonId,
            @Valid @RequestBody ChiTietHoaDonRequest request) {
        return chiTietHoaDonService.create(hoaDonId, request);
    }

    /**
     * Lấy danh sách dòng chi tiết của một hóa đơn.
     *
     * @param hoaDonId ID của hóa đơn
     * @return danh sách dòng chi tiết của hóa đơn
     */
    @GetMapping
    public List<ChiTietHoaDonResponse> getByHoaDon(
            @PathVariable Integer hoaDonId) {
        return chiTietHoaDonService.getByHoaDon(hoaDonId);
    }

    /**
     * Cập nhật một dòng chi tiết trong hóa đơn.
     *
     * @param hoaDonId  ID của hóa đơn chứa dòng chi tiết
     * @param id        ID của dòng chi tiết cần cập nhật
     * @param request   thông tin mới của dòng chi tiết
     * @return thông tin dòng chi tiết sau khi được cập nhật
     */
    @PutMapping("/{id}")
    public ChiTietHoaDonResponse update(
            @PathVariable Integer hoaDonId,
            @PathVariable Integer id,
            @Valid @RequestBody ChiTietHoaDonRequest request) {
        return chiTietHoaDonService.update(hoaDonId, id, request);
    }

    /**
     * Xóa một dòng chi tiết khỏi hóa đơn.
     *
     * @param hoaDonId ID của hóa đơn chứa dòng chi tiết
     * @param id       ID của dòng chi tiết cần xóa
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Integer hoaDonId,
            @PathVariable Integer id) {
        chiTietHoaDonService.delete(hoaDonId, id);
    }
}