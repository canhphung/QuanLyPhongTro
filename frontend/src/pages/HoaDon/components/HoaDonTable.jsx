function getStatusClass(trangThai) {
  switch (trangThai) {
    case "CHUA_THANH_TOAN":
      return "bg-yellow-100 text-yellow-700";
    case "THANH_TOAN_MOT_PHAN":
      return "bg-blue-100 text-blue-700";
    case "DA_THANH_TOAN":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getStatusText(trangThai) {
  switch (trangThai) {
    case "CHUA_THANH_TOAN":
      return "Chưa thanh toán";
    case "THANH_TOAN_MOT_PHAN":
      return "Thanh toán một phần";
    case "DA_THANH_TOAN":
      return "Đã thanh toán";
    default:
      return trangThai;
  }
}

function HoaDonTable({
  hoaDons = [],
  onEdit,
  onDelete,
  isDeleting,
}) {
  return (
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Số phòng</th>
            <th className="px-4 py-3 text-left">Kỳ thanh toán</th>
            <th className="px-4 py-3 text-left">Ngày lập</th>
            <th className="px-4 py-3 text-left">Hạn thanh toán</th>
            <th className="px-4 py-3 text-left">Tiền phòng</th>
            <th className="px-4 py-3 text-left">Tổng tiền</th>
            <th className="px-4 py-3 text-left">Trạng thái</th>
            <th className="px-4 py-3 text-left">Thao tác</th>
          </tr>
          </thead>

          <tbody>
          {hoaDons.map((hoaDon) => (
              <tr key={hoaDon.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{hoaDon.id}</td>

                <td className="px-4 py-3 font-medium">
                  {hoaDon.soPhong}
                </td>

                <td className="px-4 py-3">
                  {hoaDon.kyThanhToan || "-"}
                </td>

                <td className="px-4 py-3">
                  {hoaDon.ngayLap || "-"}
                </td>

                <td className="px-4 py-3">
                  {hoaDon.hanThanhToan || "-"}
                </td>

                <td className="px-4 py-3">
                  {Number(hoaDon.tienPhong).toLocaleString("vi-VN")} đ
                </td>

                <td className="px-4 py-3">
                  {Number(hoaDon.tongTien).toLocaleString("vi-VN")} đ
                </td>

                <td className="px-4 py-3">
                <span
                    className={`rounded-full px-3 py-1 text-sm ${getStatusClass(
                        hoaDon.trangThai
                    )}`}
                >
                  {getStatusText(hoaDon.trangThai)}
                </span>
                </td>

                <td className="whitespace-nowrap px-4 py-3">
                  <button
                      onClick={() => onEdit(hoaDon)}
                      disabled={
                        isDeleting ||
                        hoaDon.trangThai !== "CHUA_THANH_TOAN"
                      }
                      className="mr-3 text-blue-600 hover:underline disabled:opacity-50"
                  >
                    Sửa
                  </button>

                  <button
                      onClick={() => onDelete(hoaDon)}
                      disabled={
                        isDeleting ||
                        hoaDon.trangThai !== "CHUA_THANH_TOAN"
                      }
                      className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
          ))}

          {hoaDons.length === 0 && (
              <tr>
                <td
                    colSpan="9"
                    className="px-4 py-6 text-center text-gray-500"
                >
                  Không có hóa đơn
                </td>
              </tr>
          )}
          </tbody>
        </table>
      </div>
  );
}

export default HoaDonTable;
