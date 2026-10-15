function DichVuTable({
  dichVus = [],
  onEdit,
  onDelete,
  isProcessing,
}) {
  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Tên dịch vụ</th>
            <th className="px-4 py-3 text-left">Đơn vị tính</th>
            <th className="px-4 py-3 text-left">Đơn giá</th>
            <th className="px-4 py-3 text-left">Cách tính</th>
            <th className="px-4 py-3 text-left">Trạng thái</th>
            <th className="px-4 py-3 text-left">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {dichVus.map((item) => (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3">{item.id}</td>

              <td className="px-4 py-3 font-medium">
                {item.tenDichVu}
              </td>

              <td className="px-4 py-3">{item.donViTinh}</td>

              <td className="px-4 py-3">
                {Number(item.donGiaHienTai).toLocaleString("vi-VN")} đ
              </td>

              <td className="px-4 py-3">
                {item.tinhTheoChiSo ? "Theo chỉ số" : "Theo số lượng"}
              </td>

              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    item.dangHoatDong
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {item.dangHoatDong
                    ? "Đang hoạt động"
                    : "Ngừng hoạt động"}
                </span>
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
          ))}

          {dichVus.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-6 text-center text-gray-500"
              >
                Không có dịch vụ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DichVuTable;