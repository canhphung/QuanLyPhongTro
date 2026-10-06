package com.project.QLPT.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.project.QLPT.dto.request.ThanhVienHopDongRequest;
import com.project.QLPT.dto.response.ThanhVienHopDongResponse;
import com.project.QLPT.service.ThanhVienHopDongService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/hop-dong/{hopDongId}/thanh-vien")
@RequiredArgsConstructor
public class ThanhVienHopDongController {

    private final ThanhVienHopDongService thanhVienHopDongService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ThanhVienHopDongResponse create(@PathVariable Integer hopDongId,
            @Valid @RequestBody ThanhVienHopDongRequest request) {
        return thanhVienHopDongService.create(hopDongId, request);
    }

    // dangO=true: thành viên chưa có ngày rời; bỏ qua/false: toàn bộ lịch sử.
    @GetMapping
    public List<ThanhVienHopDongResponse> getByHopDong(@PathVariable Integer hopDongId,
            @RequestParam(required = false) Boolean dangO) {
        return thanhVienHopDongService.getByHopDong(hopDongId, Boolean.TRUE.equals(dangO));
    }

    @GetMapping("/{nguoiThueId}")
    public ThanhVienHopDongResponse getById(@PathVariable Integer hopDongId,
            @PathVariable Integer nguoiThueId) {
        return thanhVienHopDongService.getById(hopDongId, nguoiThueId);
    }

    @PutMapping("/{nguoiThueId}")
    public ThanhVienHopDongResponse update(@PathVariable Integer hopDongId,
            @PathVariable Integer nguoiThueId,
            @Valid @RequestBody ThanhVienHopDongRequest request) {
        return thanhVienHopDongService.update(hopDongId, nguoiThueId, request);
    }

    @DeleteMapping("/{nguoiThueId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer hopDongId, @PathVariable Integer nguoiThueId) {
        thanhVienHopDongService.delete(hopDongId, nguoiThueId);
    }
}
