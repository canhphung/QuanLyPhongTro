package com.project.QLPT.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.project.QLPT.dto.request.NhaTroRequest;
import com.project.QLPT.dto.response.*;
import com.project.QLPT.service.NhaTroService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/nha-tro")
@RequiredArgsConstructor
public class NhaTroController {
    private final NhaTroService service;
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public NhaTroResponse create(@Valid @RequestBody NhaTroRequest request) {
        return service.create(request);
    }
    @GetMapping
    public PageResponse<NhaTroResponse> list(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) { return service.getPage(page, size); }
    @GetMapping("/{id}")
    public NhaTroResponse get(@PathVariable Integer id) { return service.getById(id); }
    @PutMapping("/{id}")
    public NhaTroResponse update(@PathVariable Integer id,
            @Valid @RequestBody NhaTroRequest request) { return service.update(id, request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) { service.delete(id); }
}
