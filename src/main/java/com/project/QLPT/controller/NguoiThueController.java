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

import com.project.QLPT.dto.request.NguoiThueRequest;
import com.project.QLPT.dto.response.NguoiThueResponse;
import com.project.QLPT.service.NguoiThueService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller cung cấp các API quản lý người thuê.
 *
 * <p>
 * Hỗ trợ các chức năng thêm mới, xem danh sách, xem chi tiết,
 * cập nhật, tìm kiếm và xóa người thuê.
 * </p>
 */
@RestController
@RequestMapping("/api/nguoi-thue")
@RequiredArgsConstructor
public class NguoiThueController {

    private final NguoiThueService nguoiThueService;

    /**
     * Tạo mới một người thuê.
     *
     * @param request thông tin người thuê cần tạo
     * @return thông tin người thuê sau khi được tạo
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NguoiThueResponse create(
            @Valid @RequestBody NguoiThueRequest request) {
        return nguoiThueService.create(request);
    }

    /**
     * Lấy thông tin người thuê theo ID.
     *
     * @param id ID của người thuê
     * @return thông tin người thuê tương ứng
     */
    @GetMapping("/{id}")
    public NguoiThueResponse getById(
            @PathVariable Integer id) {
        return nguoiThueService.getById(id);
    }

    /**
     * Lấy danh sách tất cả người thuê.
     *
     * @return danh sách người thuê
     */
    @GetMapping
    public List<NguoiThueResponse> getAll() {
        return nguoiThueService.getAll();
    }

    /**
     * Cập nhật thông tin người thuê.
     *
     * @param id      ID của người thuê cần cập nhật
     * @param request thông tin mới của người thuê
     * @return thông tin người thuê sau khi được cập nhật
     */
    @PutMapping("/{id}")
    public NguoiThueResponse update(
            @PathVariable Integer id,
            @Valid @RequestBody NguoiThueRequest request) {
        return nguoiThueService.update(id, request);
    }

    /**
     * Tìm kiếm người thuê theo tên.
     *
     * @param ten tên hoặc một phần tên của người thuê cần tìm
     * @return danh sách người thuê phù hợp với từ khóa tìm kiếm
     */
    @GetMapping("/search")
    public List<NguoiThueResponse> search(
            @RequestParam String ten) {
        return nguoiThueService.searchByName(ten);
    }

    /**
     * Xóa người thuê theo ID.
     *
     * @param id ID của người thuê cần xóa
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        nguoiThueService.delete(id);
    }
}