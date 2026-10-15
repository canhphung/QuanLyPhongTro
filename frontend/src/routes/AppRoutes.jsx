import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import PublicLayout, { ScrollToTop } from "../experience/PublicLayout";
import HomePage from "../experience/HomePage";
import { RoomSearchPage, RoomDetailPage } from "../experience/ExplorePages";
import {
  AuthPage,
  RequireAccount,
  AccountLayout,
  ProfilePage,
  MyRequestsPage,
  MyContractsPage,
  MyInvoicesPage,
  MyPaymentsPage,
} from "../experience/AccountPages";
import { OwnerLayout, OwnerDashboard } from "../experience/OwnerPages";
import OwnerCollectionPage from "../experience/OwnerCollection";
import { ApiProvider } from "../experience/ApiProvider";
import { EmptyState } from "../experience/ui";

const collections = [
  "nha-tro",
  "phong",
  "nguoi-thue",
  "dich-vu",
  "hop-dong",
  "hoa-don",
  "thanh-toan",
  "tin-dang",
];
function NotFound() {
  return (
    <div className="page-container not-found">
      <EmptyState
        title="Mình đi lạc một chút rồi"
        message="Trang này không còn ở đây. Quay lại để tìm một căn phòng nhé."
        action={
          <Link className="button" to="/">
            Về trang chủ
          </Link>
        }
      />
    </div>
  );
}
export default function AppRoutes() {
  const { search } = useLocation();
  return (
    <ApiProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tim-phong" element={<RoomSearchPage />} />
          <Route path="yeu-thich" element={<RoomSearchPage savedOnly />} />
          <Route path="phong-tro/:id" element={<RoomDetailPage />} />
          <Route path="dang-nhap" element={<AuthPage />} />
          <Route path="dang-ky" element={<AuthPage register />} />
          <Route
            path="tai-khoan"
            element={
              <RequireAccount>
                <AccountLayout />
              </RequireAccount>
            }
          >
            <Route index element={<ProfilePage />} />
            <Route path="yeu-cau" element={<MyRequestsPage />} />
            <Route path="hop-dong" element={<MyContractsPage />} />
            <Route path="hoa-don" element={<MyInvoicesPage />} />
            <Route path="thanh-toan" element={<MyPaymentsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route
          path="chu-tro"
          element={
            <RequireAccount owner>
              <OwnerLayout />
            </RequireAccount>
          }
        >
          <Route index element={<Navigate to="tong-quan" replace />} />
          <Route path="tong-quan" element={<OwnerDashboard />} />
          {collections.map((section) => (
            <Route
              path={section}
              key={section}
              element={
                <OwnerCollectionPage
                  key={`${section}-${search}`}
                  section={section}
                />
              }
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
        {[
          "phong",
          "nguoi-thue",
          "hop-dong",
          "hoa-don",
          "dich-vu",
          "thanh-toan",
        ].map((path) => (
          <Route
            key={path}
            path={path}
            element={<Navigate to={`/chu-tro/${path}`} replace />}
          />
        ))}
      </Routes>
    </ApiProvider>
  );
}
