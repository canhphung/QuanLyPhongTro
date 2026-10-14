import { useNavigate, useSearchParams } from "react-router-dom";
import { positiveIdParam } from "../../utils/managementNavigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getHoaDonPage, getHoaDonById, createHoaDon, updateHoaDon, deleteHoaDon } from "../../api/hoaDonApi";
import { getAllHopDong } from "../../api/hopDongApi";
import useAccount from "../../hooks/useAccount";
import getErrorMessage from "../../utils/getErrorMessage";
import { normalizeDecimal, validDecimal } from "../../utils/decimalValues";
import Pagination from "../../components/common/Pagination";
import HoaDonForm from "./components/HoaDonForm";
import HoaDonTable from "./components/HoaDonTable";
import ChiTietPanel from "./components/ChiTietPanel";

const emptyForm = { hopDongId: "", kyThanhToan: "", ngayLap: "", hanThanhToan: "", tienPhong: "" };

export default function HoaDonPage() {
  const client = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedParam = positiveIdParam(searchParams.get("hoaDonId"));
  const selectedId = selectedParam ? Number(selectedParam) : null;
  const contractId = positiveIdParam(searchParams.get("hopDongId"));
  const setSelectedId = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id == null) next.delete("hoaDonId"); else next.set("hoaDonId", String(id));
    setSearchParams(next);
  };
  const setContractId = (id) => {
    const next = new URLSearchParams(searchParams);
    next.delete("hoaDonId");
    if (id) next.set("hopDongId", String(id)); else next.delete("hopDongId");
    setSearchParams(next);
  };
  const { data: account } = useAccount();
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [lineBusy, setLineBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const params = { page, size, keyword: keyword || undefined, trangThai: status || undefined,
    hopDongId: contractId || undefined };
  const bills = useQuery({ queryKey: ["hoa-don", account?.id, "page", params],
    queryFn: ({ signal }) => getHoaDonPage(params, signal), enabled: Boolean(account) });
  const contracts = useQuery({ queryKey: ["hop-dong", account?.id, "bill-options"],
    queryFn: getAllHopDong, enabled: Boolean(account) });
  const detail = useQuery({ queryKey: ["hoa-don", account?.id, "detail", selectedId],
    queryFn: ({ signal }) => getHoaDonById(selectedId, signal), enabled: selectedId != null });
  useEffect(() => {
    if (bills.data && !bills.isFetching && !bills.isError) {
      const last = Math.max(0, bills.data.totalPages - 1);
      if (page > last) setPage(last);
    }
  }, [bills.data, bills.isFetching, bills.isError, page]);
  useEffect(() => {
    setPage(0); setLineBusy(false); setForm(null); setEditingId(null);
  }, [contractId, selectedId]);
  const reset = () => { setForm(null); setEditingId(null); };
  const refresh = () => Promise.all(["hoa-don", "dashboard"].map(
    (key) => client.invalidateQueries({ queryKey: [key, account?.id] })));
  const onError = (error) => setNotice(getErrorMessage(error, "Không thể thực hiện yêu cầu"));
  const save = useMutation({
    mutationFn: ({ id, data }) => id == null ? createHoaDon(data) : updateHoaDon({ id, data }),
    onSuccess: async () => { reset(); setNotice("Đã lưu hóa đơn."); await refresh(); }, onError,
  });
  const remove = useMutation({ mutationFn: deleteHoaDon,
    onSuccess: async (_, id) => {
      if (editingId === id) reset();
      if (selectedId === id) { setSelectedId(null); setLineBusy(false); }
      setNotice("Đã xóa hóa đơn."); await refresh();
    }, onError,
  });
  const writing = save.isPending || remove.isPending;
  const busy = writing || lineBusy || bills.isFetching;
  const control = "rounded border bg-white px-3 py-2 disabled:opacity-50";
  const edit = (bill) => {
    if (busy || !bill.coTheChinhSua) return;
    setEditingId(bill.id);
    setForm({ hopDongId: bill.hopDongId, kyThanhToan: bill.kyThanhToan.slice(0, 7),
      ngayLap: bill.ngayLap, hanThanhToan: bill.hanThanhToan, tienPhong: bill.tienPhong });
  };
  const submit = (e) => {
    e.preventDefault();
    if (busy || contracts.isFetching || contracts.isError) return;
    const rent = String(form.tienPhong).trim();
    if (rent && !validDecimal(rent, 19, 0)) { setNotice("Tiền phòng nguyên không âm, tối đa 19 chữ số."); return; }
    save.mutate({ id: editingId, data: { ...form, hopDongId: Number(form.hopDongId),
      kyThanhToan: form.kyThanhToan + "-01", tienPhong: rent ? normalizeDecimal(rent) : null } });
  };
  return <div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">Quản lý hóa đơn</h1>
      <button className={control} disabled={busy || contracts.isFetching || contracts.isError}
        onClick={() => { setEditingId(null); setForm({ ...emptyForm, hopDongId: contractId }); setNotice(""); }}>Thêm hóa đơn</button>
    </div>
    {notice && <p role="status" className="mb-3 whitespace-pre-line">{notice}</p>}
    <form className="mb-4 flex flex-wrap gap-2" onSubmit={(e) => {
      e.preventDefault(); setKeyword(input.trim()); setPage(0);
    }}>
      <input aria-label="Tìm số phòng" value={input} onChange={(e) => setInput(e.target.value)}
        placeholder="Tìm số phòng..." className={control} />
      <button disabled={busy} className={control}>Tìm</button>
      <select aria-label="Lọc trạng thái hóa đơn" value={status} disabled={busy}
        onChange={(e) => { setStatus(e.target.value); setPage(0); }} className={control}>
        <option value="">Tất cả trạng thái</option><option value="CHUA_THANH_TOAN">Chưa thanh toán</option>
        <option value="THANH_TOAN_MOT_PHAN">Thanh toán một phần</option><option value="DA_THANH_TOAN">Đã thanh toán</option>
      </select>
      <select aria-label="Lọc hợp đồng" value={contractId} disabled={busy || contracts.isFetching}
        onChange={(e) => { setContractId(e.target.value); setPage(0); }} className={control}>
        <option value="">Tất cả hợp đồng</option>
        {(contracts.data ?? []).map((h) => <option key={h.id} value={h.id}>
          HĐ #{h.id} · {h.tenNhaTro} · {h.soPhong}
        </option>)}
      </select>
    </form>
    {contracts.isError && <p className="text-red-600">Không tải được hợp đồng.
      <button onClick={() => contracts.refetch()}>Thử lại</button></p>}
    {form && <HoaDonForm formData={form} editingId={editingId} hopDongs={contracts.data ?? []}
      isSaving={busy || contracts.isFetching || contracts.isError} onChange={(e) => {
        const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value }));
      }} onSubmit={submit} onCancel={reset} />}
    {bills.isError ? <div className="text-red-600"><p>{getErrorMessage(bills.error, "Không tải được hóa đơn")}</p>
      <button onClick={() => bills.refetch()}>Thử lại</button></div> : bills.isPending ? <p>Đang tải...</p> : <>
      <HoaDonTable hoaDons={bills.data.content} onEdit={edit} onDelete={(bill) => {
        if (!busy && bill.coTheChinhSua && window.confirm("Xóa hóa đơn cùng các dòng dịch vụ?")) remove.mutate(bill.id);
      }} onPayments={(bill) => navigate("/thanh-toan?hoaDonId=" + bill.id)} onDetail={(bill) => { if (!busy) { setSelectedId(bill.id); setLineBusy(false); } }} isDeleting={busy} />
      <Pagination page={page} size={size} totalElements={bills.data.totalElements}
        totalPages={bills.data.totalPages} disabled={busy} onPageChange={setPage}
        onSizeChange={(n) => { setSize(n); setPage(0); }} />
    </>}
    {selectedId != null && <section className="mt-6 rounded bg-white p-4 shadow">
      <button className="mb-3 text-blue-600" disabled={busy}
        onClick={() => { setSelectedId(null); setLineBusy(false); }}>Đóng chi tiết</button>
      {detail.isError ? <div><p>Không tải được chi tiết hóa đơn.</p>
        <button onClick={() => detail.refetch()}>Thử lại</button></div> :
        detail.isPending ? <p>Đang tải...</p> : <ChiTietPanel key={selectedId} invoice={detail.data}
          accountId={account.id} disabled={writing || detail.isFetching} onBusyChange={setLineBusy} />}
    </section>}
  </div>;
}
