function NguoiThueForm({
  formData,
  editingId,
  isSaving,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
      <form
          onSubmit={onSubmit}
          className="mb-6 rounded-lg bg-white p-6 shadow"
      >
        <h2 className="mb-4 text-xl font-semibold">
          {editingId !== null
              ? "Cập nhật người thuê"
              : "Thêm người thuê"}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Họ tên */}
          <div>
            <label className="mb-1 block font-medium">
              Họ và tên
            </label>

            <input
                type="text"
                name="hoTen"
                value={formData.hoTen}
                onChange={onChange}
                maxLength={255}
                placeholder="Nguyễn Văn A"
                className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                required
            />
          </div>

          {/* CCCD */}
          <div>
            <label className="mb-1 block font-medium">
              CCCD
            </label>

            <input
                type="text"
                name="cccd"
                value={formData.cccd}
                onChange={onChange}
                maxLength={20}
                placeholder="012345678901"
                className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                required
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="mb-1 block font-medium">
              Số điện thoại
            </label>

            <input
                type="text"
                name="soDienThoai"
                value={formData.soDienThoai}
                onChange={onChange}
                maxLength={20}
                placeholder="0901234567"
                className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="mb-1 block font-medium">
              Ngày sinh
            </label>

            <input
                type="date"
                name="ngaySinh"
                value={formData.ngaySinh}
                onChange={onChange}
                className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          {/* Địa chỉ */}
          <div className="md:col-span-2">
            <label className="mb-1 block font-medium">
              Địa chỉ thường trú
            </label>

            <textarea
                name="diaChiThuongTru"
                value={formData.diaChiThuongTru}
                onChange={onChange}
                maxLength={500}
                rows="3"
                placeholder="Nhập địa chỉ thường trú..."
                className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
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

export default NguoiThueForm;