import { useQuery } from "@tanstack/react-query";
import { getLichSuTinDang } from "../../api/tinDangApi";
import { formatMoney, formatDecimal } from "../../utils/decimalValues";
import { listingStatuses } from "../../utils/listingValues";
import getErrorMessage from "../../utils/getErrorMessage";
const actions = { GUI_DUYET: "Gửi duyệt", RUT_DUYET: "Rút yêu cầu", DUYET: "Duyệt",
  TU_CHOI: "Từ chối", AN: "Ẩn" };
export default function TinDangDetail({ tin, accountId, admin = false }) {
  const history = useQuery({ queryKey: [admin ? "admin-tin-dang" : "tin-dang", accountId, "history", tin.id],
    queryFn: ({ signal }) => getLichSuTinDang(tin.id, signal, admin) });
  return <div>
    <h2 className="mb-2 text-xl font-semibold">{tin.tieuDe}</h2>
    <p className="mb-2">{listingStatuses[tin.trangThai]} · Phiên bản {tin.phienBan} · {tin.tenNhaTro} · {tin.soPhong}</p>
    <p>{formatMoney(tin.giaThue)} · {formatDecimal(tin.dienTich)} m² · {tin.diaChi}</p>
    <p>Liên hệ: {tin.soDienThoaiLienHe}</p>
    <p className="my-3 whitespace-pre-wrap break-words">{tin.moTa}</p>
    {tin.lyDo && <p className="mb-3 rounded bg-orange-50 p-3">Lý do: {tin.lyDo}</p>}
    <p className="mb-3 text-sm">{tin.dangHienThi ? "Tin đang được công khai." :
      "Tin chưa hiển thị công khai. Cần được duyệt và phòng đang trống."} Trạng thái phòng: {tin.trangThaiPhong}.</p>
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      {tin.anhUrls.map((url, index) => <img key={url} src={url} alt={"Ảnh phòng " + (index + 1)}
        referrerPolicy="no-referrer" loading="lazy" className="h-40 w-full rounded object-cover" />)}
    </div>
    <h3 className="mb-2 font-semibold">Lịch sử gửi và duyệt (tối đa 200 lần gần nhất)</h3>
    {history.isError ? <p className="text-red-600">{getErrorMessage(history.error, "Không tải được lịch sử")}
      <button onClick={() => history.refetch()}>Thử lại</button></p> : history.isPending ? <p>Đang tải lịch sử...</p> :
      <ul className="space-y-2">{history.data.map((row) => <li key={row.id} className="rounded border p-2">
        {actions[row.hanhDong]} · {row.nguoiThucHien} · {(row.thoiDiem ?? "").replace("T", " ")} (VN) · bản {row.phienBan}
        {row.lyDo && <p className="whitespace-pre-wrap">{row.lyDo}</p>}
      </li>)}{history.data.length === 0 && <li>Chưa có lịch sử.</li>}</ul>}
  </div>;
}
