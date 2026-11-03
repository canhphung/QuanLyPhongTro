import { useNavigate } from "react-router-dom";
import { normalizeDecimal, validDecimal } from "../../../utils/decimalValues.js";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createHopDong, getHopDongPage, getHopDongById,
  updateHopDong, ketThucHopDong, huyHopDong } from "../../../api/hopDongApi.js";
import { getAllPhong } from "../../../api/phongApi.js";
import useAccount from "../../../hooks/useAccount.js";
import getErrorMessage from "../../../utils/getErrorMessage.js";
import Pagination from "../../../components/common/Pagination.jsx";
import HopDongForm from "./components/HopDongForm.jsx";
import HopDongTable from "./components/HopDongTable.jsx";
import ThanhVienPanel from "./components/ThanhVienPanel.jsx";

const emptyForm = { phongId: "", ngayBatDau: "", ngayKetThuc: "",
  giaThueThoaThuan: "", tienCoc: "0" };

export default function HopDongPage() {
  const client = useQueryClient();
  const navigate = useNavigate();
  const { data: account } = useAccount();
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [memberBusy, setMemberBusy] = useState(false);
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [trangThai, setTrangThai] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [notice, setNotice] = useState("");
  const params = { page, size, keyword: keyword || undefined, trangThai: trangThai || undefined };

  const contracts = useQuery({ queryKey: ["hop-dong", account?.id, "page", params],
    queryFn: ({ signal }) => getHopDongPage(params, signal), enabled: Boolean(account) });
  const rooms = useQuery({ queryKey: ["phong", account?.id, "contract-options"],
    queryFn: getAllPhong, enabled: Boolean(account) });
  const detail = useQuery({ queryKey: ["hop-dong", account?.id, "detail", selectedId],
    queryFn: ({ signal }) => getHopDongById(selectedId, signal), enabled: selectedId != null });
  useEffect(() => {
    if (contracts.data && !contracts.isFetching && !contracts.isError) {
      const last = Math.max(0, contracts.data.totalPages - 1);
      if (page > last) setPage(last);
    }
  }, [contracts.data, contracts.isFetching, contracts.isError, page]);

  const reset = () => { setForm(null); setEditingId(null); };
  const refresh = () => Promise.all([
    client.invalidateQueries({ queryKey: ["hop-dong", account?.id] }),
    client.invalidateQueries({ queryKey: ["phong", account?.id] }),
    client.invalidateQueries({ queryKey: ["dashboard", account?.id] }),
    client.invalidateQueries({ queryKey: ["thanh-vien", account?.id] }),
  ]);
  const onError = (error) => setNotice(getErrorMessage(error, "Không thể thực hiện yêu cầu"));
  const onSuccess = async () => { reset(); setNotice("Đã cập nhật hợp đồng."); await refresh(); };
  const save = useMutation({
    mutationFn: ({ id, data }) => id == null ? createHopDong(data) : updateHopDong({ id, data }),
    onSuccess, onError,
  });
  const close = useMutation({ mutationFn: ketThucHopDong, onSuccess, onError });
  const cancel = useMutation({ mutationFn: huyHopDong, onSuccess, onError });
  const writing = save.isPending || close.isPending || cancel.isPending;
  const busy = writing || memberBusy || contracts.isFetching;
  const control = "rounded border bg-white px-3 py-2 disabled:opacity-50";

  const edit = (contract) => {
    if (busy) return;
    setEditingId(contract.id);
    setForm({ phongId: contract.phongId, ngayBatDau: contract.ngayBatDau,
      ngayKetThuc: contract.ngayKetThuc, giaThueThoaThuan: normalizeDecimal(contract.giaThueThoaThuan),
      tienCoc: normalizeDecimal(contract.tienCoc) });
  };
  const submit = (event) => {
    event.preventDefault();
    if (busy || rooms.isFetching || rooms.isError) return;
    const rent = String(form.giaThueThoaThuan).trim(), deposit = String(form.tienCoc).trim();
    if (!form.phongId || !validDecimal(rent, 19, 0, false) || !validDecimal(deposit, 19, 0)) {
      setNotice("Chọn phòng; giá thuê nguyên dương và cọc nguyên không âm, tối đa 19 chữ số."); return;
    }
    save.mutate({ id: editingId, data: { ...form, phongId: Number(form.phongId),
      giaThueThoaThuan: normalizeDecimal(rent), tienCoc: normalizeDecimal(deposit) } });
  };
  const endContract = (contract) => {
    if (busy) return;
    const date = window.prompt("Ngày trả phòng thực tế (YYYY-MM-DD):");
    if (date == null) return;
    const reason = window.prompt("Lý do kết thúc:");
    if (reason == null) return;
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date.trim()) || !reason.trim() || reason.trim().length > 500) {
      setNotice("Nhập ngày YYYY-MM-DD và lý do từ 1 đến 500 ký tự."); return;
    }
    if (window.confirm("Kết thúc hợp đồng? Hóa đơn và công nợ vẫn được giữ."))
      close.mutate({ id: contract.id, data: { ngayKetThucThucTe: date.trim(), lyDoKetThuc: reason.trim() } });
  };
  const cancelContract = (contract) => {
    if (!busy && window.confirm("Hủy hợp đồng và trả phòng về trống?"))
      cancel.mutate(contract.id);
  };

  return <div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">Quản lý hợp đồng</h1>
      <button className={control} disabled={busy || rooms.isFetching || rooms.isError}
        onClick={() => { setEditingId(null); setForm({ ...emptyForm }); setNotice(""); }}>Thêm hợp đồng</button>
    </div>
    {notice && <p role="status" className="mb-3 whitespace-pre-line">{notice}</p>}
    <form className="mb-4 flex flex-wrap gap-2" onSubmit={(e) => {
      e.preventDefault(); setKeyword(input.trim()); setPage(0);
    }}>
      <input aria-label="Tìm số phòng" value={input} onChange={(e) => setInput(e.target.value)}
        placeholder="Tìm số phòng..." className={control} />
      <button disabled={busy} className={control}>Tìm</button>
      <select aria-label="Trạng thái hợp đồng" value={trangThai} disabled={busy}
        onChange={(e) => { setTrangThai(e.target.value); setPage(0); }} className={control}>
        <option value="">Tất cả trạng thái</option>
        <option value="DANG_HIEU_LUC">Đang hiệu lực</option><option value="DA_KET_THUC">Đã kết thúc</option>
        <option value="DA_HUY">Đã hủy</option><option value="HET_HAN">Hết hạn</option>
      </select>
    </form>
    {rooms.isError && <p className="text-red-600">Không tải được phòng.
      <button onClick={() => rooms.refetch()}>Thử lại</button></p>}
    {form && <HopDongForm formData={form} editingId={editingId} phongs={rooms.data ?? []}
      isSaving={busy || rooms.isFetching} onChange={(e) => {
        const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value }));
      }} onSubmit={submit} onCancel={reset} />}
    {contracts.isError ? <div className="text-red-600">
      <p>{getErrorMessage(contracts.error, "Không tải được hợp đồng")}</p>
      <button onClick={() => contracts.refetch()}>Thử lại</button>
    </div> : contracts.isPending ? <p>Đang tải hợp đồng...</p> : <>
      <HopDongTable hopDongs={contracts.data.content} onEdit={edit} onKetThuc={endContract}
        onHuy={cancelContract} onInvoices={(item) => navigate("/hoa-don?hopDongId=" + item.id)} onMembers={(item) => {
          if (!busy) { setSelectedId(item.id); setMemberBusy(false); }
        }} isProcessing={busy} />
      <Pagination page={page} size={size} totalElements={contracts.data.totalElements}
        totalPages={contracts.data.totalPages} disabled={busy} onPageChange={setPage}
        onSizeChange={(value) => { setSize(value); setPage(0); }} />
    </>}
    {selectedId != null && <section className="mt-6 rounded bg-white p-4 shadow">
      <button disabled={busy} className="mb-3 text-blue-600"
        onClick={() => { setSelectedId(null); setMemberBusy(false); }}>Đóng chi tiết</button>
      {detail.isError ? <div><p>Không tải được chi tiết hợp đồng.</p>
        <button onClick={() => detail.refetch()}>Thử lại</button></div>
        : detail.isPending ? <p>Đang tải...</p> :
        <ThanhVienPanel key={selectedId} contract={detail.data} accountId={account.id}
          disabled={writing || detail.isFetching} onBusyChange={setMemberBusy} />}
    </section>}
  </div>;
}
