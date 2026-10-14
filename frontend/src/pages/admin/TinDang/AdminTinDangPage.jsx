import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAccount from "../../../hooks/useAccount";
import { getTinDangPage, getTinDang, actionTinDang } from "../../../api/tinDangApi";
import { formatMoney } from "../../../utils/decimalValues";
import { listingStatuses } from "../../../utils/listingValues";
import getErrorMessage from "../../../utils/getErrorMessage";
import Pagination from "../../../components/common/Pagination";
import TinDangDetail from "../../../components/listings/TinDangDetail";
export default function AdminTinDangPage() {
  const { data: account } = useAccount(), client = useQueryClient();
  const [page, setPage] = useState(0), [size, setSize] = useState(10);
  const [status, setStatus] = useState("CHO_DUYET"), [input, setInput] = useState(""), [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState(null), [reason, setReason] = useState(""), [notice, setNotice] = useState("");
  const params = { page, size, trangThai: status || undefined, keyword: keyword || undefined };
  const list = useQuery({ queryKey: ["admin-tin-dang", account?.id, "page", params],
    queryFn: ({ signal }) => getTinDangPage(params, signal, true), enabled: Boolean(account) });
  const detail = useQuery({ queryKey: ["admin-tin-dang", account?.id, "detail", selectedId],
    queryFn: ({ signal }) => getTinDang(selectedId, signal, true), enabled: Boolean(account && selectedId) });
  useEffect(() => {
    if (list.data && !list.isFetching && !list.isError && page > 0 && page >= list.data.totalPages)
      setPage(Math.max(0, list.data.totalPages - 1));
  }, [list.data, list.isFetching, list.isError, page]);
  const refresh = () => Promise.all(["admin-tin-dang", "tin-dang", "public-tin-dang"].map(
    (key) => client.invalidateQueries({ queryKey: [key, account?.id] })));
  const act = useMutation({ mutationFn: actionTinDang,
    onSuccess: async () => { setNotice("Đã xử lý tin đăng."); setReason(""); await refresh(); },
    onError: async (error) => { setNotice(getErrorMessage(error, "Không thể xử lý; tải lại nội dung trước khi thử lại.")); await refresh(); } });
  const busy = act.isPending || list.isFetching;
  const control = "rounded border bg-white px-3 py-2 disabled:opacity-50";
  const action = (value) => {
    if (busy || detail.isFetching || !detail.data) return;
    if (value !== "duyet" && !reason.trim()) { setNotice("Cần nhập lý do từ chối hoặc ẩn tin."); return; }
    if (window.confirm(value === "duyet" ? "Duyệt nội dung và ảnh của phiên bản đang xem?" :
      value === "tu-choi" ? "Từ chối tin đăng với lý do đã nhập?" : "Ẩn tin này khỏi website?"))
      act.mutate({ id: detail.data.id, action: value, phienBan: detail.data.phienBan,
        lyDo: value === "duyet" ? null : reason.trim(), admin: true });
  };
  return <div>
    <h1 className="mb-4 text-2xl font-bold">Kiểm duyệt tin đăng</h1>
    {notice && <p role="status" className="mb-3 whitespace-pre-line">{notice}</p>}
    <form className="mb-4 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); setKeyword(input.trim()); setPage(0); }}>
      <input aria-label="Tìm tiêu đề hoặc địa chỉ" value={input} onChange={(e) => setInput(e.target.value)}
        placeholder="Tìm tiêu đề hoặc địa chỉ..." className={control} />
      <button className={control} disabled={busy}>Tìm</button>
      <select aria-label="Lọc trạng thái kiểm duyệt" value={status} className={control} disabled={busy}
        onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
        <option value="">Tất cả trạng thái</option>{Object.entries(listingStatuses).map(([value, label]) =>
          <option key={value} value={value}>{label}</option>)}
      </select><button type="button" className={control} disabled={busy} onClick={refresh}>Làm mới</button>
    </form>
    {list.isError ? <p className="text-red-600">{getErrorMessage(list.error, "Không tải được tin")}
      <button onClick={() => list.refetch()}>Thử lại</button></p> : list.isPending ? <p>Đang tải...</p> : <>
      <div className="overflow-x-auto rounded bg-white p-3 shadow"><table className="w-full text-left">
        <thead><tr><th>Tin / Phòng</th><th>Giá đăng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>{list.data.content.map((tin) => <tr key={tin.id} className="border-t">
          <td className="py-3">{tin.tieuDe}<br /><small>{tin.tenNhaTro} · {tin.soPhong}</small></td>
          <td>{formatMoney(tin.giaThue)}</td><td>{listingStatuses[tin.trangThai]}</td>
          <td><button disabled={busy} className="text-blue-600" onClick={() => {
            setSelectedId(tin.id); setReason(""); setNotice("");
          }}>Xem và xét duyệt</button></td>
        </tr>)}</tbody>
      </table>{list.data.content.length === 0 && <p className="py-3">Không có tin phù hợp.</p>}</div>
      <Pagination page={page} size={size} totalElements={list.data.totalElements} totalPages={list.data.totalPages}
        onPageChange={setPage} onSizeChange={(next) => { setSize(next); setPage(0); }} disabled={busy} />
    </>}
    {selectedId && <section className="mt-5 rounded bg-white p-4 shadow">
      <button className="mb-3 text-blue-600" disabled={busy} onClick={() => setSelectedId(null)}>Đóng chi tiết</button>
      {detail.isError ? <p className="text-red-600">{getErrorMessage(detail.error, "Không tải được chi tiết")}
        <button onClick={() => detail.refetch()}>Thử lại</button></p> : detail.isPending ? <p>Đang tải...</p> : <>
        <TinDangDetail key={selectedId} tin={detail.data} accountId={account.id} admin />
        {["CHO_DUYET", "DA_DUYET"].includes(detail.data.trangThai) && <div className="mt-4 space-y-3">
          <label className="block">Lý do từ chối / ẩn<textarea aria-label="Lý do từ chối / ẩn" maxLength={1000} value={reason}
            disabled={busy || detail.isFetching} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
          <div className="flex flex-wrap gap-3">
            {detail.data.trangThai === "CHO_DUYET" ? <>
              <button disabled={busy || detail.isFetching} className={control} onClick={() => action("duyet")}>Duyệt tin</button>
              <button disabled={busy || detail.isFetching} className={control} onClick={() => action("tu-choi")}>Từ chối tin</button>
            </> : <button disabled={busy || detail.isFetching} className={control} onClick={() => action("an")}>Ẩn tin đã duyệt</button>}
          </div>
        </div>}
      </>}
    </section>}
  </div>;
}
