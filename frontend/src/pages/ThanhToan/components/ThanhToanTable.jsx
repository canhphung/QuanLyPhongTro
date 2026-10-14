import { formatMoney } from "../../../utils/decimalValues";
import { receiptTime } from "../../../utils/paymentValues";
const methods = { TIEN_MAT: "Tiền mặt", CHUYEN_KHOAN: "Chuyển khoản", VI_DIEN_TU: "Ví điện tử" };
export default function ThanhToanTable({ rows, disabled, onEdit, onDelete }) {
  return <div className="overflow-x-auto rounded bg-white p-3 shadow">
    <table className="w-full text-left">
      <thead><tr><th>Khoản thu</th><th>Hóa đơn / Phòng</th><th>Ngày thu</th><th>Số tiền</th>
        <th>Phương thức / Mã giao dịch</th><th>Thao tác</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.id} className="border-t">
        <td className="py-3">#{row.id}</td><td>#{row.hoaDonId} · {row.tenNhaTro} · {row.soPhong}<br />{row.kyThanhToan.slice(0, 7)}</td>
        <td>{receiptTime(row.ngayThanhToan)}</td><td>{formatMoney(row.soTien)}</td>
        <td>{methods[row.phuongThuc]}<br />{row.maGiaoDich || "—"}</td>
        <td className="space-x-3"><button className="text-blue-600" disabled={disabled} onClick={() => onEdit(row)}>Sửa</button>
          <button className="text-red-600" disabled={disabled} onClick={() => onDelete(row)}>Xóa</button></td>
      </tr>)}</tbody>
    </table>{rows.length === 0 && <p className="py-3">Chưa có khoản thu.</p>}
  </div>;
}
