function NguoiThueTable({
  nguoiThues = [],
  onEdit,
  onDelete,
  isDeleting,
}) {
  return (
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">
              ID
            </th>

            <th className="px-4 py-3 text-left">
              Họ tên
            </th>

            <th className="px-4 py-3 text-left">
              CCCD
            </th>

            <th className="px-4 py-3 text-left">
              Số điện thoại
            </th>

            <th className="px-4 py-3 text-left">
              Ngày sinh
            </th>

            <th className="px-4 py-3 text-left">
              Địa chỉ
            </th>

            <th className="px-4 py-3 text-left">
              Thao tác
            </th>
          </tr>
          </thead>

          <tbody>
          {nguoiThues.map((nguoiThue) => (
              <tr
                  key={nguoiThue.id}
                  className="border-t hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  {nguoiThue.id}
                </td>

                <td className="px-4 py-3 font-medium">
                  {nguoiThue.hoTen}
                </td>

                <td className="px-4 py-3">
                  {nguoiThue.cccd}
                </td>

                <td className="px-4 py-3">
                  {nguoiThue.soDienThoai || "-"}
                </td>

                <td className="px-4 py-3">
                  {nguoiThue.ngaySinh || "-"}
                </td>

                <td className="max-w-xs px-4 py-3">
                  {nguoiThue.diaChiThuongTru || "-"}
                </td>

                <td className="whitespace-nowrap px-4 py-3">
                  <button
                      onClick={() => onEdit(nguoiThue)}
                      className="mr-3 text-blue-600 hover:underline"
                  >
                    Sửa
                  </button>

                  <button
                      onClick={() => onDelete(nguoiThue)}
                      disabled={isDeleting}
                      className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
          ))}

          {nguoiThues.length === 0 && (
              <tr>
                <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-gray-500"
                >
                  Không có người thuê
                </td>
              </tr>
          )}
          </tbody>
        </table>
      </div>
  );
}

export default NguoiThueTable;