package com.project.QLPT.controller;
import com.project.QLPT.dto.response.*;
import com.project.QLPT.service.TinDangService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/cong-khai/tin-dang") @RequiredArgsConstructor
public class TinDangCongKhaiController {
 private final TinDangService service;
 @GetMapping public PageResponse<TinDangCongKhaiResponse> list(@RequestParam(defaultValue="0") int page,
  @RequestParam(defaultValue="10") int size,@RequestParam(required=false) String keyword){return service.publicPage(page,size,keyword);}
 @GetMapping("/{id}") public TinDangCongKhaiResponse get(@PathVariable Integer id){return service.publicGet(id);}
}
