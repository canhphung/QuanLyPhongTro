import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAccount from "../../hooks/useAccount";
import { getThanhToanPage, createThanhToan, updateThanhToan, deleteThanhToan } from "../../api/thanhToanApi";
import { getAllHoaDon, getHoaDonById } from "../../api/hoaDonApi";
import { decimalUnits } from "../../utils/decimalValues";
import { receiptLimit, validReceipt, receiptAmount } from "../../utils/paymentValues";
import getErrorMessage from "../../utils/getErrorMessage";
import Pagination from "../../components/common/Pagination";
import ThanhToanForm from "./components/ThanhToanForm";
import ThanhToanTable from "./components/ThanhToanTable";
const empty = { hoaDonId: "", soTien: "", phuongThuc: "TIEN_MAT", maGiaoDich: "", ngayThanhToan: "" };

export default function ThanhToanPage() {
  const { data: account } = useAccount();
  const client = useQueryClient();
  const [page, setPage] = useState(0), [size, setSize] = useState(10);
  const [filter, setFilter] = useState(""), [form, setForm] = useState(null);
  const [editing, setEditing] = useState(null), [notice, setNotice] = useState("");
  const params = { page, size, hoaDonId: filter || undefined };
  const payments = useQuery({ queryKey: ["thanh-toan", account?.id, params],
    queryFn: ({ signal }) => getThanhToanPage(params, signal), enabled: Boolean(account) });
  const bills = useQuery({ queryKey: ["hoa-don", account?.id, "receipt-options"],
    queryFn: ({ signal }) => getAllHoaDon(undefined, signal), enabled: Boolean(account) });
  const invoice = useQuery({ queryKey: ["hoa-don", account?.id, "detail", Number(form?.hoaDonId)],
    queryFn: ({ signal }) => getHoaDonById(form.hoaDonId, signal), enabled: Boolean(form?.hoaDonId) });
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
      <button className={control} disabled={busy || bills.isFetching || bills.isError}
        onClick={() => { setEditing(null); setForm({ ...empty }); setNotice(""); }}>Ghi nhận khoản thu</button>
    </div>
    <p className="mb-3 text-gray-600">Ghi nhận tiền đã nhận từ người thuê. Thời gian thu dùng giờ Việt Nam.</p>
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
      <select aria-label="Số dòng mỗi trang" className={control} value={size} disabled={busy}
        onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}>
        {[10, 20, 50].map((n) => <option key={n} value={n}>{n} dòng/trang</option>)}
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
        <Pagination page={page} totalPages={payments.data.totalPages} onPageChange={setPage} disabled={busy} />
      </>}
  </div>;
}
