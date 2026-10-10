package com.project.QLPT.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.project.QLPT.dto.response.DashboardResponse;
import com.project.QLPT.enums.TrangThaiHopDong;
import com.project.QLPT.enums.TrangThaiPhong;
import com.project.QLPT.repository.HopDongRepository;
import com.project.QLPT.repository.NguoiThueRepository;
import com.project.QLPT.repository.PhongRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

  private final PhongRepository phongRepository;
  private final NguoiThueRepository nguoiThueRepository;
  private final HopDongRepository hopDongRepository;

  @Transactional(
      readOnly = true,
      isolation = Isolation.REPEATABLE_READ
  )
  public DashboardResponse getThongKe() {
    return new DashboardResponse(
        phongRepository.count(),
        phongRepository.countByTrangThai(TrangThaiPhong.TRONG),
        phongRepository.countByTrangThai(TrangThaiPhong.DANG_THUE),
        phongRepository.countByTrangThai(TrangThaiPhong.BAO_TRI),
        phongRepository.countByTrangThai(
            TrangThaiPhong.NGUNG_HOAT_DONG
        ),
        nguoiThueRepository.count(),
        hopDongRepository.countByTrangThai(
            TrangThaiHopDong.DANG_HIEU_LUC
        )
    );
  }
}