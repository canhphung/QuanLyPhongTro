function DichVuForm({
  formData,
  editingId,
  isSaving,
  onChange,
  onSubmit,
  onCancel,
}) {
  const inputClass =
    "w-full rounded border px-3 py-2 outline-none focus:border-blue-500";

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 rounded-lg bg-white p-6 shadow"
    >
      <h2 className="mb-4 text-xl font-semibold">
        {editingId !== null ? "Cập nhật dịch vụ" : "Thêm dịch vụ"}
      </h2>

      <fieldset disabled={isSaving}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label>
            <span className="mb-1 block font-medium">
              Tên dịch vụ
            </span>

            <input
              type="text"
              name="tenDichVu"
              value={formData.tenDichVu}
              onChange={onChange}
              maxLength={255}
              placeholder="Điện, nước, internet..."
              className={inputClass}
              required
            />
          </label>

          <label>
            <span className="mb-1 block font-medium">
              Đơn vị tính
            </span>

            <input
              type="text"
              name="donViTinh"
              value={formData.donViTinh}
              onChange={onChange}
              maxLength={50}
              placeholder="kWh, m³, tháng..."
              className={inputClass}
              required
            />
          </label>

          <label>
            <span className="mb-1 block font-medium">
              Đơn giá hiện tại (đồng)
            </span>

            <input
              type="number"
              name="donGiaHienTai"
              value={formData.donGiaHienTai}
              onChange={onChange}
              min="0"
              step="1"
              className={inputClass}
              required
            />
          </label>
        </div>

        <div className="my-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="tinhTheoChiSo"
              checked={formData.tinhTheoChiSo}
              onChange={onChange}
            />
            Tính theo chỉ số công tơ
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="dangHoatDong"
              checked={formData.dangHoatDong}
              onChange={onChange}
            />
            Đang hoạt động
          </label>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          Điện, nước: chọn tính theo chỉ số.
          Internet, vệ sinh: bỏ chọn để tính theo số lượng.
        </p>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
      </fieldset>
    </form>
  );
}

export default DichVuForm;