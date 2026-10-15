function HoaDonForm({
  formData,
  editingId,
  hopDongs = [],
  isSaving,
  onChange,
  onSubmit,
  onCancel,
}) {
  // Khi sửa không được chuyển hóa đơn sang hợp đồng khác
  const hopDongOptions =
      editingId !== null
          ? hopDongs.filter(
              (hopDong) =>
                  hopDong.id === Number(formData.hopDongId)
          )
          : hopDongs.filter(
              (hopDong) =>
                  hopDong.trangThai === "DANG_HIEU_LUC" ||
                  (hopDong.trangThai === "DA_KET_THUC" &&
                      hopDong.ngayKetThucThucTe)
          );

  return (
      <form
          onSubmit={onSubmit}
          className="mb-6 rounded-lg bg-white p-6 shadow"
      >
        <h2 className="mb-4 text-xl font-semibold">
          {editingId !== null
              ? "Cập nhật hóa đơn"
              : "Thêm hóa đơn mới"}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Hợp đồng */}
          <div>
            <label className="mb-1 block font-medium">
              Hợp đồng
            </label>

            <select
                name="hopDongId"
                value={formData.hopDongId}
                onChange={onChange}
                disabled={editingId !== null}
                className="w-full rounded border bg-white px-3 py-2 outline-none focus:border-blue-500 disabled:bg-gray-100"
                required
            >
              <option value="">
                -- Chọn hợp đồng --
              </option>

              {hopDongOptions.map((hopDong) => (
                  <option key={hopDong.id} value={hopDong.id}>
                HĐ {hopDong.id} - Phòng {hopDong.soPhong}
              {hopDong.trangThai === "DA_KET_THUC"
                ? " - Đã kết thúc"
                : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Kỳ thanh toán */}
          <div>
            <label className="mb-1 block font-medium">
              Kỳ thanh toán
            </label>

            <input
                type="date"
                name="kyThanhToan"
                value={formData.kyThanhToan}
                onChange={onChange}
                className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                required
            />
          </div>

          {/* Ngày lập */}
          <div>
            <label className="mb-1 block font-medium">
              Ngày lập
            </label>

            <input
                type="date"
                name="ngayLap"
                value={formData.ngayLap}
                onChange={onChange}
                className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                required
            />
          </div>

          {/* Hạn thanh toán */}
          <div>
            <label className="mb-1 block font-medium">
              Hạn thanh toán
            </label>

            <input
                type="date"
                name="hanThanhToan"
                value={formData.hanThanhToan}
                onChange={onChange}
                className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                required
            />
          </div>

          {/* Tiền phòng */}
          <div>
            <label className="mb-1 block font-medium">
              Tiền phòng
            </label>

            <input
                type="number"
                name="tienPhong"
                value={formData.tienPhong}
                onChange={onChange}
                placeholder="Để trống lấy giá thuê của hợp đồng"
                min="0"
                step="1"
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

export default HoaDonForm;
