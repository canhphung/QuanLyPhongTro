import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAccount from "../../../hooks/useAccount.js";
import { getDashboard } from "../../../api/dashboardApi.js";
import { formatMoney } from "../../../utils/decimalValues.js";
import getErrorMessage from "../../../utils/getErrorMessage.js";
const cards = [
  ["tongPhong", "Tổng phòng"], ["phongTrong", "Phòng trống"], ["phongDangThue", "Phòng đang thuê"],
  ["phongBaoTri", "Phòng bảo trì"], ["phongNgungHoatDong", "Phòng ngừng hoạt động"],
  ["tongHoSoNguoiThue", "Hồ sơ người thuê"], ["hopDongDangHieuLuc", "Hợp đồng đang hiệu lực"],
  ["tongHoaDon", "Tổng hóa đơn"], ["hoaDonConNo", "Hóa đơn còn nợ"],
];
export default function DashboardPage() {
  const { data: account } = useAccount();
  const [month, setMonth] = useState("");
  const query = useQuery({ queryKey: ["dashboard", account?.id, month],
    queryFn: ({ signal }) => getDashboard(month, signal), enabled: Boolean(account) });
  const control = "rounded border bg-white px-3 py-2 disabled:opacity-50";
  return <div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex flex-wrap gap-3">
        <label>Tháng thu tiền <input type="month" min="1000-01" max="9999-11" className={control}
          value={month} onChange={(e) => setMonth(e.target.value)} /></label>
        <button className={control} disabled={query.isFetching} onClick={() => query.refetch()}>Làm mới</button>
      </div>
    </div>
    {query.isError ? <p className="text-red-600">{getErrorMessage(query.error, "Không tải được thống kê")}
      <button onClick={() => query.refetch()}>Thử lại</button></p> :
      query.isPending ? <p>Đang tải thống kê...</p> : <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([key, label]) => <div key={key} className="rounded bg-white p-5 shadow">
            <p className="text-gray-500">{label}</p><p className="mt-2 text-3xl font-bold">{query.data[key].toLocaleString("vi-VN")}</p>
          </div>)}
          <div className="rounded bg-white p-5 shadow"><p>Tổng công nợ hiện tại</p>
            <p className="mt-2 text-2xl font-bold text-orange-700">{formatMoney(query.data.tongCongNo)}</p></div>
          <div className="rounded bg-white p-5 shadow"><p>Thực thu tháng {query.data.thang}</p>
            <p className="mt-2 text-2xl font-bold text-green-700">{formatMoney(query.data.daThuTrongThang)}</p></div>
        </div>
        <p className="mt-4 text-sm text-gray-600">Công nợ tính trên mọi hóa đơn còn thiếu, kể cả hợp đồng đã kết thúc.
          Thực thu tính theo ngày nhận tiền trong tháng đã chọn (giờ Việt Nam).
          Hồ sơ người thuê gồm cả người đã từng thuê.</p>
      </>}
  </div>;
}
