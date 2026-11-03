import { useState } from "react";
import {
  Printer,
  FileText,
  Users,
  Pencil,
  Trash2,
  Plus,
  AlertCircle,
  CreditCard,
  QrCode,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Modal, Status } from "./ui";
import { useAppData } from "./context";
import { money, displayDate, TODAY_INPUT } from "./data";

export function InvoiceModal({ invoice, editable = false, onClose }) {
  const data = useAppData();
  const [editor, setEditor] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const service = data.services.find((s) => s.id === Number(serviceId));

  async function run(fn) {
    setError("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const canEdit = editable && Number(invoice.paid) === 0;
  const isPaid = Number(invoice.remaining) === 0;
  const isPartiallyPaid = Number(invoice.paid) > 0 && Number(invoice.remaining) > 0;
  const [payingVNPay, setPayingVNPay] = useState(false);
  const [showVietQR, setShowVietQR] = useState(false);

  async function handleVNPayCheckout() {
    setPayingVNPay(true);
    setError("");
    try {
      const res = await fetch("/api/payment/vnpay/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: invoice.remaining,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Tạo liên kết thanh toán VNPAY thất bại");
      if (resData.paymentUrl) {
        window.location.href = resData.paymentUrl;
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setPayingVNPay(false);
    }
  }

  return (
    <Modal
      title={`Hóa đơn #${invoice.id}`}
      wide
      onClose={() => !busy && onClose()}
    >
      <div className="printable-invoice">
        {/* Top Branding & Invoice Title */}
        <div className="invoice-brand-row">
          <div className="invoice-brand-info">
            <p className="document-label">Phòng Mình · Quản lý phòng trọ</p>
            <h2>Hóa Đơn Tiền Nhà & Dịch Vụ</h2>
            <p>
              Kỳ thanh toán: <strong>Tháng {invoice.month}</strong> · Phòng{" "}
              <strong>{invoice.room}</strong>
            </p>
          </div>
          <div className="invoice-badge-column">
            <span
              className={`status-pill ${
                isPaid
                  ? "status-pill-emerald"
                  : isPartiallyPaid
                    ? "status-pill-amber"
                    : "status-pill-rose"
              }`}
            >
              <span className="status-dot" />
              {invoice.status || (isPaid ? "Đã thanh toán" : "Chưa thanh toán")}
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--muted)",
              }}
            >
              Mã: #HD-{invoice.id}
            </span>
          </div>
        </div>

        {/* Customer & Lease Info Grid */}
        <div className="invoice-customer-card">
          <div className="customer-info-item">
            <span>Khách thuê</span>
            <strong>{invoice.name}</strong>
          </div>
          <div className="customer-info-item">
            <span>Căn phòng</span>
            <strong>Phòng {invoice.room}</strong>
          </div>
          <div className="customer-info-item">
            <span>Ngày lập</span>
            <strong>{displayDate(invoice.issued || TODAY_INPUT)}</strong>
          </div>
          <div className="customer-info-item">
            <span>Hạn thanh toán</span>
            <strong style={{ color: isPaid ? "inherit" : "#DC2626" }}>
              {displayDate(invoice.due)}
            </strong>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="table-scroll">
          <table className="data-table invoice-table">
            <thead>
              <tr>
                <th>Hạng mục chi phí</th>
                <th>Số lượng / Chi tiết tiêu thụ</th>
                <th className="align-right">Thành tiền</th>
                {canEdit && <th className="no-print">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Tiền thuê phòng</strong>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                    Kỳ tháng {invoice.month}
                  </div>
                </td>
                <td>1 tháng</td>
                <td className="align-right font-bold">{money(invoice.rent)}</td>
                {canEdit && <td />}
              </tr>
              {invoice.lines.map((line) => (
                <tr key={line.id}>
                  <td>
                    <strong>{line.name}</strong>
                    {line.oldIndex != null && (
                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                        Chỉ số: {line.oldIndex} → {line.newIndex} (tiêu thụ{" "}
                        {Math.max(
                          0,
                          Number(line.newIndex || 0) -
                            Number(line.oldIndex || 0),
                        ).toFixed(1)}{" "}
                        {line.unit})
                      </div>
                    )}
                  </td>
                  <td>
                    {line.quantity} {line.unit} × {money(line.price)}
                  </td>
                  <td className="align-right font-bold">{money(line.amount)}</td>
                  {canEdit && (
                    <td className="no-print">
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          aria-label={`Sửa ${line.name}`}
                          title="Sửa dòng này"
                          onClick={() => {
                            setEditor(line);
                            setServiceId(String(line.serviceId));
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-button danger-text"
                          disabled={busy}
                          aria-label={`Xóa ${line.name}`}
                          title="Xóa dòng này"
                          onClick={() =>
                            run(() =>
                              data.mutate(
                                `/owner/invoices/${invoice.id}/lines/${line.id}`,
                                "DELETE",
                              ),
                            )
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Totals */}
        <div className="invoice-summary-grid">
          <div className="invoice-summary-row">
            <span>Tiền thuê phòng:</span>
            <strong>{money(invoice.rent)}</strong>
          </div>
          <div className="invoice-summary-row">
            <span>Phí dịch vụ & điện nước:</span>
            <strong>
              {money(
                Math.max(
                  0,
                  Number(invoice.amount || 0) - Number(invoice.rent || 0),
                ),
              )}
            </strong>
          </div>
          <div className="invoice-summary-row total-row">
            <span>Tổng cộng hóa đơn:</span>
            <strong>{money(invoice.amount)}</strong>
          </div>
          <div className="invoice-summary-row paid-row">
            <span>Đã thanh toán:</span>
            <strong>{money(invoice.paid)}</strong>
          </div>
          <div className="invoice-summary-row remaining-row">
            <span>Còn phải thu:</span>
            <strong>{money(invoice.remaining)}</strong>
          </div>
        </div>

        {/* Bank transfer guidance note */}
        <div className="invoice-bank-note">
          <strong>Lưu ý thanh toán:</strong> Quý khách vui lòng chuyển khoản
          theo cú pháp:{" "}
          <code
            style={{
              fontWeight: 700,
              padding: "2px 6px",
              background: "#DBEAFE",
              borderRadius: "4px",
            }}
          >
            HD{invoice.id} P{invoice.room}
          </code>{" "}
          hoặc nộp tiền mặt trực tiếp cho ban quản lý tòa nhà trước ngày{" "}
          {displayDate(invoice.due)}.
        </div>

        {/* Cổng thanh toán VNPAY & VietQR Tự động */}
        {!isPaid && (
          <div
            className="no-print"
            style={{
              marginTop: "20px",
              padding: "20px",
              background: "#F0FDF4",
              borderRadius: "14px",
              border: "1px solid #BBF7D0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: showVietQR ? "16px" : 0,
              }}
            >
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#166534",
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  <ShieldCheck size={18} color="#16a34a" /> Cổng thanh toán tự động (Gạch nợ tức thì)
                </span>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#15803D" }}>
                  Hỗ trợ VNPAY-QR, Thẻ ATM 40+ ngân hàng nội địa, Visa/Mastercard và VietQR chuyển khoản nhanh.
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="button"
                  style={{
                    background: "linear-gradient(135deg, #005BAA 0%, #0088CC 100%)",
                    color: "#FFFFFF",
                    border: "none",
                    fontWeight: 700,
                  }}
                  disabled={payingVNPay}
                  onClick={handleVNPayCheckout}
                >
                  <CreditCard size={16} />
                  {payingVNPay
                    ? "Đang kết nối VNPAY…"
                    : `Thanh toán ${money(invoice.remaining)} qua VNPAY`}
                </button>

                <button
                  type="button"
                  className="button button-soft"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #86EFAC",
                    color: "#166534",
                  }}
                  onClick={() => setShowVietQR(!showVietQR)}
                >
                  <QrCode size={16} />
                  {showVietQR ? "Ẩn mã VietQR" : "Xem mã VietQR"}
                  {showVietQR ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>
              </div>
            </div>

            {showVietQR && (
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid #DCFCE7",
                  display: "flex",
                  gap: "20px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <img
                    src={`https://img.vietqr.io/image/970419-88888888-compact2.png?amount=${invoice.remaining}&addInfo=HD${invoice.id}%20P${invoice.room}&accountName=QUAN%20LY%20PHONG%20TRO`}
                    alt="Mã VietQR thanh toán tiền phòng"
                    style={{
                      width: "180px",
                      height: "180px",
                      objectFit: "contain",
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                    }}
                  />
                  <span
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "var(--muted)",
                      marginTop: "4px",
                    }}
                  >
                    Quét bằng app ngân hàng bất kỳ
                  </span>
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: "220px",
                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ marginBottom: "6px" }}>
                    <span style={{ color: "var(--muted)" }}>
                      Ngân hàng thụ hưởng:
                    </span>{" "}
                    <strong>NCB (Ngân hàng Quốc Dân)</strong>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    <span style={{ color: "var(--muted)" }}>Số tài khoản:</span>{" "}
                    <strong
                      style={{
                        fontFamily: "monospace",
                        fontSize: "14px",
                        color: "#005BAA",
                      }}
                    >
                      9704198526191432198
                    </strong>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    <span style={{ color: "var(--muted)" }}>Chủ tài khoản:</span>{" "}
                    <strong>NGUYEN VAN A</strong>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    <span style={{ color: "var(--muted)" }}>Số tiền nộp:</span>{" "}
                    <strong style={{ color: "#DC2626", fontSize: "15px" }}>
                      {money(invoice.remaining)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)" }}>
                      Nội dung chuyển khoản chuẩn:
                    </span>{" "}
                    <code
                      style={{
                        background: "#EEF2FF",
                        color: "#4F46E5",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: 700,
                      }}
                    >
                      HD{invoice.id} P{invoice.room}
                    </code>
                  </div>
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "8px 12px",
                      background: "#F8FAFC",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#64748B",
                    }}
                  >
                    💡{" "}
                    <em>
                      Thẻ test thử nghiệm VNPAY Sandbox: Số thẻ{" "}
                      <strong>9704198526191432198</strong> · Tên{" "}
                      <strong>NGUYEN VAN A</strong> · Ngày phát hành{" "}
                      <strong>07/15</strong> · Mật khẩu OTP{" "}
                      <strong>123456</strong>
                    </em>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {canEdit && (
        <div className="no-print" style={{ marginBottom: "20px" }}>
          {!editor ? (
            <button
              className="button button-soft"
              onClick={() => {
                setEditor({});
                setServiceId("");
              }}
            >
              <Plus size={16} />
              Thêm dòng dịch vụ
            </button>
          ) : (
            <form
              key={editor.id || "new"}
              className="form-stack inline-editor"
              onSubmit={(e) => {
                e.preventDefault();
                const body = Object.fromEntries(new FormData(e.currentTarget));
                run(async () => {
                  await data.mutate(
                    `/owner/invoices/${invoice.id}/lines${editor.id ? `/${editor.id}` : ""}`,
                    editor.id ? "PUT" : "POST",
                    body,
                  );
                  setEditor(null);
                });
              }}
            >
              <label className="field">
                <span>Dịch vụ</span>
                <select
                  name="serviceId"
                  value={serviceId}
                  required
                  onChange={(e) => setServiceId(e.target.value)}
                >
                  <option value="">Chọn dịch vụ</option>
                  {data.services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {s.unit}
                    </option>
                  ))}
                </select>
              </label>
              {service?.mode === "Theo chỉ số" ? (
                <div className="form-row">
                  <label className="field">
                    <span>Chỉ số cũ</span>
                    <input
                      name="oldIndex"
                      type="number"
                      min="0"
                      step="0.001"
                      required
                      defaultValue={editor.oldIndex}
                    />
                  </label>
                  <label className="field">
                    <span>Chỉ số mới</span>
                    <input
                      name="newIndex"
                      type="number"
                      min="0"
                      step="0.001"
                      required
                      defaultValue={editor.newIndex}
                    />
                  </label>
                </div>
              ) : (
                <label className="field">
                  <span>Số lượng</span>
                  <input
                    name="quantity"
                    type="number"
                    min="0.001"
                    step="0.001"
                    required
                    defaultValue={editor.quantity}
                  />
                </label>
              )}
              <label className="field">
                <span>Đơn giá (để trống để lấy giá hiện tại)</span>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={editor.price}
                />
              </label>
              <div className="form-actions">
                <button
                  className="button button-soft"
                  type="button"
                  onClick={() => setEditor(null)}
                >
                  Hủy
                </button>
                <button className="button" disabled={busy}>
                  {busy ? "Đang lưu…" : "Lưu dòng dịch vụ"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {error && (
        <div className="form-error-banner" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="modal-footer no-print">
        <button
          className="button button-soft"
          disabled={busy}
          onClick={onClose}
        >
          Đóng
        </button>
        <button
          type="button"
          className="button button-soft"
          onClick={() => window.print()}
          title="In hóa đơn hoặc xuất file PDF"
        >
          <Printer size={17} />
          In hóa đơn / Xuất PDF
        </button>
        {!isPaid && (
          <button
            type="button"
            className="button"
            style={{
              background: "linear-gradient(135deg, #005BAA 0%, #0088CC 100%)",
              color: "#FFFFFF",
              border: "none",
            }}
            disabled={payingVNPay}
            onClick={handleVNPayCheckout}
            title="Thanh toán ngay bằng VNPAY hoặc mã QR"
          >
            <CreditCard size={17} />
            {payingVNPay ? "Đang xử lý…" : "Thanh toán qua VNPAY"}
          </button>
        )}
      </div>
    </Modal>
  );
}

export function ContractModal({ contract, editable = false, onClose }) {
  const data = useAppData();
  const [editor, setEditor] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <Modal
      title={`Hợp đồng #${contract.id}`}
      wide
      onClose={() => !busy && onClose()}
    >
      <div className="contract-detail">
        <div className="contract-heading">
          <span className="document-icon">
            <FileText size={30} strokeWidth={1.3} />
          </span>
          <div>
            <h3>Hợp đồng thuê phòng {contract.room}</h3>
            <p>{contract.building}</p>
          </div>
          <Status>{contract.status}</Status>
        </div>

        <div className="invoice-customer-card" style={{ marginTop: "16px" }}>
          <div className="customer-info-item">
            <span>Người đại diện</span>
            <strong>{contract.name}</strong>
          </div>
          <div className="customer-info-item">
            <span>Thời hạn hợp đồng</span>
            <strong>
              {displayDate(contract.start)} – {displayDate(contract.end)}
            </strong>
          </div>
          <div className="customer-info-item">
            <span>Giá thuê mỗi tháng</span>
            <strong style={{ color: "#4F46E5" }}>{money(contract.price)}</strong>
          </div>
          <div className="customer-info-item">
            <span>Tiền đặt cọc</span>
            <strong>{money(contract.deposit)}</strong>
          </div>
          {contract.actualEnd && (
            <div
              className="customer-info-item"
              style={{ gridColumn: "1 / -1" }}
            >
              <span>Ngày trả phòng thực tế</span>
              <strong>
                {displayDate(contract.actualEnd)} · Lý do: {contract.endReason}
              </strong>
            </div>
          )}
          {contract.depositRefund != null && (
            <div
              className="customer-info-item"
              style={{ gridColumn: "1 / -1" }}
            >
              <span>Quyết toán cọc</span>
              <strong>
                Hoàn trả {money(contract.depositRefund)}
                {contract.settlementNote ? ` · ${contract.settlementNote}` : ""}
              </strong>
            </div>
          )}
          {!contract.actualEnd && contract.endReason && (
            <div
              className="customer-info-item"
              style={{ gridColumn: "1 / -1" }}
            >
              <span>Lý do hủy</span>
              <strong>{contract.endReason}</strong>
            </div>
          )}
        </div>

        <h3 className="members-title" style={{ marginTop: "24px" }}>
          <Users size={18} />
          Thành viên cùng ở ({contract.memberRecords.length})
        </h3>

        <div className="member-list">
          {contract.memberRecords.map((member) => (
            <div key={member.id}>
              <span className="avatar">
                {member.name.split(" ").at(-1)?.slice(0, 2)}
              </span>
              <div>
                <strong>{member.name}</strong>
                <span>
                  {member.representative ? "Người đại diện" : "Thành viên"} ·{" "}
                  {displayDate(member.joined)}
                  {member.departed ? ` → ${displayDate(member.departed)}` : ""}
                </span>
              </div>
              <Status>{member.departed ? "Đã rời phòng" : "Đang ở"}</Status>
              {editable && (
                <div className="row-actions">
                  <button
                    className="icon-button"
                    aria-label={`Sửa ${member.name}`}
                    title="Chỉnh sửa thông tin"
                    onClick={() => setEditor(member)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="icon-button danger-text"
                    aria-label={`Xóa ${member.name}`}
                    title="Xóa thành viên"
                    disabled={busy}
                    onClick={() =>
                      run(() =>
                        data.mutate(
                          `/owner/contracts/${contract.id}/members/${member.id}`,
                          "DELETE",
                        ),
                      )
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {!contract.memberRecords.length && (
          <p
            style={{
              color: "var(--muted)",
              fontStyle: "italic",
              margin: "12px 0",
            }}
          >
            Chưa có thành viên nào được ghi nhận.
          </p>
        )}

        {editable && (
          <div style={{ marginTop: "16px" }}>
            {!editor ? (
              <button
                className="button button-soft"
                onClick={() => setEditor({})}
              >
                <Plus size={16} />
                Thêm thành viên
              </button>
            ) : (
              <form
                className="form-stack inline-editor"
                key={editor.id || "new"}
                onSubmit={(e) => {
                  e.preventDefault();
                  const body = Object.fromEntries(
                    new FormData(e.currentTarget),
                  );
                  run(async () => {
                    await data.mutate(
                      `/owner/contracts/${contract.id}/members${editor.id ? `/${editor.id}` : ""}`,
                      editor.id ? "PUT" : "POST",
                      body,
                    );
                    setEditor(null);
                  });
                }}
              >
                {!editor.id && (
                  <label className="field">
                    <span>Người thuê</span>
                    <select name="tenantId" required defaultValue="">
                      <option value="">Chọn người thuê</option>
                      {data.tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="form-row">
                  <label className="field">
                    <span>Ngày vào</span>
                    <input
                      name="joined"
                      type="date"
                      required
                      defaultValue={
                        editor.joined || contract.start || TODAY_INPUT
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Ngày rời phòng (nếu có)</span>
                    <input
                      name="departed"
                      type="date"
                      defaultValue={editor.departed || ""}
                    />
                  </label>
                </div>
                <label className="field">
                  <span>Vai trò</span>
                  <select
                    name="representative"
                    defaultValue={String(editor.representative || false)}
                  >
                    <option value="false">Thành viên</option>
                    <option value="true">Người đại diện</option>
                  </select>
                </label>
                <div className="form-actions">
                  <button
                    className="button button-soft"
                    type="button"
                    onClick={() => setEditor(null)}
                  >
                    Hủy
                  </button>
                  <button className="button" disabled={busy}>
                    {busy ? "Đang lưu…" : "Lưu thành viên"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <p className="fine-print" style={{ marginTop: "24px" }}>
          Đây là thông tin quản lý hợp đồng thuê phòng được ghi nhận trên hệ
          thống Phòng Mình. Điều khoản quyền lợi và nghĩa vụ chi tiết căn cứ theo
          hợp đồng văn bản đã ký giữa hai bên.
        </p>
      </div>

      {error && (
        <div className="form-error-banner" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="modal-footer">
        <button className="button" disabled={busy} onClick={onClose}>
          Đã xem xong
        </button>
      </div>
    </Modal>
  );
}
