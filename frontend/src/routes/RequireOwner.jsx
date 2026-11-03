import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAccount from "../hooks/useAccount";
import { isOwner } from "../utils/managementNavigation";
export default function RequireOwner() {
  const account = useAccount(), location = useLocation();
  if (account.isPending) return <p className="p-6">Đang kiểm tra đăng nhập...</p>;
  if (account.isError) return <div className="p-6">
    <p>Không thể kiểm tra phiên đăng nhập.</p>
    <button onClick={() => account.refetch()} className="text-blue-600">Thử lại</button>
  </div>;
  if (!isOwner(account.data))
    return <Navigate to="/tai-khoan" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet key={account.data.id} />;
}
