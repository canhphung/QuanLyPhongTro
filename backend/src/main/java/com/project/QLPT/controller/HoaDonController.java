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

import com.project.QLPT.dto.request.HoaDonRequest;
import com.project.QLPT.dto.response.HoaDonResponse;
import com.project.QLPT.enums.TrangThaiHoaDon;
import com.project.QLPT.service.HoaDonService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller cung cấp các API quản lý hóa đơn.
 *
 * <p>
 * Hỗ trợ tạo hóa đơn theo kỳ thanh toán, xem danh sách, xem chi tiết,
 * lọc theo hợp đồng hoặc trạng thái, cập nhật và xóa hóa đơn.
 * Mỗi hóa đơn được tạo ra theo chuẩn REST kèm endpoint quản lý
 * dòng chi tiết riêng tại {@code /api/hoa-don/{id}/chi-tiet}.
 * </p>
 */
@RestController
@RequestMapping("/api/hoa-don")
@RequiredArgsConstructor
public class HoaDonController {

    private final HoaDonService hoaDonService;

    /**
     * Tạo mới một hóa đơn.
     *
     * @param request thông tin hóa đơn cần tạo
     * @return thông tin hóa đơn sau khi được tạo
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HoaDonResponse create(
            @Valid @RequestBody HoaDonRequest request) {
        return hoaDonService.create(request);
    }

    /**
     * Lấy thông tin hóa đơn theo ID kèm đầy đủ dòng chi tiết.
     *
     * @param id ID của hóa đơn
     * @return thông tin hóa đơn tương ứng
     */
    @GetMapping("/{id}")
    public HoaDonResponse getById(
            @PathVariable Integer id) {
        return hoaDonService.getById(id);
    }

    /**
     * Lấy danh sách hóa đơn, có thể lọc theo trạng thái thanh toán.
     *
     * @param trangThai trạng thái cần lọc (tùy chọn)
     * @return danh sách hóa đơn
     */
    @GetMapping
    public List<HoaDonResponse> getAll(
            @RequestParam(required = false) TrangThaiHoaDon trangThai) {

        if (trangThai != null) {
            return hoaDonService.getByTrangThai(trangThai);
        }

        return hoaDonService.getAll();
    }

    /**
     * Lấy danh sách hóa đơn của một hợp đồng.
     *
     * @param hopDongId ID của hợp đồng
     * @return danh sách hóa đơn của hợp đồng
     */
    @GetMapping("/hop-dong/{hopDongId}")
    public List<HoaDonResponse> getByHopDong(
            @PathVariable Integer hopDongId) {
        return hoaDonService.getByHopDong(hopDongId);
    }

    /**
     * Cập nhật thông tin hóa đơn.
     *
     * @param id      ID của hóa đơn cần cập nhật
     * @param request thông tin mới của hóa đơn
     * @return thông tin hóa đơn sau khi được cập nhật
     */
    @PutMapping("/{id}")
    public HoaDonResponse update(
            @PathVariable Integer id,
            @Valid @RequestBody HoaDonRequest request) {
        return hoaDonService.update(id, request);
    }

    /**
     * Xóa hóa đơn theo ID.
     *
     * @param id ID của hóa đơn cần xóa
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        hoaDonService.delete(id);
    }
}