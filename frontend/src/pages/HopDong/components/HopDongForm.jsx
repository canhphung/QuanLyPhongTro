function HopDongForm({
  formData,
  editingId,
  phongs = [],
  isSaving,
  onChange,
  onSubmit,
  onCancel,
}) {
  // Khi tạo mới chỉ chọn được phòng đang trống,
  // khi sửa không được chuyển sang phòng khác.
  const phongOptions = editingId !== null
      ? phongs.filter(
          (phong) => phong.id === Number(formData.phongId)
      )
      : phongs.filter((phong) => phong.trangThai === "TRONG");

  return (
      <form
          onSubmit={onSubmit}
          className="mb-6 rounded-lg bg-white p-6 shadow"
      >
        <h2 className="mb-4 text-xl font-semibold">
          {editingId !== null
              ? "Cập nhật hợp đồng"
              : "Thêm hợp đồng mới"}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Phòng */}
          <div>
            <label className="mb-1 block font-medium">
              Phòng
            </label>

            <select
                name="phongId"
                value={formData.phongId}
                onChange={onChange}
                disabled={editingId !== null}
                className="w-full rounded border bg-white px-3 py-2 outline-none focus:border-blue-500 disabled:bg-gray-100"
                required
            >
              <option value="">
                -- Chọn phòng --
              </option>

              {phongOptions.map((phong) => (
                  <option key={phong.id} value={phong.id}>
                    {phong.soPhong}
                  </option>
              ))}
            </select>
          </div>

          {/* Giá thuê thỏa thuận */}
          <div>
            <label className="mb-1 block font-medium">
              Giá thuê thỏa thuận
            </label>

            <input
                type="number"
                name="giaThueThoaThuan"
                value={formData.giaThueThoaThuan}
                onChange={onChange}
                placeholder="Ví dụ: 3000000"
                min="1"
                step="1"
                className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                required
            />
          </div>

          {/* Ngày bắt đầu */}
          <div>
            <label className="mb-1 block font-medium">
              Ngày bắt đầu
            </label>

            <input
                type="date"
                name="ngayBatDau"
                value={formData.ngayBatDau}
                onChange={onChange}
                className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                required
            />
          </div>

          {/* Ngày kết thúc */}
          <div>
            <label className="mb-1 block font-medium">
              Ngày kết thúc
            </label>

            <input
                type="date"
                name="ngayKetThuc"
                value={formData.ngayKetThuc}
                onChange={onChange}
                className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                required
            />
          </div>

          {/* Tiền cọc */}
          <div>
            <label className="mb-1 block font-medium">
              Tiền cọc
            </label>

            <input
                type="number"
                name="tienCoc"
                value={formData.tienCoc}
                onChange={onChange}
                placeholder="Ví dụ: 5000000"
                min="0"
                step="1"
                className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                required
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
              type="submit"
              disabled={isSaving}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving
                ? "Đang lưu..."
                : editingId !== null
                    ? "Cập nhật"
                    : "Lưu"}
          </button>

          <button
              type="button"
              onClick={onCancel}
              className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            Hủy
          </button>
        </div>
      </form>
  );
}

export default HopDongForm;
