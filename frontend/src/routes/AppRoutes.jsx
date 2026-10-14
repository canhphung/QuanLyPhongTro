import { Navigate, Routes, Route } from "react-router-dom";
import TaiKhoanPage from "../pages/Auth/TaiKhoanPage";
import MainLayout from "../components/layout/MainLayout";
import RequireOwner from "./RequireOwner";
import PhongPage from "../pages/Phong/PhongPage";
import NguoiThuePage from "../pages/NguoiThue/NguoiThuePage";
import HoaDonPage from "../pages/HoaDon/HoaDonPage";
import HopDongPage from "../pages/HopDong/HopDongPage";
import DichVuPage from "../pages/DichVu/DichVuPage";

import ThanhToanPage from "../pages/ThanhToan/ThanhToanPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tai-khoan" replace />} />
      <Route path="/tai-khoan" element={<TaiKhoanPage />} />
      <Route element={<RequireOwner />}>
        <Route element={<MainLayout />}>
          <Route path="/phong" element={<PhongPage />} />
          <Route path="/nguoi-thue" element={<NguoiThuePage />} />
          <Route path="/dich-vu" element={<DichVuPage />} />
          <Route path="/hop-dong" element={<HopDongPage />} />
          <Route path="/hoa-don" element={<HoaDonPage />} />
          <Route path="/thanh-toan" element={<ThanhToanPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/tai-khoan" replace />} />
    </Routes>
  );
}
