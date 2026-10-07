import { Routes, Route } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";

import DashboardPage from "../pages/Dashboard/DashboardPage";
import PhongPage from "../pages/Phong/PhongPage";
import NguoiThuePage from "../pages/NguoiThue/NguoiThuePage";

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
        </Route>
      </Routes>
  );
}

export default AppRoutes;