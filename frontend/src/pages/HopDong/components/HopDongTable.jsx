function getStatusClass(trangThai) {
  switch (trangThai) {
    case "DANG_HIEU_LUC":
      return "bg-green-100 text-green-700";
    case "HET_HAN":
      return "bg-yellow-100 text-yellow-700";
    case "DA_HUY":
      return "bg-red-100 text-red-700";
    case "DA_KET_THUC":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getStatusText(trangThai) {
  switch (trangThai) {
    case "DANG_HIEU_LUC":
      return "Đang hiệu lực";
    case "HET_HAN":
      return "Hết hạn";
    case "DA_HUY":
      return "Đã hủy";
    case "DA_KET_THUC":
      return "Đã kết thúc";
    default:
      return trangThai;
  }
}

function HopDongTable({
  hopDongs = [],
  onEdit,
  onKetThuc,
  onHuy,
  isProcessing,
}) {
  return (
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Số phòng</th>
            <th className="px-4 py-3 text-left">Ngày bắt đầu</th>
            <th className="px-4 py-3 text-left">Ngày kết thúc</th>
            <th className="px-4 py-3 text-left">Giá thuê</th>
            <th className="px-4 py-3 text-left">Tiền cọc</th>
            <th className="px-4 py-3 text-left">Trạng thái</th>
            <th className="px-4 py-3 text-left">Thao tác</th>
          </tr>
          </thead>

          <tbody>
          {hopDongs.map((hopDong) => (
              <tr key={hopDong.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{hopDong.id}</td>

                <td className="px-4 py-3 font-medium">
                  {hopDong.soPhong}
                </td>

                <td className="px-4 py-3">
                  {hopDong.ngayBatDau || "-"}
                </td>

                <td className="px-4 py-3">
                  {hopDong.ngayKetThuc || "-"}
                </td>

                <td className="px-4 py-3">
                  {Number(hopDong.giaThueThoaThuan).toLocaleString("vi-VN")} đ
                </td>

                <td className="px-4 py-3">
                  {Number(hopDong.tienCoc).toLocaleString("vi-VN")} đ
                </td>

                <td className="px-4 py-3">
                <span
                    className={`rounded-full px-3 py-1 text-sm ${getStatusClass(
                        hopDong.trangThai
                    )}`}
                >
                  {getStatusText(hopDong.trangThai)}
                </span>
                </td>

                <td className="whitespace-nowrap px-4 py-3">
                  <button
                      onClick={() => onEdit(hopDong)}
                      disabled={
                        isProcessing ||
                        hopDong.trangThai !== "DANG_HIEU_LUC"
                      }
                      className="mr-3 text-blue-600 hover:underline disabled:opacity-50"
                  >
                    Sửa
                  </button>

                  <button
                      onClick={() => onKetThuc(hopDong)}
                      disabled={
                        isProcessing ||
                        hopDong.trangThai !== "DANG_HIEU_LUC"
                      }
                      className="mr-3 text-green-600 hover:underline disabled:opacity-50"
                  >
                    Kết thúc
                  </button>

                  <button
                      onClick={() => onHuy(hopDong)}
                      disabled={
                        isProcessing ||
                        hopDong.trangThai !== "DANG_HIEU_LUC"
                      }
                      className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    Hủy
                  </button>
                </td>
              </tr>
          ))}

          {hopDongs.length === 0 && (
              <tr>
                <td
                    colSpan="8"
                    className="px-4 py-6 text-center text-gray-500"
                >
                  Không có hợp đồng
                </td>
              </tr>
          )}
          </tbody>
        </table>
      </div>
  );
}

export default HopDongTable;
