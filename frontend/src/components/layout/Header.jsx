import { isAdmin } from "../../utils/managementNavigation";
import { Link } from "react-router-dom";
import { useIsMutating } from "@tanstack/react-query";
import useAccount from "../../hooks/useAccount";
import useLogout from "../../hooks/useLogout";
import getErrorMessage from "../../utils/getErrorMessage";
export default function Header() {
  const { data: account } = useAccount();
  const logout = useLogout();
  const writing = useIsMutating();
  return <header className="border-b bg-white px-4 py-4 sm:px-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">Hệ thống quản lý phòng trọ</h2>
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/tai-khoan" className="text-sm text-blue-700">{account?.hoTen} · {isAdmin(account) ? "Quản trị viên" : "Chủ trọ"}</Link>
        <button className="rounded border px-3 py-2 disabled:opacity-50" disabled={writing > 0}
          onClick={() => logout.mutate()}>{logout.isPending ? "Đang đăng xuất..." : "Đăng xuất"}</button>
      </div>
    </div>
    {logout.isError && <p role="alert" className="mt-2 text-red-600">{getErrorMessage(logout.error, "Không thể đăng xuất")}</p>}
  </header>;
}
