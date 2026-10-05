package com.project.QLPT.controller;

import com.project.QLPT.dto.request.NguoiThueRequest;
import com.project.QLPT.dto.response.NguoiThueResponse;
import com.project.QLPT.service.NguoiThueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nguoi-thue")
@RequiredArgsConstructor
public class NguoiThueController {

    private final NguoiThueService nguoiThueService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NguoiThueResponse create(
            @Valid @RequestBody NguoiThueRequest request
    ) {
        return nguoiThueService.create(request);
    }

    @GetMapping("/{id}")
    public NguoiThueResponse getById(
            @PathVariable Integer id
    ) {
        return nguoiThueService.getById(id);
    }

    @GetMapping
    public List<NguoiThueResponse> getAll() {
        return nguoiThueService.getAll();
    }

    @PutMapping("/{id}")
    public NguoiThueResponse update(
            @PathVariable Integer id,
            @Valid @RequestBody NguoiThueRequest request
    ) {
        return nguoiThueService.update(id, request);
    }

    @GetMapping("/search")
    public List<NguoiThueResponse> search(
            @RequestParam String ten
    ) {
        return nguoiThueService.searchByName(ten);
    }
}