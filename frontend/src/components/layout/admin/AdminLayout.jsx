import { Link, Outlet } from "react-router-dom";
import Header from "../Header";
import useAccount from "../../../hooks/useAccount";
import { isOwner } from "../../../utils/managementNavigation";
export default function AdminLayout() {
  const { data: account } = useAccount();
  return <div className="min-h-screen bg-gray-100">
    <Header />
    <nav aria-label="Quản trị viên" className="flex flex-wrap gap-4 bg-slate-900 px-6 py-3 text-white">
      <Link to="/admin/tin-dang">Kiểm duyệt tin đăng</Link>
      <Link to="/tai-khoan">Tài khoản</Link>
      {isOwner(account) && <Link to="/dashboard">Quản lý chủ trọ</Link>}
    </nav>
    <main className="mx-auto max-w-6xl p-4 sm:p-6"><Outlet /></main>
  </div>;
}
