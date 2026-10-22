import { useRef, useState } from "react";
import { formatMoney } from "../../../../utils/decimalValues";
import { useAppData } from "../../../../experience/context";

export default function TinDangForm({ form, setForm, editingId, rooms, disabled, onSubmit, onCancel }) {
  const control = "w-full rounded border px-3 py-2";
  const { uploadFiles } = useAppData();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const imageList = (form.images || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  async function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (imageList.length + files.length > 10) {
      setUploadError("Tối đa 10 ảnh cho mỗi tin đăng. Vui lòng chọn ít ảnh hơn.");
      e.target.value = "";
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const urls = await uploadFiles(files);
      const updated = [...imageList, ...urls].slice(0, 10).join("\n");
      setForm({ ...form, images: updated });
    } catch (err) {
      setUploadError(err.message || "Tải ảnh thất bại.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleRemove(index) {
    const updated = imageList.filter((_, i) => i !== index).join("\n");
    setForm({ ...form, images: updated });
  }

  return (
    <form onSubmit={onSubmit} className="mb-5 rounded bg-white p-4 shadow">
      <fieldset disabled={disabled} className="grid gap-3">
        <legend className="mb-3 font-semibold">{editingId == null ? "Tạo tin nháp" : "Sửa tin đăng"}</legend>
        <p>Sửa tin đã duyệt sẽ đưa về Nháp và ngừng công khai cho đến khi được duyệt lại.</p>
        <label>
          Phòng
          <select
            aria-label="Phòng đăng tin"
            required
            className={control}
            value={form.phongId}
            disabled={editingId != null}
            onChange={(e) => {
              const room = rooms.find((item) => String(item.id) === e.target.value);
              setForm({ ...form, phongId: e.target.value, giaThue: room?.giaThue ?? "" });
            }}
          >
            <option value="">Chọn phòng</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.tenNhaTro} · {room.soPhong} · {room.trangThai} · {formatMoney(room.giaThue)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tiêu đề
          <input
            required
            maxLength={255}
            className={control}
            value={form.tieuDe}
            onChange={(e) => setForm({ ...form, tieuDe: e.target.value })}
          />
        </label>
        <label>
          Mô tả
          <textarea
            aria-label="Mô tả"
            required
            maxLength={8000}
            rows={5}
            className={control}
            value={form.moTa}
            onChange={(e) => setForm({ ...form, moTa: e.target.value })}
          />
        </label>
        <label>
          Giá đăng (đồng)
          <input
            required
            inputMode="numeric"
            maxLength={19}
            className={control}
            value={form.giaThue}
            onChange={(e) => setForm({ ...form, giaThue: e.target.value })}
          />
        </label>
        <label>
          Số điện thoại liên hệ công khai
          <input
            required
            type="tel"
            maxLength={30}
            className={control}
            value={form.soDienThoaiLienHe}
            onChange={(e) => setForm({ ...form, soDienThoaiLienHe: e.target.value })}
          />
        </label>

        {/* Upload and preview section */}
        <div className="rounded border border-dashed p-3 bg-gray-50 grid gap-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">Hình ảnh phòng ({imageList.length}/10 ảnh)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading || imageList.length >= 10}
            />
            <button
              type="button"
              className="rounded bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1 text-sm font-medium"
              disabled={uploading || imageList.length >= 10}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "Đang tải ảnh lên..." : "Tải ảnh từ thư viện máy lên"}
            </button>
          </div>

          {uploadError && <p className="text-red-600 text-xs">{uploadError}</p>}

          {imageList.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
              {imageList.map((url, idx) => (
                <div key={idx} className="relative aspect-video rounded overflow-hidden border bg-gray-200 group">
                  <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded">
                      Ảnh bìa
                    </span>
                  )}
                  <button
                    type="button"
                    title="Xóa ảnh"
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    onClick={() => handleRemove(idx)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic py-2 text-center">
              Chưa có ảnh nào. Bấm nút "Tải ảnh từ thư viện máy lên" ở trên để chọn ảnh từ máy tính.
            </p>
          )}

          <label className="text-xs text-gray-600 mt-2">
            Đường dẫn URL ảnh (mỗi dòng một ảnh):
            <textarea
              aria-label="URL ảnh"
              rows={2}
              className={control + " text-xs font-mono mt-1"}
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
            />
          </label>
        </div>

        <p className="text-sm text-gray-600">
          Địa chỉ và diện tích lấy từ phòng khi lưu. Tin nháp có thể chưa có ảnh; cần ít nhất một ảnh khi gửi duyệt.
        </p>
        <div className="flex gap-3">
          <button className="rounded bg-blue-600 px-4 py-2 text-white">Lưu nháp</button>
          <button type="button" className="rounded border px-4 py-2" onClick={onCancel}>
            Hủy
          </button>
        </div>
      </fieldset>
    </form>
  );
}
