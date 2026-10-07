function getStatusClass(trangThai) {
  switch (trangThai) {
    case "TRONG":
      return "bg-green-100 text-green-700";
    case "DANG_THUE":
      return "bg-blue-100 text-blue-700";
    case "BAO_TRI":
      return "bg-yellow-100 text-yellow-700";
    case "NGUNG_HOAT_DONG":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getStatusText(trangThai) {
  switch (trangThai) {
    case "TRONG":
      return "Trống";
    case "DANG_THUE":
      return "Đang thuê";
    case "BAO_TRI":
      return "Bảo trì";
    case "NGUNG_HOAT_DONG":
      return "Ngừng hoạt động";
    default:
      return trangThai;
  }
}

function PhongTable({ phongs = [], onEdit, onDelete, isDeleting }) {
  return (
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Số phòng</th>
            <th className="px-4 py-3 text-left">Diện tích</th>
            <th className="px-4 py-3 text-left">Giá thuê</th>
            <th className="px-4 py-3 text-left">Trạng thái</th>
            <th className="px-4 py-3 text-left">Thao tác</th>
          </tr>
          </thead>

          <tbody>
          {phongs.map((phong) => (
              <tr key={phong.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{phong.id}</td>
                <td className="px-4 py-3 font-medium">{phong.soPhong}</td>
                <td className="px-4 py-3">{phong.dienTich} m²</td>
                <td className="px-4 py-3">
                  {Number(phong.giaThue).toLocaleString("vi-VN")} đ
                </td>
                <td className="px-4 py-3">
                <span
                    className={`rounded-full px-3 py-1 text-sm ${getStatusClass(
                        phong.trangThai
                    )}`}
                >
                  {getStatusText(phong.trangThai)}
                </span>
                </td>
                <td className="px-4 py-3">
                  <button
                      onClick={() => onEdit(phong)}
                      className="mr-3 text-blue-600 hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                      onClick={() => onDelete(phong)}
                      disabled={isDeleting}
                      className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
          ))}

          {phongs.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                  Chưa có phòng nào
                </td>
              </tr>
          )}
          </tbody>
        </table>
      </div>
  );
}

export default PhongTable;
