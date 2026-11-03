import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAccount from "../../../hooks/useAccount";
import { getAllPhong } from "../../../api/phongApi";
import { getTinDangPage, getTinDang, saveTinDang, actionTinDang, deleteTinDang } from "../../../api/tinDangApi";
import { formatMoney, validDecimal, normalizeDecimal } from "../../../utils/decimalValues";
import { listingImages, listingStatuses } from "../../../utils/listingValues";
import getErrorMessage from "../../../utils/getErrorMessage";
import Pagination from "../../../components/common/Pagination";
import TinDangDetail from "../../../components/listings/TinDangDetail";
import TinDangForm from "./components/TinDangForm";
const empty = { phongId: "", tieuDe: "", moTa: "", giaThue: "", soDienThoaiLienHe: "", images: "", phienBan: null };
export default function TinDangPage() {
  const { data: account } = useAccount(), client = useQueryClient();
  const [page, setPage] = useState(0), [size, setSize] = useState(10);
  const [status, setStatus] = useState(""), [input, setInput] = useState(""), [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState(null), [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null), [notice, setNotice] = useState("");
  const params = { page, size, trangThai: status || undefined, keyword: keyword || undefined };
  const list = useQuery({ queryKey: ["tin-dang", account?.id, "page", params],
    queryFn: ({ signal }) => getTinDangPage(params, signal), enabled: Boolean(account) });
  const rooms = useQuery({ queryKey: ["phong", account?.id, "listing-options"], queryFn: getAllPhong, enabled: Boolean(account) });
  const detail = useQuery({ queryKey: ["tin-dang", account?.id, "detail", selectedId],
    queryFn: ({ signal }) => getTinDang(selectedId, signal), enabled: Boolean(account && selectedId) });
  useEffect(() => {
    if (list.data && !list.isFetching && !list.isError && page >= list.data.totalPages && page > 0)
      setPage(Math.max(0, list.data.totalPages - 1));
  }, [list.data, list.isFetching, list.isError, page]);
  const reset = () => { setForm(null); setEditingId(null); };
  const refresh = () => Promise.all(["tin-dang", "admin-tin-dang", "public-tin-dang"].map(
    (key) => client.invalidateQueries({ queryKey: [key, account?.id] })));
  const onError = async (error) => {
    setNotice(getErrorMessage(error, "Không thể thực hiện; tải lại tin trước khi thử lại."));
    await refresh();
  };
  const saved = async () => { reset(); setNotice("Đã lưu tin nháp. Hãy kiểm tra rồi gửi duyệt."); await refresh(); };
  const save = useMutation({ mutationFn: saveTinDang, onSuccess: saved, onError });
  const act = useMutation({ mutationFn: actionTinDang, onSuccess: async () => { setNotice("Đã cập nhật trạng thái tin."); await refresh(); }, onError });
  const remove = useMutation({ mutationFn: deleteTinDang, onSuccess: async (_, { id }) => {
    if (selectedId === id) setSelectedId(null); if (editingId === id) reset();
    setNotice("Đã xóa nháp."); await refresh();
  }, onError });
  const busy = save.isPending || act.isPending || remove.isPending || list.isFetching;
  const control = "rounded border bg-white px-3 py-2 disabled:opacity-50";
  const edit = (tin) => {
    setEditingId(tin.id); setNotice("");
    setForm({ phongId: tin.phongId, tieuDe: tin.tieuDe, moTa: tin.moTa, giaThue: tin.giaThue,
      soDienThoaiLienHe: tin.soDienThoaiLienHe, images: tin.anhUrls.join("\n"), phienBan: tin.phienBan });
  };
  const submit = (e) => {
    e.preventDefault(); if (busy || rooms.isFetching || rooms.isError) return;
    if (!validDecimal(form.giaThue, 19, 0, false)) { setNotice("Giá phải nguyên dương, tối đa 19 chữ số."); return; }
    try {
      save.mutate({ id: editingId, data: { phongId: Number(form.phongId), tieuDe: form.tieuDe.trim(),
        moTa: form.moTa.trim(), giaThue: normalizeDecimal(form.giaThue), soDienThoaiLienHe: form.soDienThoaiLienHe.trim(),
        anhUrls: listingImages(form.images), phienBan: form.phienBan } });
    } catch (error) { setNotice(error.message); }
  };
  const action = (tin, value) => {
    if (busy) return;
    if (window.confirm(value === "gui-duyet" ? "Gửi tin này cho ADMIN duyệt?" :
      value === "rut-duyet" ? "Rút yêu cầu duyệt để sửa nội dung?" : "Ẩn tin khỏi website?"))
      act.mutate({ id: tin.id, action: value, phienBan: tin.phienBan });
  };
  return <div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">Tin đăng của tôi</h1>
      <button className={control} disabled={busy || rooms.isFetching || rooms.isError}
        onClick={() => { setForm({ ...empty }); setEditingId(null); setNotice(""); }}>Tạo tin đăng</button>
    </div>
    <p className="mb-3">Mỗi phòng có một tin. Chỉ tin đã duyệt của phòng đang trống được công khai.</p>
    {notice && <p role="status" className="mb-3 whitespace-pre-line">{notice}</p>}
    <form className="mb-4 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); setKeyword(input.trim()); setPage(0); }}>
      <input aria-label="Tìm tiêu đề hoặc địa chỉ" value={input} onChange={(e) => setInput(e.target.value)}
        placeholder="Tìm tiêu đề hoặc địa chỉ..." className={control} />
      <button disabled={busy} className={control}>Tìm</button>
      <select aria-label="Lọc trạng thái tin" value={status} className={control} disabled={busy}
        onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
        <option value="">Tất cả trạng thái</option>{Object.entries(listingStatuses).map(([value, label]) =>
          <option key={value} value={value}>{label}</option>)}
      </select><button type="button" className={control} disabled={busy} onClick={refresh}>Làm mới</button>
    </form>
    {rooms.isError && <p className="text-red-600">Không tải được phòng. <button onClick={() => rooms.refetch()}>Thử lại</button></p>}
    {form && <TinDangForm form={form} setForm={setForm} editingId={editingId} rooms={rooms.data ?? []}
      disabled={busy || rooms.isFetching || rooms.isError} onSubmit={submit} onCancel={reset} />}
    {list.isError ? <p className="text-red-600">{getErrorMessage(list.error, "Không tải được tin")}
      <button onClick={() => list.refetch()}>Thử lại</button></p> : list.isPending ? <p>Đang tải tin...</p> : <>
      <div className="overflow-x-auto rounded bg-white p-3 shadow"><table className="w-full text-left">
        <thead><tr><th>Tin / Phòng</th><th>Giá đăng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>{list.data.content.map((tin) => <tr key={tin.id} className="border-t">
          <td className="py-3">{tin.tieuDe}<br /><small>{tin.tenNhaTro} · {tin.soPhong}</small></td>
          <td>{formatMoney(tin.giaThue)}</td><td>{listingStatuses[tin.trangThai]}<br />
            <small>{tin.dangHienThi ? "Đang công khai" : "Chưa công khai"}</small></td>
          <td className="flex flex-wrap gap-3 py-3">
            <button className="text-blue-600" disabled={busy} onClick={() => setSelectedId(tin.id)}>Chi tiết / Lịch sử</button>
            <button className="text-blue-600" disabled={busy || !tin.coTheChinhSua} onClick={() => edit(tin)}>Sửa</button>
            <button className="text-blue-600" disabled={busy || !tin.coTheGuiDuyet} onClick={() => action(tin, "gui-duyet")}>Gửi duyệt</button>
            {tin.trangThai === "CHO_DUYET" && <button disabled={busy} onClick={() => action(tin, "rut-duyet")}>Rút yêu cầu</button>}
            {tin.trangThai === "DA_DUYET" && <button disabled={busy} onClick={() => action(tin, "an")}>Ẩn tin</button>}
            <button className="text-red-600" disabled={busy || !tin.coTheXoa} onClick={() => {
              if (window.confirm("Xóa tin nháp này?")) remove.mutate({ id: tin.id, phienBan: tin.phienBan });
            }}>Xóa nháp</button>
          </td>
        </tr>)}</tbody>
      </table>{list.data.content.length === 0 && <p className="py-3">Chưa có tin phù hợp.</p>}</div>
      <Pagination page={page} size={size} totalElements={list.data.totalElements} totalPages={list.data.totalPages}
        disabled={busy} onPageChange={setPage} onSizeChange={(next) => { setSize(next); setPage(0); }} />
    </>}
    {selectedId && <section className="mt-5 rounded bg-white p-4 shadow">
      <button className="mb-3 text-blue-600" disabled={busy} onClick={() => setSelectedId(null)}>Đóng chi tiết</button>
      {detail.isError ? <p className="text-red-600">{getErrorMessage(detail.error, "Không tải được chi tiết")}
        <button onClick={() => detail.refetch()}>Thử lại</button></p> : detail.isPending ? <p>Đang tải...</p> :
        <TinDangDetail key={selectedId} tin={detail.data} accountId={account.id} />}
    </section>}
  </div>;
}
