import { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  UserRound,
  CalendarDays,
  FileText,
  Receipt,
  CreditCard,
  Heart,
  LogOut,
  Eye,
  EyeOff,
  Check,
  Clock3,
  ArrowLeft,
} from "lucide-react";
import { useAppData } from "./context";
import { RoomPhoto, PageTitle, EmptyState, Status, Modal } from "./ui";
import { InvoiceModal, ContractModal } from "./BusinessDetails";
import { money, TODAY_INPUT } from "./data";

export function AuthPage({ register = false }) {
  const { authenticate } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (register && form.get("password") !== form.get("confirm")) {
      setError("Mật khẩu nhập lại chưa trùng khớp.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const user = await authenticate(
        register ? "register" : "login",
        Object.fromEntries(form),
      );
      const next = new URLSearchParams(location.search).get("next");
      navigate(
        next?.startsWith("/") && !next.startsWith("//")
          ? next
          : user.role === "admin"
            ? "/quan-tri/tin-dang"
            : user.role === "owner"
              ? "/chu-tro/tong-quan"
              : "/tai-khoan",
        { replace: true },
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-story">
        <RoomPhoto />
        <div>
          <h1>
            {register ? (
              <>
                Chốn riêng mới.
                <br />
                Bắt đầu từ đây.
              </>
            ) : (
              <>
                Về nhà thôi.
                <br />
                Mình đợi bạn.
              </>
            )}
          </h1>
          <p>
            Lưu căn phòng mình thích. Giữ chuyện thuê nhà gọn trong một nơi.
          </p>
        </div>
      </div>
      <div className="auth-form-side">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          Về trang chủ
        </Link>
        <div className="auth-form-wrap">
          <h2>{register ? "Bắt đầu tìm chốn riêng" : "Chào bạn trở lại"}</h2>
          <p>
            {register
              ? "Tạo tài khoản để lưu phòng và hẹn lịch xem."
              : "Đăng nhập để tiếp tục chuyện thuê nhà."}
          </p>
          <form
            className="form-stack"
            onSubmit={submit}
            data-ui
            key={register ? "register" : "login"}
          >
            {register && (
              <label className="field">
                <span>Họ và tên</span>
                <input
                  name="name"
                  required
                  autoComplete="name"
                  maxLength={255}
                />
              </label>
            )}
            <label className="field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                maxLength={254}
                placeholder="ban@example.com"
              />
            </label>
            <label className="field">
              <span>Mật khẩu</span>
              <div className="password-input">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  minLength={register ? 8 : 1}
                  maxLength={72}
                  required
                  autoComplete={register ? "new-password" : "current-password"}
                  placeholder={
                    register ? "Ít nhất 8 ký tự" : "Mật khẩu của bạn"
                  }
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {register && (
              <>
                <label className="field">
                  <span>Nhập lại mật khẩu</span>
                  <input
                    name="confirm"
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    required
                    autoComplete="new-password"
                  />
                </label>
                <label className="field">
                  <span>Bạn tham gia với vai trò</span>
                  <select name="role">
                    <option value="tenant">Người tìm phòng / người thuê</option>
                    <option value="owner">Chủ trọ</option>
                  </select>
                </label>
              </>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button" type="submit" disabled={busy}>
              {busy ? "Đang xử lý…" : register ? "Tạo tài khoản" : "Đăng nhập"}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="auth-switch">
            {register ? "Đã có tài khoản?" : "Lần đầu đến Phòng mình?"}{" "}
            <Link to={register ? "/dang-nhap" : "/dang-ky"}>
              {register ? "Đăng nhập" : "Đăng ký"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export function RequireAccount({ owner = false, admin = false, children }) {
  const { user } = useAppData();
  const location = useLocation();
  if (!user)
    return (
      <Navigate
        to={`/dang-nhap?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  if (admin && !user.roles?.includes("ADMIN") && !user.roles?.includes("CHU_TRO"))
    return (
      <div className="page-container">
        <EmptyState
          title="Khu vực quản trị"
          message="Tài khoản của bạn không có quyền duyệt tin."
          action={
            <Link className="button" to="/">
              Về trang chủ
            </Link>
          }
        />
      </div>
    );
  if (owner && user.role !== "owner")
    return (
      <div className="page-container">
        <EmptyState
          title="Khu vực dành cho chủ trọ"
          message="Tài khoản của bạn là tài khoản người thuê."
          action={
            <Link to="/tai-khoan" className="button">
              Về tài khoản
            </Link>
          }
        />
      </div>
    );
  return children;
}

const accountMenu = [
  ["", "Thông tin cá nhân", UserRound],
  ["yeu-cau", "Yêu cầu của tôi", CalendarDays],
  ["hop-dong", "Hợp đồng của tôi", FileText],
  ["hoa-don", "Hóa đơn", Receipt],
  ["thanh-toan", "Lịch sử thanh toán", CreditCard],
];
export function AccountLayout() {
  const { user, logout: signOut, notify } = useAppData();
  const name = user.name;
  const location = useLocation();
  if (
    user.role === "owner" &&
    location.pathname.replace(/\/$/, "") !== "/tai-khoan"
  )
    return <Navigate to="/chu-tro/tong-quan" replace />;
  async function logout() {
    try {
      await signOut();
    } catch (e) {
      notify(e.message);
    }
  }
  return (
    <div className="account-page page-container" data-ui>
      <div className="account-greeting">
        <p>Không gian của bạn</p>
        <h1>
          Chào {name.split(" ").at(-1)},<br className="mobile-only" /> hôm nay
          mình thế nào?
        </h1>
        <p>Chuyện thuê nhà, gọn lại trong một nơi.</p>
      </div>
      <div className="account-layout">
        <aside className="account-sidebar">
          <div className="account-person">
            <span className="avatar avatar-large">
              {name
                .split(" ")
                .slice(-2)
                .map((x) => x[0])
                .join("")}
            </span>
            <strong>{name}</strong>
            <span>{user.role === "owner" ? "Chủ trọ" : "Người thuê"}</span>
          </div>
          <nav aria-label="Tài khoản người thuê">
            {(user.role === "owner"
              ? accountMenu.slice(0, 1)
              : accountMenu
            ).map(([path, label, Icon]) => (
              <NavLink
                key={path}
                to={`/tai-khoan${path ? `/${path}` : ""}`}
                end
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
            <Link to="/yeu-thich">
              <Heart size={18} />
              Phòng đã lưu
              <ArrowUpRight size={14} />
            </Link>
          </nav>
          {user ? (
            <button className="logout-button" onClick={logout}>
              <LogOut size={17} />
              Đăng xuất
            </button>
          ) : (
            <Link className="logout-button" to="/dang-nhap">
              <UserRound size={17} />
              Đăng nhập
            </Link>
          )}
        </aside>
        <div className="account-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user: profile, mutate, notify } = useAppData();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await mutate(
        "/profile",
        "PUT",
        Object.fromEntries(new FormData(event.currentTarget)),
      );
      setEditing(false);
      notify("Đã lưu thông tin cá nhân.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function link(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    try {
      await mutate(
        "/tenant-link",
        "POST",
        Object.fromEntries(new FormData(form)),
      );
      form.reset();
      notify("Đã liên kết hồ sơ người thuê.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="account-panel">
      <PageTitle
        title="Thông tin cá nhân"
        subtitle="Thông tin để chủ trọ liên hệ khi bạn gửi yêu cầu."
        action={
          !editing && (
            <button
              className="button button-soft"
              onClick={() => setEditing(true)}
            >
              Chỉnh sửa
            </button>
          )
        }
      />
      <form
        key={`${editing}-${profile.name}`}
        className="form-stack profile-form"
        onSubmit={save}
      >
        <div className="form-row">
          <label className="field">
            <span>Họ và tên</span>
            <input
              name="name"
              defaultValue={profile.name}
              required
              maxLength={255}
              readOnly={!editing}
              autoComplete="name"
            />
          </label>
          <label className="field">
            <span>Ngày sinh</span>
            <input
              name="birthday"
              type="date"
              defaultValue={profile.birthday || ""}
              readOnly={!editing}
              max={TODAY_INPUT}
            />
          </label>
        </div>
        <div className="form-row">
          <label className="field">
            <span>Email đăng nhập</span>
            <input
              type="email"
              defaultValue={profile.email}
              readOnly
              autoComplete="email"
            />
          </label>
          <label className="field">
            <span>Số điện thoại</span>
            <input
              name="phone"
              type="tel"
              defaultValue={profile.phone || ""}
              maxLength={20}
              readOnly={!editing}
              autoComplete="tel"
            />
          </label>
        </div>
        <label className="field">
          <span>Địa chỉ thường trú</span>
          <input
            name="address"
            defaultValue={profile.address || ""}
            maxLength={500}
            readOnly={!editing}
            autoComplete="street-address"
          />
        </label>
        {editing && (
          <div className="form-actions">
            <button
              type="button"
              className="button button-soft"
              onClick={() => setEditing(false)}
            >
              Hủy
            </button>
            <button type="submit" className="button" disabled={busy}>
              Lưu thay đổi
            </button>
          </div>
        )}
      </form>
      {profile.role === "tenant" && (
        <div className="tenant-link-section">
          <h2>Liên kết hồ sơ thuê phòng</h2>
          <p>
            Nhận mã liên kết từ chủ trọ để xem hợp đồng, hóa đơn và lịch sử
            thanh toán của bạn. Mã có hiệu lực 24 giờ và chỉ dùng một lần.
          </p>
          <p>Đã liên kết {profile.linkedTenantIds?.length || 0} hồ sơ.</p>
          <form className="form-stack" onSubmit={link}>
            <label className="field">
              <span>Mã liên kết</span>
              <input name="code" required autoComplete="off" maxLength={100} />
            </label>
            <button className="button button-soft" disabled={busy}>
              Liên kết hồ sơ
            </button>
          </form>
        </div>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </section>
  );
}

export function MyRequestsPage() {
  const { requests, publicRooms: rooms, respond, notify } = useAppData();
  const [cancel, setCancel] = useState(null);
  const [filter, setFilter] = useState("Tất cả");
  const result = requests.filter(
    (x) => filter === "Tất cả" || x.status === filter,
  );
  return (
    <section className="account-panel">
      <PageTitle
        title="Yêu cầu của tôi"
        subtitle="Lịch xem phòng và những căn phòng bạn muốn thuê."
      />
      <div className="content-tabs">
        {["Tất cả", "Chờ xác nhận", "Đã xác nhận", "Đã hủy"].map((value) => (
          <button
            key={value}
            className={filter === value ? "active" : ""}
            onClick={() => setFilter(value)}
          >
            {value}
          </button>
        ))}
      </div>
      {result.length ? (
        <div className="request-list">
          {result.map((request) => {
            const room = rooms.find((x) => x.id === request.roomId);
            return (
              <article className="request-card" key={request.id}>
                <RoomPhoto photo={room?.photo} alt="Phòng đã gửi yêu cầu" />
                <div>
                  <Status>{request.status}</Status>
                  <h2>{request.title}</h2>
                  <p>
                    {request.building} · {request.room}
                  </p>
                  <p>
                    <CalendarDays size={15} />
                    {new Date(`${request.date}T12:00:00`).toLocaleDateString(
                      "vi-VN",
                    )}
                    <Clock3 size={15} />
                    {request.time}
                  </p>
                  <p>
                    {request.type}
                    {request.note && ` · ${request.note}`}
                  </p>
                  <div className="request-actions">
                    <Link
                      className="plain-link"
                      to={`/phong-tro/${request.roomId}`}
                    >
                      Xem phòng
                      <ArrowUpRight size={15} />
                    </Link>
                    {!["Đã hủy", "Đã từ chối"].includes(request.status) && (
                      <button
                        className="text-button danger-text"
                        onClick={() => setCancel(request)}
                      >
                        Hủy yêu cầu
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Lịch hẹn mới đang chờ bạn"
          message={
            requests.length
              ? "Chưa có yêu cầu ở trạng thái này."
              : "Tìm một căn phòng bạn thích và gửi lịch hẹn. Mình sẽ giữ lịch cho bạn tại đây."
          }
          action={
            <Link className="button" to="/tim-phong">
              Khám phá phòng
              <ArrowUpRight size={16} />
            </Link>
          }
        />
      )}
      {cancel && (
        <Modal title="Hủy yêu cầu này?" onClose={() => setCancel(null)}>
          <p>Lịch hẹn tại {cancel.building} sẽ được chuyển sang đã hủy.</p>
          <div className="modal-footer">
            <button
              className="button button-soft"
              onClick={() => setCancel(null)}
            >
              Giữ lịch hẹn
            </button>
            <button
              className="button button-danger"
              onClick={async () => {
                try {
                  await respond(cancel.id, "Đã hủy");
                  setCancel(null);
                  notify("Đã hủy yêu cầu.");
                } catch (e) {
                  notify(e.message);
                }
              }}
            >
              Hủy yêu cầu
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

export function MyContractsPage() {
  const { contracts } = useAppData();
  const [detail, setDetail] = useState(null);
  const result = contracts;
  return (
    <section className="account-panel">
      <PageTitle
        title="Hợp đồng của tôi"
        subtitle="Thông tin phòng, thời hạn và thành viên ở cùng."
      />
      {result.length ? (
        result.map((contract) => (
          <article className="tenant-contract" key={contract.id}>
            <RoomPhoto photo={0} alt="Ảnh phòng thuê" />
            <div>
              <Status>{contract.status}</Status>
              <h2>{contract.building}</h2>
              <p>
                Phòng {contract.room} · {contract.id}
              </p>
              <dl>
                <div>
                  <dt>Thời hạn</dt>
                  <dd>
                    {contract.start} – {contract.end}
                  </dd>
                </div>
                <div>
                  <dt>Giá thuê</dt>
                  <dd>{money(contract.price)} / tháng</dd>
                </div>
                <div>
                  <dt>Tiền cọc</dt>
                  <dd>{money(contract.deposit)}</dd>
                </div>
                <div>
                  <dt>Thành viên</dt>
                  <dd>{contract.members.length} người</dd>
                </div>
              </dl>
              <button
                className="button button-soft"
                onClick={() => setDetail(contract)}
              >
                Xem hợp đồng và thành viên
                <ArrowUpRight size={17} />
              </button>
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          title="Chưa có hợp đồng"
          message="Hợp đồng thuê sẽ xuất hiện ở đây sau khi hai bên hoàn tất thỏa thuận."
        />
      )}
      {detail && (
        <ContractModal contract={detail} onClose={() => setDetail(null)} />
      )}
    </section>
  );
}

export function MyInvoicesPage() {
  const { invoices } = useAppData();
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState("Tất cả");
  const result = invoices.filter(
    (x) => filter === "Tất cả" || x.status === filter,
  );
  const unpaid = invoices
    .filter((x) => x.status !== "Đã thanh toán")
    .reduce((sum, x) => sum + Number(x.remaining), 0);
  return (
    <section className="account-panel">
      <PageTitle
        title="Hóa đơn của tôi"
        subtitle="Xem từng khoản điện, nước, dịch vụ và tiền thuê."
      />
      <div className="bill-summary">
        <div>
          <span>Số tiền chưa thanh toán</span>
          <strong>{money(unpaid)}</strong>
        </div>
        <Receipt size={34} strokeWidth={1.2} />
      </div>
      <div className="content-tabs">
        {["Tất cả", "Chưa thanh toán", "Đã thanh toán"].map((value) => (
          <button
            key={value}
            className={filter === value ? "active" : ""}
            onClick={() => setFilter(value)}
          >
            {value}
          </button>
        ))}
      </div>
      {result.length ? (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kỳ hóa đơn</th>
                <th>Phòng</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>
                  <span className="sr-only">Chi tiết</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {result.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <strong>Tháng {invoice.month}</strong>
                    <small>{invoice.id}</small>
                  </td>
                  <td>{invoice.room}</td>
                  <td>{money(invoice.amount)}</td>
                  <td>
                    <Status>{invoice.status}</Status>
                  </td>
                  <td>
                    <button
                      className="text-button"
                      onClick={() => setDetail(invoice)}
                    >
                      Xem chi tiết
                      <ArrowUpRight size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Chưa có hóa đơn ở trạng thái này"
          message="Bạn có thể xem tất cả hóa đơn ở thẻ bên cạnh."
        />
      )}
      {detail && (
        <InvoiceModal invoice={detail} onClose={() => setDetail(null)} />
      )}
    </section>
  );
}

export function MyPaymentsPage() {
  const { payments } = useAppData();
  const [detail, setDetail] = useState(null);
  const result = payments;
  return (
    <section className="account-panel">
      <PageTitle
        title="Lịch sử thanh toán"
        subtitle="Các khoản thu do chủ trọ ghi nhận và đối chiếu."
      />
      {result.length ? (
        <div className="payment-timeline">
          {result.map((payment) => (
            <button
              className="payment-entry"
              key={payment.id}
              onClick={() => setDetail(payment)}
            >
              <span className="payment-check">
                <Check size={20} />
              </span>
              <div>
                <strong>Thanh toán phòng {payment.room}</strong>
                <span>
                  {payment.date} · {payment.method}
                </span>
                <small>{payment.invoice}</small>
              </div>
              <div>
                <strong>{money(payment.amount)}</strong>
                <Status>{payment.status}</Status>
              </div>
              <ArrowUpRight size={18} />
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chưa có thanh toán"
          message="Lịch sử thanh toán sẽ được giữ tại đây để bạn đối chiếu."
        />
      )}
      {detail && (
        <Modal title="Chi tiết thanh toán" onClose={() => setDetail(null)}>
          <dl className="detail-dl">
            <div>
              <dt>Mã thanh toán</dt>
              <dd>{detail.id}</dd>
            </div>
            <div>
              <dt>Hóa đơn</dt>
              <dd>{detail.invoice}</dd>
            </div>
            <div>
              <dt>Ngày ghi nhận</dt>
              <dd>{detail.date}</dd>
            </div>
            <div>
              <dt>Phương thức</dt>
              <dd>{detail.method}</dd>
            </div>
            <div>
              <dt>Số tiền</dt>
              <dd>{money(detail.amount)}</dd>
            </div>
          </dl>
          <p className="info-note">
            Khoản thu được chủ trọ ghi nhận. Hãy đối chiếu với biên lai hoặc
            giao dịch của bạn.
          </p>
        </Modal>
      )}
    </section>
  );
}
