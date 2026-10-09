function getPhuongThucText(value) {
  switch (value) {
    case "TIEN_MAT":
      return "Tiền mặt";
    case "CHUYEN_KHOAN":
      return "Chuyển khoản";
    case "VI_DIEN_TU":
      return "Ví điện tử";
    default:
      return value;
  }
}

function ThanhToanTable({
  thanhToans = [],
  hoaDons = [],
  onEdit,
  onDelete,
  isProcessing,
}) {
  const hoaDonMap = new Map(
    hoaDons.map((item) => [item.id, item])
  );

  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Hóa đơn</th>
            <th className="px-4 py-3 text-left">Phòng</th>
            <th className="px-4 py-3 text-left">Ngày thanh toán</th>
            <th className="px-4 py-3 text-left">Số tiền</th>
            <th className="px-4 py-3 text-left">Phương thức</th>
            <th className="px-4 py-3 text-left">Mã giao dịch</th>
            <th className="px-4 py-3 text-left">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {thanhToans.map((item) => {
            const hoaDon = hoaDonMap.get(item.hoaDonId);

            return (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{item.id}</td>

                <td className="px-4 py-3">
                  #{item.hoaDonId}
                  <p className="text-sm text-gray-500">
                    Kỳ {hoaDon?.kyThanhToan ?? "-"}
                  </p>
                </td>

                <td className="px-4 py-3">
                  {hoaDon?.soPhong ?? "-"}
                </td>

                <td className="px-4 py-3">
                  {item.ngayThanhToan
                    ? new Date(item.ngayThanhToan).toLocaleString("vi-VN")
                    : "-"}
                </td>

                <td className="px-4 py-3">
                  {Number(item.soTien).toLocaleString("vi-VN")} đ
                </td>

                <td className="px-4 py-3">
                  {getPhuongThucText(item.phuongThuc)}
                </td>

                <td className="px-4 py-3">
                  {item.maGiaoDich || "-"}
                </td>

                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    onClick={() => onEdit(item)}
                    disabled={isProcessing}
                    className="mr-3 text-blue-600 hover:underline disabled:opacity-50"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={() => onDelete(item)}
                    disabled={isProcessing}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            );
          })}

          {thanhToans.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-6 text-center text-gray-500"
              >
                Chưa có khoản thanh toán
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ThanhToanTable;