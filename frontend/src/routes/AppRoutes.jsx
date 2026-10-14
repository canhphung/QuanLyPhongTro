import TinDangPage from "../pages/owner/TinDang/TinDangPage";
import AdminTinDangPage from "../pages/admin/TinDang/AdminTinDangPage";
import RequireAdmin from "./RequireAdmin";
import AdminLayout from "../components/layout/admin/AdminLayout";
import { Navigate, Routes, Route } from "react-router-dom";
import HomeRedirect from "./HomeRedirect";
import TaiKhoanPage from "../pages/auth/TaiKhoanPage";
import OwnerLayout from "../components/layout/owner/OwnerLayout.jsx";
import RequireOwner from "./RequireOwner";
import PhongPage from "../pages/owner/Phong/PhongPage";
import NguoiThuePage from "../pages/owner/NguoiThue/NguoiThuePage";
import HoaDonPage from "../pages/owner/HoaDon/HoaDonPage";
import HopDongPage from "../pages/owner/HopDong/HopDongPage";
import DichVuPage from "../pages/owner/DichVu/DichVuPage";

import ThanhToanPage from "../pages/owner/ThanhToan/ThanhToanPage";
import DashboardPage from "../pages/owner/Dashboard/DashboardPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/tai-khoan" element={<TaiKhoanPage />} />
      <Route element={<RequireOwner />}>
        <Route element={<OwnerLayout />}>
          <Route path="/tin-dang" element={<TinDangPage />} />
          <Route path="/phong" element={<PhongPage />} />
          <Route path="/nguoi-thue" element={<NguoiThuePage />} />
          <Route path="/dich-vu" element={<DichVuPage />} />
          <Route path="/hop-dong" element={<HopDongPage />} />
          <Route path="/hoa-don" element={<HoaDonPage />} />
          <Route path="/thanh-toan" element={<ThanhToanPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
      <Route element={<RequireAdmin />}><Route element={<AdminLayout />}>
        <Route path="/admin/tin-dang" element={<AdminTinDangPage />} />
      </Route></Route>
      <Route path="*" element={<Navigate to="/tai-khoan" replace />} />
    </Routes>
  );
}
