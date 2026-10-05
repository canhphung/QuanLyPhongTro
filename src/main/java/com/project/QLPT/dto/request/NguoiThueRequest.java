package com.project.QLPT.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

public record NguoiThueRequest(

        @NotBlank(message = "Họ tên không được để trống")
        @Size(max = 255, message = "Họ tên tối đa 255 ký tự")
        String hoTen,

        @NotBlank(message = "CCCD không được để trống")
        @Size(max = 20, message = "CCCD tối đa 20 ký tự")
        String cccd,

        @Size(max = 20, message = "Số điện thoại tối đa 20 ký tự")
        String soDienThoai,

        @PastOrPresent(message = "Ngày sinh không được nằm trong tương lai")
        LocalDate ngaySinh,

        @Size(max = 500, message = "Địa chỉ thường trú tối đa 500 ký tự")
        String diaChiThuongTru
) {
}