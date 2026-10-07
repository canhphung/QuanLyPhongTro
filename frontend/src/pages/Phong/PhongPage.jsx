import { useQuery } from "@tanstack/react-query";
import { getAllPhong } from "../../api/phongApi";

function PhongPage() {
  const {
    data: phongs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["phong"],
    queryFn: getAllPhong,
  });

  if (isLoading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  if (isError) {
    return (
        <p className="text-red-500">
          Không thể tải danh sách phòng
        </p>
    );
  }

  return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Quản lý phòng
          </h1>

          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            + Thêm phòng
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">
                ID
              </th>

              <th className="px-4 py-3 text-left">
                Số phòng
              </th>

              <th className="px-4 py-3 text-left">
                Diện tích
              </th>

              <th className="px-4 py-3 text-left">
                Giá thuê
              </th>

              <th className="px-4 py-3 text-left">
                Trạng thái
              </th>

              <th className="px-4 py-3 text-left">
                Thao tác
              </th>
            </tr>
            </thead>

            <tbody>
            {phongs?.map((phong) => (
                <tr
                    key={phong.id}
                    className="border-t"
                >
                  <td className="px-4 py-3">
                    {phong.id}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {phong.soPhong}
                  </td>

                  <td className="px-4 py-3">
                    {phong.dienTich} m²
                  </td>

                  <td className="px-4 py-3">
                    {phong.giaThue.toLocaleString(
                        "vi-VN"
                    )}{" "}
                    đ
                  </td>

                  <td className="px-4 py-3">
                  <span
                      className={`rounded-full px-3 py-1 text-sm ${
                          phong.trangThai === "TRONG"
                              ? "bg-green-100 text-green-700"
                              : phong.trangThai === "DANG_THUE"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {phong.trangThai}
                  </span>
                  </td>

                  <td className="px-4 py-3">
                    <button className="mr-3 text-blue-600">
                      Sửa
                    </button>

                    <button className="text-red-600">
                      Xóa
                    </button>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}

export default PhongPage;