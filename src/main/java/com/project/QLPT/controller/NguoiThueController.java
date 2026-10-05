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

@RestController
@RequestMapping("/api/nguoi-thue")
@RequiredArgsConstructor
public class NguoiThueController {

    private final NguoiThueService nguoiThueService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NguoiThueResponse create(
            @Valid @RequestBody NguoiThueRequest request) {
        return nguoiThueService.create(request);
    }

    @GetMapping("/{id}")
    public NguoiThueResponse getById(
            @PathVariable Integer id) {
        return nguoiThueService.getById(id);
    }

    @GetMapping
    public List<NguoiThueResponse> getAll() {
        return nguoiThueService.getAll();
    }

    @PutMapping("/{id}")
    public NguoiThueResponse update(
            @PathVariable Integer id,
            @Valid @RequestBody NguoiThueRequest request) {
        return nguoiThueService.update(id, request);
    }

    @GetMapping("/search")
    public List<NguoiThueResponse> search(
            @RequestParam String ten) {
        return nguoiThueService.searchByName(ten);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        nguoiThueService.delete(id);
    }
}