package com.project.QLPT.controller;
import java.util.List;
import com.project.QLPT.dto.request.TinDangActionRequest;
import com.project.QLPT.dto.response.*;
import com.project.QLPT.enums.TrangThaiTinDang;
import com.project.QLPT.service.TinDangService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/admin/tin-dang") @RequiredArgsConstructor
public class AdminTinDangController {
 private final TinDangService service;
 @GetMapping public PageResponse<TinDangResponse> list(@RequestParam(defaultValue="0") int page,
  @RequestParam(defaultValue="10") int size,@RequestParam(required=false) TrangThaiTinDang trangThai,
  @RequestParam(required=false) String keyword){return service.adminPage(page,size,trangThai,keyword);}
 @GetMapping("/{id}") public TinDangResponse get(@PathVariable Integer id){return service.adminGet(id);}
 @GetMapping("/{id}/lich-su") public List<LichSuTinDangResponse> history(@PathVariable Integer id){return service.adminHistory(id);}
 @PatchMapping("/{id}/duyet") public TinDangResponse approve(@PathVariable Integer id,@Valid @RequestBody TinDangActionRequest request){return service.approve(id,request);}
 @PatchMapping("/{id}/tu-choi") public TinDangResponse reject(@PathVariable Integer id,@Valid @RequestBody TinDangActionRequest request){return service.reject(id,request);}
 @PatchMapping("/{id}/an") public TinDangResponse hide(@PathVariable Integer id,@Valid @RequestBody TinDangActionRequest request){return service.hideAdmin(id,request);}
}
