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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.project.QLPT.dto.request.DichVuRequest;
import com.project.QLPT.dto.response.DichVuResponse;
import com.project.QLPT.service.DichVuService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller cung cấp các API quản lý dịch vụ.
 *
 * <p>
 * Hỗ trợ các chức năng thêm mới, xem danh sách, xem chi tiết, cập nhật,
 * tìm kiếm và xóa dịch vụ.
 * </p>
 */
@RestController
@RequestMapping("/api/dich-vu")
@RequiredArgsConstructor
public class DichVuController {

    private final DichVuService dichVuService;

    /**
     * Tạo mới một dịch vụ.
     *
     * @param request thông tin dịch vụ cần tạo
     * @return thông tin dịch vụ sau khi được tạo
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DichVuResponse create(
            @Valid @RequestBody DichVuRequest request) {
        return dichVuService.create(request);
    }

    /**
     * Lấy thông tin dịch vụ theo ID.
     *
     * @param id ID của dịch vụ
     * @return thông tin dịch vụ tương ứng
     */
    @GetMapping("/{id}")
    public DichVuResponse getById(
            @PathVariable Integer id) {
        return dichVuService.getById(id);
    }

    /**
     * Lấy danh sách tất cả dịch vụ hoặc chỉ các dịch vụ đang hoạt động.
     *
     * <p>
     * Khi truyền {@code hoatDong=true}, API chỉ trả về các dịch vụ đang
     * hoạt động, thích hợp cho màn hình thêm hóa đơn.
     * </p>
     *
     * @param hoatDong lọc các dịch vụ đang hoạt động (tùy chọn)
     * @return danh sách dịch vụ
     */
    @GetMapping
    public List<DichVuResponse> getAll(
            @RequestParam(required = false) Boolean hoatDong) {

        if (Boolean.TRUE.equals(hoatDong)) {
            return dichVuService.getByDangHoatDong();
        }

        return dichVuService.getAll();
    }

    /**
     * Cập nhật thông tin dịch vụ.
     *
     * @param id      ID của dịch vụ cần cập nhật
     * @param request thông tin mới của dịch vụ
     * @return thông tin dịch vụ sau khi được cập nhật
     */
    @PutMapping("/{id}")
    public DichVuResponse update(
            @PathVariable Integer id,
            @Valid @RequestBody DichVuRequest request) {
        return dichVuService.update(id, request);
    }

    /**
     * Tìm kiếm dịch vụ theo tên.
     *
     * @param ten tên hoặc một phần tên của dịch vụ cần tìm
     * @return danh sách dịch vụ phù hợp với từ khóa tìm kiếm
     */
    @GetMapping("/search")
    public List<DichVuResponse> search(
            @RequestParam String ten) {
        return dichVuService.searchByName(ten);
    }

    /**
     * Xóa dịch vụ theo ID.
     *
     * @param id ID của dịch vụ cần xóa
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        dichVuService.delete(id);
    }
}