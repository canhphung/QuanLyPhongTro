import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "../../api/dashboardApi";
import getErrorMessage from "../../utils/getErrorMessage";

const cards = [
  ["tongPhong", "Tổng phòng"],
  ["phongTrong", "Phòng trống"],
  ["phongDangThue", "Phòng đang thuê"],
  ["phongBaoTri", "Phòng bảo trì"],
  ["phongNgungHoatDong", "Phòng ngừng hoạt động"],
  ["tongHoSoNguoiThue", "Tổng hồ sơ người thuê"],
  ["hopDongDangHieuLuc", "Hợp đồng đang hiệu lực"],
];

function DashboardPage() {
  const { data, isPending, isError, error, isFetching, refetch } =
      useQuery({
        queryKey: ["dashboard"],
        queryFn: getDashboard,
      });

  if (isPending) {
    return <p>Đang tải thống kê...</p>;
  }

  if (isError) {
    return (
        <div>
          <p className="text-red-600">
            {getErrorMessage(error, "Không thể tải thống kê")}
          </p>

          <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded bg-blue-600 px-4 py-2 text-white"
          >
            Thử lại
          </button>
        </div>
    );
  }

  return (
      <div>
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {isFetching ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([key, label]) => (
              <div key={key} className="rounded-lg bg-white p-5 shadow">
                <p className="text-gray-500">{label}</p>
                <h2 className="mt-2 text-3xl font-bold">
                  {data[key].toLocaleString("vi-VN")}
                </h2>
              </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Tổng hồ sơ người thuê bao gồm cả người đã từng thuê.
        </p>
      </div>
  );
}

export default DashboardPage;