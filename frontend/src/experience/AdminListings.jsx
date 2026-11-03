import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Brand, PageTitle, EmptyState, Modal, RoomPhoto, Status } from "./ui";
import { useAppData } from "./context";
import { money } from "./data";
const states = {
  CHO_DUYET: "Chờ duyệt",
  DA_DUYET: "Đã duyệt",
  NHAP: "Bản nháp",
  TU_CHOI: "Từ chối",
  DA_AN: "Đã ẩn",
};
export default function AdminListings() {
  const { call, refresh, logout, notify } = useAppData();
  const [filter, setFilter] = useState("CHO_DUYET");
  const [page, setPage] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("");
  const requestId = useRef(0);
  const load = useCallback(async () => {
    const ticket = ++requestId.current;
    setLoading(true);
    try {
      const data = await call(
        `/api/admin/tin-dang?page=${page}&size=20${filter ? `&trangThai=${filter}` : ""}`,
      );
      if (ticket === requestId.current) {
        setResult(data);
        setError("");
      }
    } catch (e) {
      if (ticket === requestId.current) setError(e.message);
    } finally {
      if (ticket === requestId.current) setLoading(false);
    }
  }, [call, filter, page]);
  useEffect(() => {
    const requests = requestId;
    let active = true;
    Promise.resolve().then(() => {
      if (active) load();
    });
    return () => {
      active = false;
      requests.current++;
    };
  }, [load]);
  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await call(`/api/admin/tin-dang/${selected.id}/${action}`, "PATCH", {
        phienBan: selected.phienBan,
        lyDo: form.get("reason") || null,
      });
      setSelected(null);
      setAction("");
      await refresh();
      await load();
      notify("Đã cập nhật kết quả duyệt tin.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-review-page page-container" data-ui>
      <header className="admin-review-header">
        <Brand />
        <div>
          <Link to="/" className="text-button">
            Trang tìm phòng
          </Link>
          <button
            className="button button-soft"
            onClick={async () => {
              try {
                await logout();
              } catch (e) {
                notify(e.message);
              }
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>
      <PageTitle
        title="Duyệt tin đăng"
        subtitle="Chỉ tin đã được duyệt, thuộc phòng trống và chủ trọ còn hoạt động mới xuất hiện công khai."
      />
      <label className="field admin-review-filter">
        <span>Trạng thái</span>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(0);
          }}
        >
          <option value="">Tất cả</option>
          {Object.entries(states).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Đang tải tin đăng…</p>
      ) : !result?.content.length ? (
        <EmptyState
          title="Chưa có tin ở trạng thái này"
          message="Tin do chủ trọ gửi duyệt sẽ xuất hiện tại đây."
        />
      ) : (
        <div className="admin-panel table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tin đăng</th>
                <th>Nhà trọ / phòng</th>
                <th>Giá thuê</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {result.content.map((row) => (
                <tr key={row.id}>
                  <td>
                    {row.tieuDe}
                    <small>#{row.id}</small>
                  </td>
                  <td>
                    {row.tenNhaTro}
                    <small>{row.soPhong}</small>
                  </td>
                  <td>{money(row.giaThue)}</td>
                  <td>
                    <Status>{states[row.trangThai]}</Status>
                  </td>
                  <td>
                    <button
                      className="text-button"
                      onClick={() => {
                        setSelected(row);
                        setAction("");
                        setError("");
                      }}
                    >
                      Xem tin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {result && (
        <div className="pagination">
          <span>
            {result.totalElements} tin · Trang {result.page + 1}/
            {Math.max(1, result.totalPages)}
          </span>
          <div>
            <button
              disabled={result.first || loading}
              onClick={() => setPage(page - 1)}
              aria-label="Trang trước"
            >
              ‹
            </button>
            <button
              disabled={result.last || loading}
              onClick={() => setPage(page + 1)}
              aria-label="Trang sau"
            >
              ›
            </button>
          </div>
        </div>
      )}
      {selected && (
        <Modal
          title={selected.tieuDe}
          wide
          onClose={() => !busy && setSelected(null)}
        >
          <RoomPhoto
            photo={selected.anhUrls[0]}
            alt={selected.tieuDe}
            className="form-photo-preview"
          />
          <p>{selected.moTa}</p>
          <dl className="detail-dl">
            <div>
              <dt>Địa chỉ</dt>
              <dd>{selected.diaChi}</dd>
            </div>
            <div>
              <dt>Liên hệ</dt>
              <dd>{selected.soDienThoaiLienHe}</dd>
            </div>
            <div>
              <dt>Giá đăng</dt>
              <dd>{money(selected.giaThue)}</dd>
            </div>
            <div>
              <dt>Diện tích</dt>
              <dd>{selected.dienTich} m²</dd>
            </div>
          </dl>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {selected.trangThai === "CHO_DUYET" && (
            <div className="form-actions">
              <button
                className="button"
                disabled={busy}
                onClick={() => setAction("duyet")}
              >
                Duyệt tin
              </button>
              <button
                className="button button-soft"
                disabled={busy}
                onClick={() => setAction("tu-choi")}
              >
                Từ chối
              </button>
            </div>
          )}
          {selected.trangThai === "DA_DUYET" && (
            <button
              className="button button-soft"
              onClick={() => setAction("an")}
            >
              Ẩn tin
            </button>
          )}
          {action && (
            <form className="form-stack inline-editor" onSubmit={submit}>
              {action === "duyet" ? (
                <p>Xác nhận công khai nội dung đã kiểm tra?</p>
              ) : (
                <label className="field">
                  <span>Lý do {action === "an" ? "ẩn tin" : "từ chối"}</span>
                  <textarea name="reason" required maxLength={1000} />
                </label>
              )}
              <button className="button" disabled={busy}>
                {busy ? "Đang lưu…" : "Xác nhận"}
              </button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
