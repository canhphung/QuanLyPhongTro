import { formatMoney } from "../../../utils/decimalValues";
export default function ThanhToanForm({ form, setForm, editingId, invoices, invoice, limit, canSave, disabled, onSubmit, onCancel }) {
  const control = "w-full rounded border px-3 py-2";
  return <form onSubmit={onSubmit} className="mb-5 rounded bg-white p-4 shadow">
    <fieldset disabled={disabled} className="grid gap-3 md:grid-cols-2">
      <legend className="mb-3 font-semibold">{editingId == null ? "Ghi nhận khoản thu" : "Sửa khoản thu"}</legend>
      <label>Hóa đơn<select aria-label="Hóa đơn" required className={control} value={form.hoaDonId}
        disabled={editingId != null} onChange={(e) => setForm({ ...form, hoaDonId: e.target.value, soTien: "" })}>
        <option value="">Chọn hóa đơn</option>
        {invoices.map((bill) => <option key={bill.id} value={bill.id}>
          #{bill.id} · {bill.tenNhaTro} · {bill.soPhong} · {bill.kyThanhToan.slice(0, 7)}
        </option>)}
      </select></label>
      <label>Số tiền (đồng)<input required inputMode="numeric" maxLength={19} className={control}
        value={form.soTien} onChange={(e) => setForm({ ...form, soTien: e.target.value })} /></label>
      <label>Phương thức<select aria-label="Phương thức" className={control} value={form.phuongThuc}
        onChange={(e) => setForm({ ...form, phuongThuc: e.target.value })}>
        <option value="TIEN_MAT">Tiền mặt</option><option value="CHUYEN_KHOAN">Chuyển khoản</option>
        <option value="VI_DIEN_TU">Ví điện tử</option>
      </select></label>
      <label>Ngày thu (giờ Việt Nam)<input type="datetime-local" step="1" className={control}
        value={form.ngayThanhToan} onChange={(e) => setForm({ ...form, ngayThanhToan: e.target.value })} />
        <small>{editingId == null ? "Để trống: thời điểm ghi nhận hiện tại." : "Để trống: giữ nguyên ngày thu cũ."}</small>
      </label>
      <label>Mã giao dịch<input maxLength={255} className={control} value={form.maGiaoDich}
        onChange={(e) => setForm({ ...form, maGiaoDich: e.target.value })} /></label>
      {invoice && <p>Còn thiếu: {formatMoney(invoice.conThieu)}<br />Tối đa khoản này: {formatMoney(limit)}</p>}
      <div className="flex gap-3">
        <button className="rounded bg-blue-600 px-4 py-2 text-white" disabled={!canSave || !invoice || limit === "0"}>Lưu</button>
        <button type="button" className="rounded border px-4 py-2" onClick={onCancel}>Hủy</button>
      </div>
    </fieldset>
  </form>;
}
