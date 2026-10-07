import { useState } from "react";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAllPhong,
  createPhong,
} from "../../api/phongApi";

function PhongPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    soPhong: "",
    dienTich: "",
    giaThue: "",
  });

  const {
    data: phongs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["phong"],
    queryFn: getAllPhong,
  });

  const createMutation = useMutation({
    mutationFn: createPhong,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["phong"],
      });

      setShowForm(false);

      setFormData({
        soPhong: "",
        dienTich: "",
        giaThue: "",
      });
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = {
      soPhong: formData.soPhong,
      dienTich: Number(formData.dienTich),
      giaThue: Number(formData.giaThue),
    };

    createMutation.mutate(data);
  };

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
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Quản lý phòng
          </h1>

          <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Thêm phòng
          </button>
        </div>

        {/* Form thêm phòng */}
        {showForm && (
            <form
                onSubmit={handleSubmit}
                className="mb-6 rounded-lg bg-white p-6 shadow"
            >
              <h2 className="mb-4 text-xl font-semibold">
                Thêm phòng mới
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Số phòng */}
                <div>
                  <label className="mb-1 block font-medium">
                    Số phòng
                  </label>

                  <input
                      type="text"
                      name="soPhong"
                      value={formData.soPhong}
                      onChange={handleChange}
                      placeholder="Ví dụ: P101"
                      className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                      required
                  />
                </div>

                {/* Diện tích */}
                <div>
                  <label className="mb-1 block font-medium">
                    Diện tích
                  </label>

                  <input
                      type="number"
                      name="dienTich"
                      value={formData.dienTich}
                      onChange={handleChange}
                      placeholder="Ví dụ: 25"
                      className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                      required
                  />
                </div>

                {/* Giá thuê */}
                <div>
                  <label className="mb-1 block font-medium">
                    Giá thuê
                  </label>

                  <input
                      type="number"
                      name="giaThue"
                      value={formData.giaThue}
                      onChange={handleChange}
                      placeholder="Ví dụ: 3000000"
                      className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                      required
                  />
                </div>
              </div>

              {/* Error khi thêm */}
              {createMutation.isError && (
                  <p className="mt-3 text-red-500">
                    Không thể thêm phòng.
                  </p>
              )}

              {/* Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending
                      ? "Đang lưu..."
                      : "Lưu"}
                </button>

                <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
        )}

        {/* Table */}
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
                    className="border-t hover:bg-gray-50"
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
                    {Number(phong.giaThue).toLocaleString(
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
                    <button className="mr-3 text-blue-600 hover:underline">
                      Sửa
                    </button>

                    <button className="text-red-600 hover:underline">
                      Xóa
                    </button>
                  </td>
                </tr>
            ))}

            {phongs?.length === 0 && (
                <tr>
                  <td
                      colSpan="6"
                      className="px-4 py-6 text-center text-gray-500"
                  >
                    Chưa có phòng nào
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
  );
}

export default PhongPage;