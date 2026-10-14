import { Navigate, Outlet } from "react-router-dom";
import useAccount from "../hooks/useAccount";

export default function RequireOwner() {
  const account = useAccount();
  if (account.isPending) return <p className="p-6">Đang kiểm tra đăng nhập...</p>;
  if (account.isError) return <div className="p-6">
    <p>Không thể kiểm tra phiên đăng nhập.</p>
    <button onClick={() => account.refetch()} className="text-blue-600">Thử lại</button>
  </div>;
  if (!account.data?.vaiTros.includes("CHU_TRO"))
    return <Navigate to="/tai-khoan" replace />;
  // Khi tài khoản đổi ở tab khác, bỏ form/selection của tài khoản trước.
  return <Outlet key={account.data.id} />;
}
