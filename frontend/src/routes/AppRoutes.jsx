import { Routes, Route } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";

import DashboardPage from "../pages/Dashboard/DashboardPage";
import PhongPage from "../pages/Phong/PhongPage";
import NguoiThuePage from "../pages/NguoiThue/NguoiThuePage";
import HopDongPage from "../pages/HopDong/HopDongPage";
import HoaDonPage from "../pages/HoaDon/HoaDonPage";
import DichVuPage from "../pages/DichVu/DichVuPage";
import ThanhToanPage from "../pages/ThanhToan/ThanhToanPage";

function AppRoutes() {
  return (
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />

          <Route
              path="/phong"
              element={<PhongPage />}
          />

          <Route
              path="/nguoi-thue"
              element={<NguoiThuePage />}
          />

          <Route
              path="/hop-dong"
              element={<HopDongPage />}
          />

          <Route
              path="/hoa-don"
              element={<HoaDonPage />}
          />
          <Route path="/dich-vu" element={<DichVuPage />} />

          <Route path="/thanh-toan" element={<ThanhToanPage />} />

        </Route>
        



      </Routes>
  );
}

export default AppRoutes;