package com.project.QLPT.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.project.QLPT.dto.request.ThanhToanRequest;
import com.project.QLPT.dto.response.ThanhToanResponse;
import com.project.QLPT.service.ThanhToanService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/thanh-toan")
@RequiredArgsConstructor
public class ThanhToanController {

    private final ThanhToanService thanhToanService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ThanhToanResponse create(@Valid @RequestBody ThanhToanRequest request) {
        return thanhToanService.create(request);
    }

    @GetMapping("/{id}")
    public ThanhToanResponse getById(@PathVariable Integer id) {
        return thanhToanService.getById(id);
    }

    @GetMapping
    public List<ThanhToanResponse> getAll(@RequestParam(required = false) Integer hoaDonId) {
        return hoaDonId == null
                ? thanhToanService.getAll()
                : thanhToanService.getByHoaDon(hoaDonId);
    }

    @GetMapping("/hoa-don/{hoaDonId}")
    public List<ThanhToanResponse> getByHoaDon(@PathVariable Integer hoaDonId) {
        return thanhToanService.getByHoaDon(hoaDonId);
    }

    @PutMapping("/{id}")
    public ThanhToanResponse update(@PathVariable Integer id,
            @Valid @RequestBody ThanhToanRequest request) {
        return thanhToanService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        thanhToanService.delete(id);
    }
}
