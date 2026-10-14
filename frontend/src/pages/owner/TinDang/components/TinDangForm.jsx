import { formatMoney } from "../../../../utils/decimalValues";
export default function TinDangForm({ form, setForm, editingId, rooms, disabled, onSubmit, onCancel }) {
  const control = "w-full rounded border px-3 py-2";
  return <form onSubmit={onSubmit} className="mb-5 rounded bg-white p-4 shadow">
    <fieldset disabled={disabled} className="grid gap-3">
      <legend className="mb-3 font-semibold">{editingId == null ? "Tạo tin nháp" : "Sửa tin đăng"}</legend>
      <p>Sửa tin đã duyệt sẽ đưa về Nháp và ngừng công khai cho đến khi được duyệt lại.</p>
      <label>Phòng<select aria-label="Phòng đăng tin" required className={control} value={form.phongId}
        disabled={editingId != null} onChange={(e) => {
          const room = rooms.find((item) => String(item.id) === e.target.value);
          setForm({ ...form, phongId: e.target.value, giaThue: room?.giaThue ?? "" });
        }}>
        <option value="">Chọn phòng</option>{rooms.map((room) => <option key={room.id} value={room.id}>
          {room.tenNhaTro} · {room.soPhong} · {room.trangThai} · {formatMoney(room.giaThue)}
        </option>)}
      </select></label>
      <label>Tiêu đề<input required maxLength={255} className={control} value={form.tieuDe}
        onChange={(e) => setForm({ ...form, tieuDe: e.target.value })} /></label>
      <label>Mô tả<textarea aria-label="Mô tả" required maxLength={8000} rows={5} className={control} value={form.moTa}
        onChange={(e) => setForm({ ...form, moTa: e.target.value })} /></label>
      <label>Giá đăng (đồng)<input required inputMode="numeric" maxLength={19} className={control} value={form.giaThue}
        onChange={(e) => setForm({ ...form, giaThue: e.target.value })} /></label>
      <label>Số điện thoại liên hệ công khai<input required type="tel" maxLength={30} className={control}
        value={form.soDienThoaiLienHe} onChange={(e) => setForm({ ...form, soDienThoaiLienHe: e.target.value })} /></label>
      <label>URL ảnh HTTPS (mỗi dòng một ảnh, tối đa 10)<textarea aria-label="URL ảnh HTTPS" rows={4} className={control} value={form.images}
        onChange={(e) => setForm({ ...form, images: e.target.value })} /></label>
      <p className="text-sm text-gray-600">Địa chỉ và diện tích lấy từ phòng khi lưu. Tin nháp có thể chưa có ảnh;
        cần ít nhất một ảnh khi gửi duyệt.</p>
      <div className="flex gap-3"><button className="rounded bg-blue-600 px-4 py-2 text-white">Lưu nháp</button>
        <button type="button" className="rounded border px-4 py-2" onClick={onCancel}>Hủy</button></div>
    </fieldset>
  </form>;
}
