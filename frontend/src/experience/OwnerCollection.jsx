import { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FileText,
  ArrowDownToLine,
  KeyRound,
  Upload,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Building2,
  Maximize2,
  DoorOpen,
  AlertTriangle,
} from "lucide-react";
import { useAppData } from "./context";
import { PageTitle, EmptyState, Status, Modal } from "./ui";
import { InvoiceModal, ContractModal } from "./BusinessDetails";
import { schemas, optionsFor } from "./collections";
import { money, displayDate, TODAY_INPUT } from "./data";

function ImageUploadField({ field, initialValue }) {
  const data = useAppData();
  const [images, setImages] = useState(() => {
    if (!initialValue) return [];
    if (Array.isArray(initialValue)) return initialValue;
    return String(initialValue)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [showManual, setShowManual] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (images.length + files.length > 10) {
      setUploadError("Tối đa 10 ảnh cho mỗi tin đăng. Vui lòng chỉ chọn tối đa " + (10 - images.length) + " ảnh nữa.");
      e.target.value = "";
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const uploadedUrls = await data.uploadFiles(files);
      setImages((prev) => [...prev, ...uploadedUrls].slice(0, 10));
    } catch (err) {
      setUploadError(err.message || "Tải ảnh thất bại.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleRemove(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddManual(e) {
    e.preventDefault();
    const url = manualUrl.trim();
    if (!url) return;
    if (images.length >= 10) {
      setUploadError("Đã đạt tối đa 10 ảnh.");
      return;
    }
    if (images.includes(url)) {
      setUploadError("Ảnh này đã có trong danh sách.");
      return;
    }
    setImages((prev) => [...prev, url]);
    setManualUrl("");
    setUploadError("");
  }

  return (
    <div className="field field-wide image-upload-section">
      <div className="image-upload-header">
        <div className="image-upload-label">
          <span>{field.label}</span>
          <span className="image-count-badge">({images.length}/10 ảnh)</span>
        </div>
        <button
          type="button"
          className="text-button text-sm"
          onClick={() => setShowManual((v) => !v)}
        >
          {showManual ? "Ẩn nhập link ảnh" : "+ Nhập link ảnh HTTPS"}
        </button>
      </div>

      <input type="hidden" name={field.key} value={images.join("\n")} />

      <div className="upload-actions-bar">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={uploading || images.length >= 10}
        />
        <button
          type="button"
          className="upload-btn"
          disabled={uploading || images.length >= 10}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={18} />
          {uploading
            ? "Đang tải ảnh từ máy lên…"
            : images.length >= 10
              ? "Đã đạt tối đa 10 ảnh"
              : "Tải ảnh từ thư viện máy lên"}
        </button>
        <span className="upload-hint">
          Hỗ trợ chọn nhiều ảnh cùng lúc (PNG, JPG, WEBP). Có xem trước (preview) và lưu vào database.
        </span>
      </div>

      {showManual && (
        <div className="manual-url-box">
          <input
            type="url"
            placeholder="Dán đường dẫn ảnh HTTPS vào đây…"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            disabled={images.length >= 10}
          />
          <button
            type="button"
            className="button button-soft"
            onClick={handleAddManual}
            disabled={!manualUrl.trim() || images.length >= 10}
          >
            Thêm ảnh
          </button>
        </div>
      )}

      {uploadError && <p className="form-error mt-1" role="alert">{uploadError}</p>}

      {/* Preview thumbnails gallery */}
      {images.length > 0 ? (
        <div className="image-preview-grid">
          {images.map((url, idx) => (
            <div key={idx} className="image-preview-card">
              <img src={url} alt={"Ảnh " + (idx + 1)} />
              {idx === 0 && <span className="cover-badge">★ Ảnh chính</span>}
              <button
                type="button"
                className="remove-img-btn"
                title="Xóa ảnh này"
                onClick={() => handleRemove(idx)}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="image-preview-empty">
          <ImageIcon size={32} strokeWidth={1.5} />
          <span>Chưa có ảnh nào. Bấm nút <strong>"Tải ảnh từ thư viện máy lên"</strong> ở trên để thêm ảnh và xem trước preview.</span>
        </div>
      )}
    </div>
  );
}

const addMonths = (iso, months) => {
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  const date = new Date(y, m - 1 + months, d);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

function RecordForm({ schema, record, onClose }) {
  const data = useAppData();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Form hợp đồng mới: yêu cầu giữ chỗ đang chọn và lựa chọn người đứng tên.
  const isNewContract = schema.key === "contracts" && !record;
  const [hold, setHold] = useState(null);
  const [tenantChoice, setTenantChoice] = useState("");
  function onFormChange(event) {
    if (!isNewContract) return;
    const form = event.currentTarget;
    const el = event.target;
    const fillPrice = (roomId, force) => {
      const room = (data.rooms || []).find((r) => String(r.id) === String(roomId));
      if (!room) return;
      if (force || !form.elements.price.value) form.elements.price.value = room.price;
      if (force || !form.elements.deposit.value) form.elements.deposit.value = room.price;
    };
    if (el.name === "requestId") {
      const req = (data.requests || []).find((x) => String(x.id) === el.value) || null;
      setHold(req);
      if (req) {
        form.elements.roomId.value = String(req.roomRecordId);
        fillPrice(req.roomRecordId, true);
        const tid = req.tenantProfileId ? String(req.tenantProfileId) : "new";
        form.elements.tenantId.value = tid;
        setTenantChoice(tid);
      }
    } else if (el.name === "roomId") {
      fillPrice(el.value, false);
    } else if (el.name === "tenantId") {
      setTenantChoice(el.value);
    } else if (el.name === "start" && el.value) {
      if (!form.elements.end.value || form.elements.end.value <= el.value)
        form.elements.end.value = addMonths(el.value, 12);
    }
  }
  async function submit(event) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    if (record?.version != null) body.version = record.version;
    // Ô phòng bị khóa khi lập từ giữ chỗ nên không nằm trong FormData.
    if (isNewContract && hold) body.roomId = String(hold.roomRecordId);
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
    if (!record && schema.key === "contracts" && field.key === "end")
      return addMonths(TODAY_INPUT, 12);
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
      <form onSubmit={submit} onChange={onFormChange} className="form-stack">
        <div className="record-form-grid">
          {schema.fields
            .filter((f) => !record || !f.createOnly)
            .map((f) => {
              if (f.key === "images") {
                return (
                  <ImageUploadField
                    key={f.key}
                    field={f}
                    initialValue={initial(f)}
                  />
                );
              }
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
                  {f.hint && <small className="field-hint">{f.hint}</small>}
                  {options ? (
                    <select
                      name={f.key}
                      defaultValue={initial(f)}
                      required={!f.optional}
                      disabled={
                        (f.key === "roomState" &&
                          (!record ||
                            ["DANG_THUE", "DA_DAT"].includes(record.roomState))) ||
                        (isNewContract && f.key === "roomId" && !!hold)
                      }
                    >
                      <option value="">
                        Chọn {f.label.toLocaleLowerCase("vi")}
                      </option>
                      {isNewContract && f.key === "tenantId" && (
                        <option value="new">+ Tạo hồ sơ người thuê mới</option>
                      )}
                      {options.map(([id, label]) => (
                        <option
                          key={id}
                          value={id}
                          disabled={
                            f.key === "roomState" &&
                            ["DANG_THUE", "DA_DAT"].includes(id)
                          }
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
        {isNewContract && hold && (
          <p className="field-hint">
            Giữ chỗ #{hold.id}: {hold.name} · {hold.phone} · đã nhận cọc giữ chỗ{" "}
            {money(hold.holdDeposit)} (trừ vào tiền cọc hợp đồng khi thu).
            {tenantChoice &&
              tenantChoice !== "new" &&
              hold.tenantProfileId &&
              tenantChoice !== String(hold.tenantProfileId) &&
              " Lưu ý: người đứng tên khác với người đã giữ chỗ."}
          </p>
        )}
        {isNewContract && tenantChoice === "new" && (
          <fieldset className="record-form-grid" key={hold?.id ?? "manual"}>
            <legend>Hồ sơ người đứng tên mới</legend>
            <label className="field">
              <span>Họ và tên</span>
              <input
                name="newTenantName"
                required
                maxLength={255}
                defaultValue={hold?.name || ""}
              />
            </label>
            <label className="field">
              <span>CCCD</span>
              <input name="newTenantCccd" required maxLength={20} />
            </label>
            <label className="field">
              <span>Điện thoại (không bắt buộc)</span>
              <input
                name="newTenantPhone"
                type="tel"
                maxLength={20}
                defaultValue={hold?.phone || ""}
              />
            </label>
            {hold && (
              <p className="field-hint">
                Hồ sơ sẽ được liên kết với tài khoản của {hold.name} để họ xem
                hợp đồng và hóa đơn, không cần mã mời.
              </p>
            )}
          </fieldset>
        )}
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
  if (key === "linked") {
    return row[key] ? (
      <span className="status-pill status-pill-success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
        ✓ Đã liên kết
      </span>
    ) : (
      <span className="status-pill status-pill-warning" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
        Chưa liên kết
      </span>
    );
  }
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

function RoomGridCard({ room, onDetail, onEdit, onDelete }) {
  const isVacant =
    room.roomState === "TRONG" || room.roomStatus === "Còn trống";
  const isRented =
    room.roomState === "DANG_THUE" || room.roomStatus === "Đang thuê";
  const statusClass = isVacant
    ? "status-pill-emerald"
    : isRented
      ? "status-pill-indigo"
      : "status-pill-amber";
  const statusLabel =
    room.roomStatus ||
    (isVacant ? "Còn trống" : isRented ? "Đang thuê" : "Bảo trì");

  return (
    <div className="room-grid-card">
      <div>
        <div className="room-grid-header">
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <span className="room-grid-number">P.{room.number}</span>
              {room.type && <span className="room-type-tag">{room.type}</span>}
            </div>
            <div
              className="room-grid-building"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                marginTop: "4px",
              }}
            >
              <Building2 size={14} style={{ color: "var(--muted)" }} />
              <span>{room.building || "Chưa chọn nhà trọ"}</span>
            </div>
          </div>
          <span className={`status-pill ${statusClass}`}>
            <span className="status-dot" />
            {statusLabel}
          </span>
        </div>

        <div className="room-grid-specs">
          <span>
            <Maximize2 size={14} />
            {room.area} m²
          </span>
          <span>
            <DoorOpen size={14} />
            Mã #{room.id}
          </span>
        </div>
      </div>

      <div className="room-grid-footer">
        <div className="room-grid-price">
          {money(room.price)}
          <small> / tháng</small>
        </div>
        <div className="row-actions">
          <button
            className="icon-button"
            title="Xem chi tiết"
            aria-label={`Chi tiết ${room.number}`}
            onClick={() => onDetail(room.id)}
          >
            <FileText size={16} />
          </button>
          <button
            className="icon-button"
            title="Chỉnh sửa thông tin"
            aria-label={`Chỉnh sửa ${room.number}`}
            onClick={() => onEdit(room)}
          >
            <Pencil size={16} />
          </button>
          <button
            className="icon-button danger-text"
            title="Xóa phòng"
            aria-label={`Xóa ${room.number}`}
            onClick={() => onDelete(room)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function BuildingGridCard({ building, onDetail, onEdit, onDelete }) {
  const isActive = building.status === "Đang hoạt động";
  const statusClass = isActive ? "status-pill-emerald" : "status-pill-amber";

  return (
    <div className="building-grid-card">
      <div>
        <div className="room-grid-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "rgba(79, 70, 229, 0.1)",
                color: "var(--accent-text, #4F46E5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  margin: 0,
                  color: "var(--ink)",
                }}
              >
                {building.name}
              </h3>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                Quản lý: {building.manager || "Chưa gán"}
              </span>
            </div>
          </div>
          <span className={`status-pill ${statusClass}`}>
            <span className="status-dot" />
            {building.status || "Đang hoạt động"}
          </span>
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "var(--muted)",
            margin: "14px 0",
            lineHeight: 1.5,
          }}
        >
          <p style={{ margin: 0 }}>{building.address}</p>
          <p
            style={{
              margin: "2px 0 0",
              fontWeight: 500,
              color: "var(--ink)",
            }}
          >
            {building.district ? `${building.district}, ` : ""}
            {building.city}
          </p>
        </div>
      </div>

      <div
        className="room-grid-footer"
        style={{ borderTop: "1px solid var(--line)", paddingTop: "12px" }}
      >
        <span style={{ fontSize: "12px", color: "var(--muted)" }}>
          ID #{building.id}
        </span>
        <div className="row-actions">
          <button
            className="icon-button"
            title="Xem chi tiết"
            aria-label={`Chi tiết ${building.name}`}
            onClick={() => onDetail(building.id)}
          >
            <FileText size={16} />
          </button>
          <button
            className="icon-button"
            title="Chỉnh sửa thông tin"
            aria-label={`Chỉnh sửa ${building.name}`}
            onClick={() => onEdit(building)}
          >
            <Pencil size={16} />
          </button>
          <button
            className="icon-button danger-text"
            title="Xóa nhà trọ"
            aria-label={`Xóa ${building.name}`}
            onClick={() => onDelete(building)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
export default function OwnerCollectionPage({ section }) {
  const data = useAppData(),
    schema = schemas[section];
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get("q") || "");
  const [status, setStatus] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");
  const [viewMode, setViewMode] = useState(
    ["phong", "nha-tro"].includes(section) ? "grid" : "table",
  );
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

  const filtered = rows.filter((row) => {
    const matchesKeyword =
      !keyword ||
      Object.values(row)
        .filter((x) => typeof x !== "object")
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(keyword.toLocaleLowerCase("vi"));
    const matchesStatus = !status || statusOf(row) === status;
    const matchesBuilding =
      !buildingFilter ||
      String(row.buildingId) === String(buildingFilter) ||
      row.building === buildingFilter ||
      (row.name && row.name.includes(buildingFilter));
    return matchesKeyword && matchesStatus && matchesBuilding;
  });

  const pageSize = viewMode === "grid" ? 9 : 8;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize)),
    current = Math.min(page, pages),
    visible = filtered.slice((current - 1) * pageSize, current * pageSize);

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {["phong", "hop-dong", "hoa-don"].includes(section) &&
              data.buildings &&
              data.buildings.length > 0 && (
                <select
                  aria-label="Lọc theo nhà trọ"
                  value={buildingFilter}
                  onChange={(e) => {
                    setBuildingFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Tất cả nhà trọ</option>
                  {data.buildings.map((b) => (
                    <option key={b.id} value={b.name || b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}

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

            {["phong", "nha-tro"].includes(section) && (
              <div
                className="view-mode-toggle"
                role="group"
                aria-label="Chế độ hiển thị"
              >
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Hiển thị dạng lưới thẻ"
                  aria-label="Dạng lưới thẻ"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === "table" ? "active" : ""}`}
                  onClick={() => setViewMode("table")}
                  title="Hiển thị dạng bảng chi tiết"
                  aria-label="Dạng bảng chi tiết"
                >
                  <List size={16} />
                </button>
              </div>
            )}

            <button className="button button-soft" onClick={exportCSV}>
              <ArrowDownToLine size={16} />
              Xuất CSV
            </button>
          </div>
        </div>

        {visible.length ? (
          viewMode === "grid" && section === "phong" ? (
            <div className="room-grid-list">
              {visible.map((room) => (
                <RoomGridCard
                  key={room.id}
                  room={room}
                  onDetail={(id) => setDetailId(id)}
                  onEdit={(r) => setEditor(r)}
                  onDelete={(r) => setRemoval(r)}
                />
              ))}
            </div>
          ) : viewMode === "grid" && section === "nha-tro" ? (
            <div className="building-grid-list">
              {visible.map((bldg) => (
                <BuildingGridCard
                  key={bldg.id}
                  building={bldg}
                  onDetail={(id) => setDetailId(id)}
                  onEdit={(b) => setEditor(b)}
                  onDelete={(b) => setRemoval(b)}
                />
              ))}
            </div>
          ) : (
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
                            title="Xem chi tiết"
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
                            title="Chỉnh sửa"
                          >
                            <Pencil size={16} />
                          </button>
                          {schema.key === "tenants" && (
                            <button
                              className="icon-button"
                              disabled={busy || row.linked}
                              aria-label={`Cấp mã liên kết ${row.name}`}
                              title={row.linked ? "Hồ sơ này đã được liên kết với tài khoản người thuê" : "Cấp mã liên kết OTP 24h"}
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
                              style={
                                row.linked
                                  ? { opacity: 0.35, cursor: "not-allowed" }
                                  : { color: "#2563EB", background: "rgba(37, 99, 235, 0.08)", borderColor: "rgba(37, 99, 235, 0.2)" }
                              }
                            >
                              <KeyRound size={16} />
                            </button>
                          )}
                          {schema.key === "contracts" ? (
                            <>
                              {["DANG_HIEU_LUC", "HET_HAN"].includes(
                                row.state,
                              ) && (
                                <button
                                  className="text-button"
                                  onClick={() =>
                                    setEnding({ id: row.id, action: "end", row })
                                  }
                                >
                                  Kết thúc
                                </button>
                              )}
                              {row.state === "DANG_HIEU_LUC" && (
                                <button
                                  className="text-button danger-text"
                                  onClick={() =>
                                    setEnding({ id: row.id, action: "cancel", row })
                                  }
                                >
                                  Hủy HĐ
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              className="icon-button danger-text"
                              onClick={() => setRemoval(row)}
                              aria-label={`Xóa ${row.name || row.title || row.id}`}
                              title="Xóa bản ghi"
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
          )
        ) : (
          <EmptyState
            title={schema.key === "tenants" ? "Chưa có hồ sơ người thuê nào" : "Chưa có dữ liệu phù hợp"}
            message={
              schema.key === "tenants"
                ? "Bấm nút '+ Thêm người thuê' ở phía trên để tạo hồ sơ mới, sau đó bấm icon chìa khóa để cấp mã liên kết OTP 24h cho khách."
                : "Thêm bản ghi mới hoặc thử đổi bộ lọc tìm kiếm."
            }
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
          title={`Xác nhận xóa ${schema.singular}?`}
          onClose={() => !busy && setRemoval(null)}
        >
          <div className="confirm-delete-body">
            <div className="confirm-delete-icon-box">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="confirm-delete-text">
                Bạn có chắc chắn muốn xóa bản ghi{" "}
                <strong>
                  “
                  {removal.name ||
                    removal.title ||
                    removal.number ||
                    `#${removal.id}`}
                  ”
                </strong>
                ?
              </p>
              <p className="confirm-delete-subtext">
                Thao tác này sẽ xóa bản ghi khỏi hệ thống. Nếu bản ghi đang có dữ
                liệu ràng buộc nghiệp vụ (hợp đồng còn hiệu lực, hóa đơn chưa
                thanh toán), hệ thống sẽ bảo vệ toàn vẹn và từ chối xóa.
              </p>
            </div>
          </div>
          {error && (
            <div className="form-error-banner" role="alert">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
          <div className="modal-footer">
            <button
              type="button"
              className="button button-soft"
              disabled={busy}
              onClick={() => setRemoval(null)}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
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
                  data.notify("Đã xóa bản ghi thành công.");
                })
              }
            >
              {busy ? "Đang xóa…" : "Xác nhận xóa"}
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
                {(() => {
                  const deposit = Number(ending.row?.deposit || 0);
                  const debt = (data.invoices || [])
                    .filter((x) => x.contractId === ending.id)
                    .reduce((sum, x) => sum + Math.max(0, Number(x.remaining)), 0);
                  const maxRefund = Math.max(0, deposit - debt);
                  return (
                    <>
                      <p>
                        Tiền cọc {money(deposit)} · Hóa đơn còn nợ {money(debt)} ·
                        Hoàn trả tối đa <strong>{money(maxRefund)}</strong>
                      </p>
                      <label className="field">
                        <span>Tiền cọc hoàn trả (₫)</span>
                        <input
                          type="number"
                          name="depositRefund"
                          required
                          min={0}
                          max={maxRefund}
                          step={1}
                          defaultValue={maxRefund}
                        />
                      </label>
                      <label className="field">
                        <span>Ghi chú quyết toán (không bắt buộc)</span>
                        <textarea
                          name="settlementNote"
                          maxLength={500}
                          placeholder="VD: trừ cọc bù tiền điện tháng cuối, hư hỏng..."
                        />
                      </label>
                    </>
                  );
                })()}
              </>
            ) : (
              <>
                <p>
                  Chỉ hủy hợp đồng chưa phát sinh hóa đơn (ví dụ khách không vào
                  ở). Hợp đồng đã ở/đã tính tiền phải dùng Kết thúc để quyết
                  toán cọc. Lịch sử vẫn được lưu.
                </p>
                <label className="field">
                  <span>Lý do hủy</span>
                  <textarea name="reason" required maxLength={500} />
                </label>
              </>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="modal-footer">
              <button
                type="button"
                className="button button-soft"
                disabled={busy}
                onClick={() => setEnding(null)}
              >
                Hủy bỏ
              </button>
              <button className="button" disabled={busy}>
                {busy ? "Đang xử lý…" : "Xác nhận"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {invitation && (
        <Modal
          title="Mã liên kết người thuê"
          onClose={() => setInvitation(null)}
        >
          <div style={{ textAlign: "center", padding: "12px 0 20px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#EEF2FF",
                color: "var(--accent-text, #4F46E5)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <KeyRound size={24} />
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "var(--muted)",
                margin: "0 0 16px",
              }}
            >
              Gửi riêng mã này cho người thuê để liên kết tài khoản vào phòng
              trọ. Mã có hiệu lực trong vòng <strong>24 giờ</strong>.
            </p>
            <div
              style={{
                background: "var(--surface-soft, #F8FAFC)",
                border: "2px dashed #4F46E5",
                borderRadius: "14px",
                padding: "16px 24px",
                margin: "0 auto 16px",
                maxWidth: "320px",
              }}
            >
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  letterSpacing: "4px",
                  color: "var(--accent-text, #4F46E5)",
                  fontFamily: "monospace",
                }}
              >
                {invitation.code}
              </span>
            </div>
            <button
              type="button"
              className="button"
              style={{ margin: "0 auto" }}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(invitation.code);
                  data.notify("Đã sao chép mã liên kết!");
                } catch {
                  data.notify("Hãy chọn và sao chép mã bên trên.");
                }
              }}
            >
              Sao chép mã liên kết
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
