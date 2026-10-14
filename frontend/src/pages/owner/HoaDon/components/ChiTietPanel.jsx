import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllDichVu } from "../../../../api/dichVuApi.js";
import { saveChiTiet, deleteChiTiet } from "../../../../api/chiTietHoaDonApi.js";
import { formatMoney, formatDecimal, normalizeDecimal, validDecimal, decimalUnits } from "../../../../utils/decimalValues.js";
import getErrorMessage from "../../../../utils/getErrorMessage.js";

export default function ChiTietPanel({ invoice, accountId, disabled, onBusyChange }) {
  const client = useQueryClient();
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState("");
  const services = useQuery({
    queryKey: ["dich-vu", accountId, "bill-options"],
    queryFn: getAllDichVu, enabled: invoice.coTheChinhSua,
  });
  const lines = invoice.chiTietHoaDons;
  const existing = lines.find((line) => line.id === editingId);
  const selected = (services.data ?? []).find((service) => service.id === Number(form?.dichVuId));
  const meter = existing ? existing.tinhTheoChiSo : selected?.tinhTheoChiSo;
  const reset = () => { setForm(null); setEditingId(null); };
  const refresh = () => Promise.all(["hoa-don", "dashboard"].map(
    (key) => client.invalidateQueries({ queryKey: [key, accountId] })));
  const onError = (error) => setNotice(getErrorMessage(error, "Không thể cập nhật dòng dịch vụ"));
  const save = useMutation({ mutationFn: saveChiTiet,
    onSuccess: async () => { reset(); setNotice("Đã lưu dòng dịch vụ."); await refresh(); }, onError });
  const remove = useMutation({ mutationFn: deleteChiTiet,
    onSuccess: async (_, variables) => {
      if (editingId === variables.id) reset();
      setNotice("Đã xóa dòng dịch vụ."); await refresh();
    }, onError });
  const writing = save.isPending || remove.isPending;
  useEffect(() => { onBusyChange(writing); }, [writing, onBusyChange]);
  const busy = disabled || writing || !invoice.coTheChinhSua;
  const control = "rounded border bg-white px-3 py-2 disabled:opacity-50";
  const submit = (e) => {
    e.preventDefault();
    if (busy) return;
    if (!selected && !existing) { setNotice("Chọn dịch vụ."); return; }
    const data = { dichVuId: Number(form.dichVuId), chiSoCu: null, chiSoMoi: null, soLuong: null };
    if (meter) {
      if (!validDecimal(form.chiSoCu, 16, 3) || !validDecimal(form.chiSoMoi, 16, 3)
        || decimalUnits(form.chiSoMoi) < decimalUnits(form.chiSoCu)) {
        setNotice("Chỉ số không âm, tối đa 3 số lẻ; chỉ số mới không nhỏ hơn chỉ số cũ."); return;
      }
      data.chiSoCu = normalizeDecimal(form.chiSoCu);
      data.chiSoMoi = normalizeDecimal(form.chiSoMoi);
    } else {
      if (!validDecimal(form.soLuong, 16, 3, false)) {
        setNotice("Số lượng phải lớn hơn 0 và có tối đa 3 số lẻ."); return;
      }
      data.soLuong = normalizeDecimal(form.soLuong);
    }
    // Không gửi đơn giá: tạo lấy giá dịch vụ, sửa giữ giá đã chốt.
    save.mutate({ hoaDonId: invoice.id, editingId, data });
  };
  return <div>
    <h2 className="mb-3 text-xl font-semibold">Hóa đơn #{invoice.id} · {invoice.tenNhaTro} · {invoice.soPhong}</h2>
    <p className="mb-3">Kỳ {invoice.kyThanhToan.slice(0, 7)} · {invoice.trangThai}</p>
    <dl className="mb-4 grid gap-3 md:grid-cols-4">
      <div><dt>Tiền phòng</dt><dd>{formatMoney(invoice.tienPhong)}</dd></div>
      <div><dt>Tổng tiền</dt><dd>{formatMoney(invoice.tongTien)}</dd></div>
      <div><dt>Đã thu</dt><dd>{formatMoney(invoice.daThanhToan)}</dd></div>
      <div><dt>Còn thiếu</dt><dd>{formatMoney(invoice.conThieu)}</dd></div>
    </dl>
    {!invoice.coTheChinhSua && <p className="mb-3">Hóa đơn đã có khoản thu hoặc đã thanh toán; chỉ xem chi tiết.</p>}
    {notice && <p role="status" className="mb-3 whitespace-pre-line">{notice}</p>}
    {invoice.coTheChinhSua && <button className={control}
      disabled={busy || services.isFetching || services.isError}
      onClick={() => {
        setEditingId(null); setForm({ dichVuId: "", chiSoCu: "", chiSoMoi: "", soLuong: "" }); setNotice("");
      }}>Thêm dịch vụ</button>}
    {services.isError && <p className="text-red-600">Không tải được dịch vụ.
      <button onClick={() => services.refetch()}>Thử lại</button></p>}
    {form && invoice.coTheChinhSua && <form className="my-4 rounded border p-4" onSubmit={submit}>
      <fieldset disabled={busy || services.isFetching} className="grid gap-3 md:grid-cols-2">
        <label>Dịch vụ
          <select aria-label="Dịch vụ" className={control + " w-full"} required value={form.dichVuId}
            disabled={editingId != null} onChange={(e) => setForm({
              dichVuId: e.target.value, chiSoCu: "", chiSoMoi: "", soLuong: "",
            })}>
            <option value="">Chọn dịch vụ</option>
            {(services.data ?? []).filter((service) =>
              editingId != null ? service.id === Number(form.dichVuId) :
                service.dangHoatDong && !lines.some((line) => line.dichVuId === service.id)
            ).map((service) => <option key={service.id} value={service.id}>{service.tenDichVu}</option>)}
          </select>
        </label>
        <p className="self-center">Đơn giá {existing ? "đã chốt" : "hiện tại"}:
          {" "}{formatMoney(existing?.donGia ?? selected?.donGiaHienTai)}</p>
        {meter ? <>
          <label>Chỉ số cũ
            <input required type="number" min="0" step="0.001" value={form.chiSoCu}
              className={control + " w-full"} onChange={(e) => setForm({ ...form, chiSoCu: e.target.value })} />
          </label>
          <label>Chỉ số mới
            <input required type="number" min="0" step="0.001" value={form.chiSoMoi}
              className={control + " w-full"} onChange={(e) => setForm({ ...form, chiSoMoi: e.target.value })} />
          </label>
        </> : <label>Số lượng
          <input required type="number" min="0.001" step="0.001" value={form.soLuong}
            className={control + " w-full"} onChange={(e) => setForm({ ...form, soLuong: e.target.value })} />
        </label>}
        <div className="flex gap-2"><button className={control}>Lưu</button>
          <button type="button" className={control} onClick={reset}>Hủy sửa</button></div>
      </fieldset>
    </form>}
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-left">
        <thead><tr><th>Dịch vụ</th><th>Chỉ số cũ → mới</th><th>Số lượng</th><th>Đơn giá chốt</th>
          <th>Thành tiền</th><th>Thao tác</th></tr></thead>
        <tbody>{lines.map((line) => <tr key={line.id} className="border-t">
          <td className="py-3">{line.tenDichVu} ({line.donViTinh})</td>
          <td>{line.tinhTheoChiSo ? formatDecimal(line.chiSoCu) + " → " + formatDecimal(line.chiSoMoi) : "—"}</td>
          <td>{formatDecimal(line.soLuong)}</td><td>{formatMoney(line.donGia)}</td>
          <td>{formatMoney(line.thanhTien)}</td><td>{invoice.coTheChinhSua && <div className="flex gap-3">
            <button disabled={busy} className="text-blue-600" onClick={() => {
              setEditingId(line.id); setForm({ dichVuId: line.dichVuId, chiSoCu: line.chiSoCu ?? "",
                chiSoMoi: line.chiSoMoi ?? "", soLuong: line.soLuong }); setNotice("");
            }}>Sửa</button>
            <button disabled={busy} className="text-red-600" onClick={() => {
              if (window.confirm("Xóa dòng dịch vụ này?")) remove.mutate({ hoaDonId: invoice.id, id: line.id });
            }}>Xóa</button>
          </div>}</td>
        </tr>)}</tbody>
      </table>
      {lines.length === 0 && <p className="py-3">Chưa có dòng dịch vụ.</p>}
    </div>
  </div>;
}
