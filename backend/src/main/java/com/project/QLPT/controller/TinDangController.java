package com.project.QLPT.controller;
import java.util.List;
import com.project.QLPT.dto.request.*;
import com.project.QLPT.dto.response.*;
import com.project.QLPT.enums.TrangThaiTinDang;
import com.project.QLPT.service.TinDangService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/tin-dang") @RequiredArgsConstructor
public class TinDangController {
 private final TinDangService service;
 @GetMapping public PageResponse<TinDangResponse> list(@RequestParam(defaultValue="0") int page,
  @RequestParam(defaultValue="10") int size,@RequestParam(required=false) TrangThaiTinDang trangThai,
  @RequestParam(required=false) String keyword){return service.ownerPage(page,size,trangThai,keyword);}
 @GetMapping("/{id}") public TinDangResponse get(@PathVariable Integer id){return service.ownerGet(id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public TinDangResponse create(@Valid @RequestBody TinDangRequest request){return service.create(request);}
 @PutMapping("/{id}") public TinDangResponse update(@PathVariable Integer id,@Valid @RequestBody TinDangRequest request){return service.update(id,request);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Integer id,@RequestParam Integer phienBan){service.delete(id,phienBan);}
 @PatchMapping("/{id}/gui-duyet") public TinDangResponse submit(@PathVariable Integer id,@Valid @RequestBody TinDangActionRequest request){return service.submit(id,request);}
 @PatchMapping("/{id}/rut-duyet") public TinDangResponse withdraw(@PathVariable Integer id,@Valid @RequestBody TinDangActionRequest request){return service.withdraw(id,request);}
 @PatchMapping("/{id}/an") public TinDangResponse hide(@PathVariable Integer id,@Valid @RequestBody TinDangActionRequest request){return service.hideOwner(id,request);}
 @GetMapping("/{id}/lich-su") public List<LichSuTinDangResponse> history(@PathVariable Integer id){return service.ownerHistory(id);}
}
