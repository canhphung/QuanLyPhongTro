import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAccount from "../hooks/useAccount";
import { isAdmin } from "../utils/managementNavigation";
export default function RequireAdmin() {
  const query = useAccount(), location = useLocation();
  if (query.isPending) return <p className="p-6">Đang kiểm tra đăng nhập...</p>;
  if (query.isError) return <div className="p-6"><p>Không thể kiểm tra phiên đăng nhập.</p>
    <button onClick={() => query.refetch()}>Thử lại</button></div>;
  if (!isAdmin(query.data)) return <Navigate to="/tai-khoan" replace
    state={{ from: location.pathname + location.search }} />;
  return <Outlet key={query.data.id} />;
}
