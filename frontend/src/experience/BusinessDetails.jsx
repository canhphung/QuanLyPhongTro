import { useState } from "react";
import { Printer, FileText, Users, Pencil, Trash2, Plus } from "lucide-react";
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
  return (
    <Modal
      title={`Hóa đơn #${invoice.id}`}
      wide
      onClose={() => !busy && onClose()}
    >
      <div className="printable-invoice">
        <div className="invoice-top">
          <div>
            <p className="document-label">Phòng mình · Hóa đơn</p>
            <h3>Chi phí tháng {invoice.month}</h3>
            <p>
              Phòng {invoice.room} · {invoice.name}
            </p>
          </div>
          <Status>{invoice.status}</Status>
        </div>
        <div className="invoice-meta">
          <p>
            <span>Mã hóa đơn</span>
            <strong>#{invoice.id}</strong>
          </p>
          <p>
            <span>Hạn thanh toán</span>
            <strong>{displayDate(invoice.due)}</strong>
          </p>
        </div>
        <div className="table-scroll">
          <table className="data-table invoice-table">
            <thead>
              <tr>
                <th>Khoản thu</th>
                <th>Số lượng / đơn giá</th>
                <th className="align-right">Thành tiền</th>
                {canEdit && <th className="no-print">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tiền thuê phòng</td>
                <td>Kỳ {invoice.month}</td>
                <td className="align-right">{money(invoice.rent)}</td>
                {canEdit && <td />}
              </tr>
              {invoice.lines.map((line) => (
                <tr key={line.id}>
                  <td>
                    {line.name}
                    {line.oldIndex != null && (
                      <small>
                        Chỉ số {line.oldIndex} → {line.newIndex}
                      </small>
                    )}
                  </td>
                  <td>
                    {line.quantity} {line.unit} × {money(line.price)}
                  </td>
                  <td className="align-right">{money(line.amount)}</td>
                  {canEdit && (
                    <td className="no-print">
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          aria-label={`Sửa ${line.name}`}
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
        <div className="invoice-total">
          <span>Tổng cộng</span>
          <strong>{money(invoice.amount)}</strong>
        </div>
        <dl className="detail-dl">
          <div>
            <dt>Đã nhận</dt>
            <dd>{money(invoice.paid)}</dd>
          </div>
          <div>
            <dt>Còn phải thanh toán</dt>
            <dd>{money(invoice.remaining)}</dd>
          </div>
        </dl>
      </div>
      {canEdit && (
        <div className="no-print">
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
          {editor && (
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
                  Lưu dòng dịch vụ
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="modal-footer no-print">
        <button
          className="button button-soft"
          disabled={busy}
          onClick={onClose}
        >
          Đóng
        </button>
        <button className="button" onClick={() => window.print()}>
          <Printer size={17} />
          In / lưu PDF
        </button>
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
        <dl className="detail-dl">
          <div>
            <dt>Đại diện</dt>
            <dd>{contract.name}</dd>
          </div>
          <div>
            <dt>Thời hạn thuê</dt>
            <dd>
              {displayDate(contract.start)} – {displayDate(contract.end)}
            </dd>
          </div>
          <div>
            <dt>Giá thuê mỗi tháng</dt>
            <dd>{money(contract.price)}</dd>
          </div>
          <div>
            <dt>Tiền đặt cọc</dt>
            <dd>{money(contract.deposit)}</dd>
          </div>
          {contract.actualEnd && (
            <div>
              <dt>Ngày kết thúc thực tế</dt>
              <dd>
                {displayDate(contract.actualEnd)} · {contract.endReason}
              </dd>
            </div>
          )}
        </dl>
        <h3 className="members-title">
          <Users size={18} />
          Thành viên hợp đồng
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
                    onClick={() => setEditor(member)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="icon-button danger-text"
                    aria-label={`Xóa ${member.name}`}
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
          <p>Chưa có thành viên được ghi nhận.</p>
        )}
        {editable && (
          <>
            <button
              className="button button-soft"
              onClick={() => setEditor({})}
            >
              <Plus size={16} />
              Thêm thành viên
            </button>
            {editor && (
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
                    Lưu thành viên
                  </button>
                </div>
              </form>
            )}
          </>
        )}
        <p className="fine-print">
          Đây là thông tin quản lý thuê phòng được ghi nhận trên hệ thống. Điều
          khoản chi tiết theo hợp đồng ký giữa hai bên.
        </p>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="modal-footer">
        <button className="button" disabled={busy} onClick={onClose}>
          Đã xem
        </button>
      </div>
    </Modal>
  );
}
