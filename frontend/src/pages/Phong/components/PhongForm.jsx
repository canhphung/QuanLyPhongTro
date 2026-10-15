function PhongForm({
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
          {editingId !== null ? "Cập nhật phòng" : "Thêm phòng mới"}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block font-medium">Số phòng</label>
            <input
                type="text"
                name="soPhong"
                value={formData.soPhong}
                onChange={onChange}
                placeholder="Ví dụ: P101"
                maxLength={50}
                className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                required
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Diện tích</label>
            <input
                type="number"
                name="dienTich"
                value={formData.dienTich}
                onChange={onChange}
                placeholder="Ví dụ: 25"
                min="0.01"
                step="0.01"
                className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                required
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Giá thuê</label>
            <input
                type="number"
                name="giaThue"
                value={formData.giaThue}
                onChange={onChange}
                placeholder="Ví dụ: 3000000"
                min="1"
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

export default PhongForm;
