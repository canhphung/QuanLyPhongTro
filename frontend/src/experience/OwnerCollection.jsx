import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FileText,
  ArrowDownToLine,
  KeyRound,
} from "lucide-react";
import { useAppData } from "./context";
import { PageTitle, EmptyState, Status, Modal } from "./ui";
import { InvoiceModal, ContractModal } from "./BusinessDetails";
import { schemas, optionsFor } from "./collections";
import { money, displayDate, TODAY_INPUT } from "./data";

function RecordForm({ schema, record, onClose }) {
  const data = useAppData();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    if (record?.version != null) body.version = record.version;
    setBusy(true);
    setError("");
    try {
      await data.saveRecord(schema.key, record?.id, body);
      data.notify("Đã lưu dữ liệu lên máy chủ.");
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function initial(field) {
    const value = record?.[field.key];
    if (field.key === "published") return "false";
    if (!record && field.key === "roomState") return "TRONG";
    if (Array.isArray(value))
      return value.join(field.key === "images" ? "\n" : ", ");
    if (field.type === "datetime-local")
      return String(value || `${TODAY_INPUT}T00:00`)
        .slice(0, 16)
        .replace(" ", "T");
    if (field.type === "date")
      return String(value || (field.optional ? "" : TODAY_INPUT)).slice(0, 10);
    return value == null ? "" : String(value);
  }
  return (
    <Modal
      title={`${record ? "Chỉnh sửa" : "Thêm"} ${schema.singular}`}
      wide
      onClose={() => !busy && onClose()}
    >
      <form onSubmit={submit} className="form-stack">
        <div className="record-form-grid">
          {schema.fields
            .filter((f) => !record || !f.createOnly)
            .map((f) => {
              const options = f.type === "select" ? optionsFor(f, data) : null;
              return (
                <label
                  className={`field ${f.type === "textarea" ? "field-wide" : ""}`}
                  key={f.key}
                >
                  <span>
                    {f.label}
                    {f.optional ? " (không bắt buộc)" : ""}
                  </span>
                  {options ? (
                    <select
                      name={f.key}
                      defaultValue={initial(f)}
                      required={!f.optional}
                      disabled={
                        f.key === "roomState" &&
                        (!record || record.roomState === "DANG_THUE")
                      }
                    >
                      <option value="">
                        Chọn {f.label.toLocaleLowerCase("vi")}
                      </option>
                      {options.map(([id, label]) => (
                        <option
                          key={id}
                          value={id}
                          disabled={f.key === "roomState" && id === "DANG_THUE"}
                        >
                          {label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      name={f.key}
                      defaultValue={initial(f)}
                      rows={4}
                      required={!f.optional}
                      maxLength={f.key === "description" ? 10000 : 8000}
                    />
                  ) : (
                    <input
                      name={f.key}
                      type={f.type}
                      required={!f.optional}
                      defaultValue={initial(f)}
                      min={f.min}
                      step={
                        f.type === "number"
                          ? f.key === "area"
                            ? "0.01"
                            : "1"
                          : undefined
                      }
                      maxLength={f.key === "cccd" ? 20 : undefined}
                    />
                  )}
                </label>
              );
            })}
        </div>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="modal-footer">
          <button
            type="button"
            className="button button-soft"
            disabled={busy}
            onClick={onClose}
          >
            Hủy
          </button>
          <button className="button" disabled={busy}>
            {busy ? "Đang lưu…" : "Lưu dữ liệu"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function cell(key, row) {
  if (["price", "amount", "remaining"].includes(key)) return money(row[key]);
  if (key === "linked") return row[key] ? "Đã liên kết" : "Chưa liên kết";
  if (key === "publishedStatus")
    return (
      <Status>
        {row.publishedStatus ||
          (row.published && row.available ? "Đang hiển thị" : "Nháp / Đã ẩn")}
      </Status>
    );
  if (["status", "roomStatus"].includes(key))
    return <Status>{row[key]}</Status>;
  if (["date", "end"].includes(key)) return displayDate(row[key]);
  return row[key] ?? "—";
}
export default function OwnerCollectionPage({ section }) {
  const data = useAppData(),
    schema = schemas[section];
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get("q") || "");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState(params.get("new") === "1" ? {} : null);
  const [detailId, setDetailId] = useState(null);
  const [removal, setRemoval] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [invitation, setInvitation] = useState(null);
  const [ending, setEnding] = useState(null);
  const rows = data[schema.key] || [];
  const detail = rows.find((x) => x.id === detailId);
  const statusOf = (row) =>
    schema.key === "listings"
      ? row.publishedStatus
      : row.roomStatus || row.status;
  const statuses = [...new Set(rows.map(statusOf).filter(Boolean))];
  const filtered = rows.filter(
    (row) =>
      (!keyword ||
        Object.values(row)
          .filter((x) => typeof x !== "object")
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(keyword.toLocaleLowerCase("vi"))) &&
      (!status || statusOf(row) === status),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 8)),
    current = Math.min(page, pages),
    visible = filtered.slice((current - 1) * 8, current * 8);
  function closeEditor() {
    setEditor(null);
    if (params.has("new")) {
      const next = new URLSearchParams(params);
      next.delete("new");
      setParams(next, { replace: true });
    }
  }
  async function run(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function exportCSV() {
    const escape = (v) =>
      `"${String(v ?? "")
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""')}"`;
    const table = [
      schema.columns.map((x) => x[1]),
      ...filtered.map((row) =>
        schema.columns.map(([key]) =>
          key === "publishedStatus" ? statusOf(row) : row[key],
        ),
      ),
    ];
    const url = URL.createObjectURL(
      new Blob(
        ["\uFEFF" + table.map((row) => row.map(escape).join(",")).join("\r\n")],
        { type: "text/csv;charset=utf-8;" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `phong-minh-${section}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div>
      <PageTitle
        title={schema.title}
        subtitle={schema.subtitle}
        action={
          <button className="button" onClick={() => setEditor({})}>
            <Plus size={17} />
            Thêm {schema.singular}
          </button>
        }
      />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="admin-collection admin-panel">
        <div className="collection-toolbar">
          <label className="collection-search">
            <Search size={18} />
            <input
              aria-label={`Tìm ${schema.singular}`}
              placeholder={`Tìm ${schema.singular}…`}
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <div>
            <select
              aria-label="Lọc trạng thái"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button className="button button-soft" onClick={exportCSV}>
              <ArrowDownToLine size={16} />
              Xuất CSV
            </button>
          </div>
        </div>
        {visible.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  {schema.columns.map(([key, label]) => (
                    <th key={key}>{label}</th>
                  ))}
                  <th className="align-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id}>
                    {schema.columns.map(([key]) => (
                      <td key={key}>{cell(key, row)}</td>
                    ))}
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          onClick={() => setDetailId(row.id)}
                          aria-label={`Chi tiết ${row.name || row.title || row.id}`}
                        >
                          <FileText size={16} />
                        </button>
                        {schema.key === "listings" && (
                          <>
                            {row.canSubmit && (
                              <button
                                className="text-button"
                                disabled={busy}
                                onClick={() =>
                                  run(() =>
                                    data.mutate(
                                      `/owner/listings/${row.id}/submit`,
                                      "POST",
                                      { version: row.version },
                                    ),
                                  )
                                }
                              >
                                Gửi duyệt
                              </button>
                            )}
                            {row.listingState === "CHO_DUYET" && (
                              <button
                                className="text-button"
                                disabled={busy}
                                onClick={() =>
                                  run(() =>
                                    data.mutate(
                                      `/owner/listings/${row.id}/withdraw`,
                                      "POST",
                                      { version: row.version },
                                    ),
                                  )
                                }
                              >
                                Rút duyệt
                              </button>
                            )}
                            {row.listingState === "DA_DUYET" && (
                              <button
                                className="text-button"
                                disabled={busy}
                                onClick={() =>
                                  run(() =>
                                    data.mutate(
                                      `/owner/listings/${row.id}/hide`,
                                      "POST",
                                      { version: row.version },
                                    ),
                                  )
                                }
                              >
                                Ẩn tin
                              </button>
                            )}
                          </>
                        )}
                        <button
                          className="icon-button"
                          disabled={schema.key === "listings" && !row.canEdit}
                          onClick={() => setEditor(row)}
                          aria-label={`Chỉnh sửa ${row.name || row.title || row.id}`}
                        >
                          <Pencil size={16} />
                        </button>
                        {schema.key === "tenants" && !row.linked && (
                          <button
                            className="icon-button"
                            disabled={busy}
                            aria-label={`Cấp mã liên kết ${row.name}`}
                            onClick={() =>
                              run(async () => {
                                setInvitation(
                                  await data.call(
                                    `/owner/tenants/${row.id}/invitation`,
                                    "POST",
                                    {},
                                  ),
                                );
                              })
                            }
                          >
                            <KeyRound size={16} />
                          </button>
                        )}
                        {schema.key === "contracts" ? (
                          <>
                            <button
                              className="text-button"
                              onClick={() =>
                                setEnding({ id: row.id, action: "end" })
                              }
                            >
                              Kết thúc
                            </button>
                            <button
                              className="text-button danger-text"
                              onClick={() =>
                                setEnding({ id: row.id, action: "cancel" })
                              }
                            >
                              Hủy HĐ
                            </button>
                          </>
                        ) : (
                          <button
                            className="icon-button danger-text"
                            onClick={() => setRemoval(row)}
                            aria-label={`Xóa ${row.name || row.title || row.id}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Chưa có dữ liệu phù hợp"
            message="Thêm bản ghi mới hoặc thử đổi bộ lọc."
          />
        )}
        <div className="pagination">
          <span>
            {filtered.length} bản ghi · Trang {current}/{pages}
          </span>
          <div>
            <button
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
              aria-label="Trang trước"
            >
              ‹
            </button>
            <button
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
              aria-label="Trang sau"
            >
              ›
            </button>
          </div>
        </div>
      </div>
      {editor && (
        <RecordForm
          schema={schema}
          record={editor.id ? editor : null}
          onClose={closeEditor}
        />
      )}
      {detail && schema.key === "invoices" && (
        <InvoiceModal
          invoice={detail}
          editable
          onClose={() => setDetailId(null)}
        />
      )}
      {detail && schema.key === "contracts" && (
        <ContractModal
          contract={detail}
          editable
          onClose={() => setDetailId(null)}
        />
      )}
      {detail && !["invoices", "contracts"].includes(schema.key) && (
        <Modal
          title={`Chi tiết ${schema.singular}`}
          onClose={() => setDetailId(null)}
        >
          <dl className="detail-dl">
            {schema.columns.map(([key, label]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>{cell(key, detail)}</dd>
              </div>
            ))}
          </dl>
        </Modal>
      )}
      {removal && (
        <Modal
          title={`Xóa ${schema.singular}?`}
          onClose={() => !busy && setRemoval(null)}
        >
          <p>
            Bản ghi “{removal.name || removal.title || removal.id}” sẽ được xóa
            khỏi máy chủ. Các bản ghi có ràng buộc nghiệp vụ sẽ được giữ lại.
          </p>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="modal-footer">
            <button
              className="button button-soft"
              disabled={busy}
              onClick={() => setRemoval(null)}
            >
              Giữ lại
            </button>
            <button
              className="button button-danger"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await data.deleteRecord(
                    schema.key,
                    removal.id,
                    removal.version,
                  );
                  setRemoval(null);
                  data.notify("Đã xóa bản ghi.");
                })
              }
            >
              Xóa bản ghi
            </button>
          </div>
        </Modal>
      )}
      {ending && (
        <Modal
          title={ending.action === "end" ? "Kết thúc hợp đồng" : "Hủy hợp đồng"}
          onClose={() => !busy && setEnding(null)}
        >
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const body = Object.fromEntries(new FormData(e.currentTarget));
              run(async () => {
                await data.mutate(
                  `/owner/contracts/${ending.id}/${ending.action}`,
                  "POST",
                  body,
                );
                setEnding(null);
              });
            }}
          >
            {ending.action === "end" ? (
              <>
                <label className="field">
                  <span>Ngày trả phòng thực tế</span>
                  <input
                    type="date"
                    name="actualEnd"
                    required
                    max={TODAY_INPUT}
                    defaultValue={TODAY_INPUT}
                  />
                </label>
                <label className="field">
                  <span>Lý do kết thúc</span>
                  <textarea name="reason" required maxLength={500} />
                </label>
              </>
            ) : (
              <p>
                Hợp đồng chỉ được hủy khi thỏa các điều kiện nghiệp vụ. Lịch sử
                vẫn được lưu.
              </p>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button" disabled={busy}>
              Xác nhận
            </button>
          </form>
        </Modal>
      )}
      {invitation && (
        <Modal
          title="Mã liên kết người thuê"
          onClose={() => setInvitation(null)}
        >
          <p>
            Chuyển riêng mã này cho đúng người thuê. Mã dùng một lần, hết hạn
            sau 24 giờ.
          </p>
          <code className="invitation-code">{invitation.code}</code>
          <button
            className="button button-soft"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(invitation.code);
                data.notify("Đã sao chép mã.");
              } catch {
                data.notify("Hãy chọn và sao chép mã bên trên.");
              }
            }}
          >
            Sao chép mã
          </button>
        </Modal>
      )}
    </div>
  );
}
