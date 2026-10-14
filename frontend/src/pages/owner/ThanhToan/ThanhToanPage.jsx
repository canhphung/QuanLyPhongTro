import { Link, useSearchParams } from "react-router-dom";
import { positiveIdParam } from "../../../utils/managementNavigation.js";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAccount from "../../../hooks/useAccount.js";
import { getThanhToanPage, createThanhToan, updateThanhToan, deleteThanhToan } from "../../../api/thanhToanApi.js";
import { getAllHoaDon, getHoaDonById } from "../../../api/hoaDonApi.js";
import { decimalUnits, formatMoney } from "../../../utils/decimalValues.js";
import { receiptLimit, validReceipt, receiptAmount } from "../../../utils/paymentValues.js";
import getErrorMessage from "../../../utils/getErrorMessage.js";
import Pagination from "../../../components/common/Pagination.jsx";
import ThanhToanForm from "./components/ThanhToanForm.jsx";
import ThanhToanTable from "./components/ThanhToanTable.jsx";
const empty = { hoaDonId: "", soTien: "", phuongThuc: "TIEN_MAT", maGiaoDich: "", ngayThanhToan: "" };

export default function ThanhToanPage() {
  const { data: account } = useAccount();
  const client = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = positiveIdParam(searchParams.get("hoaDonId"));
  const setFilter = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("hoaDonId", value); else next.delete("hoaDonId");
    setSearchParams(next);
  };
  const [page, setPage] = useState(0), [size, setSize] = useState(10);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(null), [notice, setNotice] = useState("");
  const params = { page, size, hoaDonId: filter || undefined };
  const payments = useQuery({ queryKey: ["thanh-toan", account?.id, params],
    queryFn: ({ signal }) => getThanhToanPage(params, signal), enabled: Boolean(account) });
  const bills = useQuery({ queryKey: ["hoa-don", account?.id, "receipt-options"],
    queryFn: ({ signal }) => getAllHoaDon(undefined, signal), enabled: Boolean(account) });
  const invoice = useQuery({ queryKey: ["hoa-don", account?.id, "detail", Number(form?.hoaDonId)],
    queryFn: ({ signal }) => getHoaDonById(form.hoaDonId, signal), enabled: Boolean(form?.hoaDonId) });
  const history = useQuery({ queryKey: ["hoa-don", account?.id, "detail", Number(filter)],
    queryFn: ({ signal }) => getHoaDonById(filter, signal), enabled: Boolean(account && filter) });
  useEffect(() => { setPage(0); setForm(null); setEditing(null); }, [filter]);
  useEffect(() => {
    if (payments.data && !payments.isFetching && !payments.isError) {
      const last = Math.max(0, payments.data.totalPages - 1);
      if (page > last) setPage(last);
    }
  }, [payments.data, payments.isFetching, payments.isError, page]);
  const reset = () => { setForm(null); setEditing(null); };
  const refresh = () => Promise.all(["thanh-toan", "hoa-don", "dashboard"].map(
    (key) => client.invalidateQueries({ queryKey: [key, account?.id] })));
  const onError = (error) => { setNotice(getErrorMessage(error, "Không thể lưu khoản thu")); refresh(); };
  const save = useMutation({ mutationFn: ({ id, data }) => id == null ? createThanhToan(data) : updateThanhToan({ id, data }),
    onSuccess: async () => { reset(); setNotice("Đã lưu khoản thu."); await refresh(); }, onError });
  const remove = useMutation({ mutationFn: deleteThanhToan,
    onSuccess: async (_, id) => { if (editing?.id === id) reset(); setNotice("Đã xóa khoản thu."); await refresh(); }, onError });
  const writing = save.isPending || remove.isPending;
  const busy = writing || payments.isFetching;
  const limit = invoice.data ? receiptLimit(invoice.data.conThieu, editing?.soTien ?? "0") : "0";
  const options = (bills.data ?? []).filter((bill) =>
    bill.id === editing?.hoaDonId || decimalUnits(bill.conThieu, 0) > 0n);
  const control = "rounded border bg-white px-3 py-2 disabled:opacity-50";
  return <div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">Thanh toán</h1>
      <button className={control} disabled={busy || bills.isFetching || bills.isError || options.length === 0}
        onClick={() => { setEditing(null); setForm({ ...empty, hoaDonId: options.some((bill) => String(bill.id) === filter) ? filter : "" }); setNotice(""); }}>Ghi nhận khoản thu</button>
    </div>
    <p className="mb-3 text-gray-600">Ghi nhận tiền đã nhận từ người thuê. Thời gian thu dùng giờ Việt Nam.</p>
    {filter && <section className="mb-4 rounded bg-white p-4 shadow">
      {history.isError ? <p className="text-red-600">{getErrorMessage(history.error, "Không tải được hóa đơn")}
        <button onClick={() => history.refetch()}>Thử lại</button></p> : history.isPending ? <p>Đang tải hóa đơn...</p> : <>
        <h2 className="mb-2 font-semibold">Hóa đơn #{history.data.id} · {history.data.tenNhaTro} · {history.data.soPhong} · Kỳ {history.data.kyThanhToan.slice(0, 7)}</h2>
        <p>Tổng: {formatMoney(history.data.tongTien)} · Đã thu: {formatMoney(history.data.daThanhToan)} · Còn thiếu: {formatMoney(history.data.conThieu)}</p>
        <Link className="text-blue-700" to={"/hoa-don?hopDongId=" + history.data.hopDongId + "&hoaDonId=" + history.data.id}>Xem hóa đơn và dịch vụ</Link>
      </>}
    </section>}
    {bills.isSuccess && options.length === 0 && <p className="mb-3">Không có hóa đơn còn thiếu để ghi khoản thu mới.</p>}
    {notice && <p role="status" className="mb-3 whitespace-pre-line">{notice}</p>}
    {bills.isError && <p className="mb-3 text-red-600">{getErrorMessage(bills.error, "Không tải được hóa đơn")}
      <button onClick={() => bills.refetch()}>Thử lại</button></p>}
    {form && <ThanhToanForm form={form} setForm={setForm} editingId={editing?.id ?? null}
      invoices={options} invoice={invoice.data} limit={limit}
      disabled={busy} canSave={!bills.isFetching && !bills.isError && !invoice.isFetching && !invoice.isError}
      onCancel={reset} onSubmit={(e) => {
        e.preventDefault();
        if (busy || bills.isFetching || bills.isError || invoice.isFetching || invoice.isError || !invoice.data) return;
        if (!validReceipt(form.soTien, limit)) { setNotice("Số tiền nguyên dương, tối đa 19 chữ số và không vượt số tiền được thu."); return; }
        save.mutate({ id: editing?.id ?? null, data: { ...form, hoaDonId: Number(form.hoaDonId),
          soTien: receiptAmount(form.soTien), ngayThanhToan: form.ngayThanhToan || null,
          maGiaoDich: form.maGiaoDich.trim() || null } });
      }} />}
    {form?.hoaDonId && invoice.isError && <p className="mb-3 text-red-600">
      {getErrorMessage(invoice.error, "Không tải được số dư hóa đơn")} <button onClick={() => invoice.refetch()}>Thử lại</button></p>}
    <div className="mb-4 flex flex-wrap gap-3">
      <select aria-label="Lọc theo hóa đơn" className={control} value={filter} disabled={busy}
        onChange={(e) => { setFilter(e.target.value); setPage(0); }}>
        <option value="">Tất cả hóa đơn</option>
        {(bills.data ?? []).map((bill) => <option key={bill.id} value={bill.id}>
          #{bill.id} · {bill.tenNhaTro} · {bill.soPhong} · {bill.kyThanhToan.slice(0, 7)}</option>)}
      </select>
      <button className={control} disabled={busy} onClick={refresh}>Làm mới</button>
    </div>
    {payments.isError ? <div className="text-red-600">{getErrorMessage(payments.error, "Không tải được khoản thu")}
      <button onClick={() => payments.refetch()}>Thử lại</button></div> :
      payments.isPending ? <p>Đang tải khoản thu...</p> : <>
        <ThanhToanTable rows={payments.data.content} disabled={busy} onEdit={(row) => {
          setEditing(row); setForm({ hoaDonId: row.hoaDonId, soTien: row.soTien,
            phuongThuc: row.phuongThuc, maGiaoDich: row.maGiaoDich || "", ngayThanhToan: "" }); setNotice("");
        }} onDelete={(row) => {
          if (window.confirm("Xóa khoản thu #" + row.id + "? Số tiền còn thiếu của hóa đơn sẽ tăng."))
            remove.mutate(row.id);
        }} />
        <Pagination page={page} size={size} totalElements={payments.data.totalElements}
          totalPages={payments.data.totalPages} onPageChange={setPage} disabled={busy}
          onSizeChange={(next) => { setSize(next); setPage(0); }} />
      </>}
  </div>;
}
