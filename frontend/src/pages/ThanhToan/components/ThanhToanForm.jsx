function ThanhToanForm({
  formData,
  editingId,
  hoaDons = [],
  selectedHoaDon,
  daThanhToan,
  conNo,
  maxAmount,
  isSaving,
  onChange,
  onSubmit,
  onCancel,
}) {
  const inputClass =
    "w-full rounded border px-3 py-2 outline-none focus:border-blue-500";

  const money = (value) =>
    `${Number(value ?? 0).toLocaleString("vi-VN")} đ`;

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 rounded-lg bg-white p-6 shadow"
    >
      <h2 className="mb-4 text-xl font-semibold">
        {editingId !== null
          ? "Cập nhật thanh toán"
          : "Ghi nhận thanh toán"}
      </h2>

      <fieldset disabled={isSaving}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1 block font-medium">
              Hóa đơn
            </span>

            <select
              name="hoaDonId"
              value={formData.hoaDonId}
              onChange={onChange}
              disabled={editingId !== null}
              className={inputClass}
              required
            >
              <option value="">-- Chọn hóa đơn --</option>

              {hoaDons.map((item) => (
                <option key={item.id} value={item.id}>
                  #{item.id} - Phòng {item.soPhong} -
                  Kỳ {item.kyThanhToan}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block font-medium">
              Số tiền thanh toán (đồng)
            </span>

            <input
              type="number"
              name="soTien"
              value={formData.soTien}
              onChange={onChange}
              min="1"
              step="1"
              max={selectedHoaDon ? maxAmount : undefined}
              className={inputClass}
              required
            />
          </label>

          <label>
            <span className="mb-1 block font-medium">
              Phương thức thanh toán
            </span>

            <select
              name="phuongThuc"
              value={formData.phuongThuc}
              onChange={onChange}
              className={inputClass}
              required
            >
              <option value="TIEN_MAT">Tiền mặt</option>
              <option value="CHUYEN_KHOAN">Chuyển khoản</option>
              <option value="VI_DIEN_TU">Ví điện tử</option>
            </select>
          </label>

          <label>
            <span className="mb-1 block font-medium">
              Ngày thanh toán
            </span>

            <input
              type="datetime-local"
              step="1"
              name="ngayThanhToan"
              value={formData.ngayThanhToan}
              onChange={onChange}
              className={inputClass}
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-1 block font-medium">
              Mã giao dịch
            </span>

            <input
              type="text"
              name="maGiaoDich"
              value={formData.maGiaoDich}
              onChange={onChange}
              maxLength={255}
              placeholder="Có thể để trống"
              className={inputClass}
            />
          </label>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          Để trống ngày thanh toán: khi thêm dùng thời điểm hiện tại,
          khi sửa giữ nguyên ngày cũ.
        </p>

        {selectedHoaDon && (
          <div className="my-4 rounded-lg bg-blue-50 p-4">
            <p>
              Tổng hóa đơn:
              <strong> {money(selectedHoaDon.tongTien)}</strong>
            </p>

            <p>
              Đã thanh toán:
              <strong> {money(daThanhToan)}</strong>
            </p>

            <p>
              Còn nợ:
              <strong> {money(conNo)}</strong>
            </p>

            <p>
              {editingId !== null
                ? "Số tiền tối đa của khoản đang sửa:"
                : "Số tiền tối đa được thu:"}
              <strong> {money(maxAmount)}</strong>
            </p>
          </div>
        )}

        {hoaDons.length === 0 && (
          <p className="my-4 text-orange-600">
            Không có hóa đơn phù hợp để thanh toán.
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={!selectedHoaDon || maxAmount <= 0}
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
      </fieldset>
    </form>
  );
}

export default ThanhToanForm;