import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, login, logout, register } from "../../api/authApi";
import { getNhaTroPage, saveNhaTro, deleteNhaTro } from "../../api/nhaTroApi";
import Pagination from "../../components/auth/Pagination";
import getErrorMessage from "../../utils/getErrorMessage";

function TaiKhoanPage() {
  const client = useQueryClient();
  const [mode, setMode] = useState("login");
  const [notice, setNotice] = useState("");
  const [accountForm, setAccountForm] = useState({
    email: "", password: "", hoTen: "", vaiTro: "NGUOI_THUE",
  });
  const [houseForm, setHouseForm] = useState({ tenNhaTro: "", diaChi: "" });
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(0);

  const meQuery = useQuery({
    queryKey: ["auth", "me"], queryFn: getMe, retry: false,
  });
  const me = meQuery.data;
  const isOwner = me?.vaiTros.includes("CHU_TRO") ?? false;

  const houses = useQuery({
    queryKey: ["nha-tro", me?.id, page],
    queryFn: () => getNhaTroPage(page),
    enabled: isOwner,
    retry: false,
  });

  useEffect(() => {
    if (houses.data && !houses.isFetching && !houses.isError) {
      const last = Math.max(0, houses.data.totalPages - 1);
      if (page > last) setPage(last);
    }
  }, [houses.data, houses.isFetching, houses.isError, page]);

  const showError = (error) =>
    setNotice(getErrorMessage(error, "Không thể thực hiện; kiểm tra kết nối hoặc phiên đăng nhập"));

  const authMutation = useMutation({
    mutationFn: (data) => mode === "login" ? login(data) : register(data),
    onSuccess: async (data) => {
      setAccountForm((prev) => ({ ...prev, password: "" }));
      if (mode === "register") {
        setMode("login");
        setNotice("Đăng ký thành công. Hãy đăng nhập.");
      } else {
        await client.cancelQueries();
        client.clear();
        client.setQueryData(["auth", "me"], data);
        setPage(0);
        setNotice("");
      }
    },
    onError: showError,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await client.cancelQueries();
      client.clear();
      client.setQueryData(["auth", "me"], null);
      setHouseForm({ tenNhaTro: "", diaChi: "" });
      setEditingId(null);
      setPage(0);
      setNotice("Đã đăng xuất.");
    },
    onError: showError,
  });

  const refreshHouses = () =>
    client.invalidateQueries({ queryKey: ["nha-tro", me?.id] });

  const saveMutation = useMutation({
    mutationFn: saveNhaTro,
    onSuccess: async () => {
      setHouseForm({ tenNhaTro: "", diaChi: "" });
      setEditingId(null);
      setNotice("Đã lưu nhà trọ.");
      await refreshHouses();
    },
    onError: showError,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNhaTro,
    onSuccess: async (_, deletedId) => {
      if (editingId === deletedId) {
        setEditingId(null);
        setHouseForm({ tenNhaTro: "", diaChi: "" });
      }
      setNotice("Đã xóa nhà trọ.");
      await refreshHouses();
    },
    onError: showError,
  });

  const busy = authMutation.isPending || logoutMutation.isPending
    || saveMutation.isPending || deleteMutation.isPending;
  const control = "rounded border bg-white px-3 py-2 disabled:opacity-50";
  const button = "rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50";

  if (meQuery.isPending) return <p className="p-6">Đang kiểm tra đăng nhập...</p>;
  if (meQuery.isError) return (
    <div className="p-6">
      <p className="text-red-600">Không thể kết nối để kiểm tra phiên đăng nhập.</p>
      <button className={button} onClick={() => meQuery.refetch()}>Thử lại</button>
    </div>
  );

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Tài khoản và nhà trọ</h1>
      {notice && <p role="status" className="mb-4 whitespace-pre-line">{notice}</p>}

      {!me ? (
        <form className="grid max-w-lg gap-3 rounded bg-white p-5 shadow"
          onSubmit={(event) => {
            event.preventDefault();
            if (!busy) authMutation.mutate(accountForm);
          }}>
          <h2 className="text-xl font-semibold">
            {mode === "login" ? "Đăng nhập" : "Đăng ký"}
          </h2>
          <label>Email
            <input className={control + " w-full"} type="email" required
              maxLength={254} autoComplete="username" value={accountForm.email}
              onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })} />
          </label>
          <label>Mật khẩu
            <input className={control + " w-full"} type="password" required
              minLength={mode === "register" ? 8 : undefined} maxLength={72}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              value={accountForm.password}
              onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })} />
          </label>
          {mode === "register" && <>
            <label>Họ tên
              <input className={control + " w-full"} required maxLength={255}
                value={accountForm.hoTen}
                onChange={(e) => setAccountForm({ ...accountForm, hoTen: e.target.value })} />
            </label>
            <label>Loại tài khoản
              <select className={control + " w-full"} value={accountForm.vaiTro}
                onChange={(e) => setAccountForm({ ...accountForm, vaiTro: e.target.value })}>
                <option value="NGUOI_THUE">Người tìm/thuê phòng</option>
                <option value="CHU_TRO">Chủ trọ</option>
              </select>
            </label>
          </>}
          <button className={button} disabled={busy}>
            {busy ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Đăng ký"}
          </button>
          <button type="button" className="text-blue-600" disabled={busy}
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setNotice(""); }}>
            {mode === "login" ? "Tạo tài khoản" : "Đã có tài khoản"}
          </button>
        </form>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p>{me.hoTen} · {me.email}</p>
            <button className={button} disabled={busy}
              onClick={() => logoutMutation.mutate()}>Đăng xuất</button>
          </div>
          {isOwner && <nav aria-label="Quản lý" className="mb-5 flex flex-wrap gap-4 text-blue-600">
            <Link to="/phong">Phòng</Link>
            <Link to="/nguoi-thue">Người thuê</Link>
            <Link to="/dich-vu">Dịch vụ</Link>
            <Link to="/hop-dong">Hợp đồng</Link>
          </nav>}
          {!isOwner ? <p>Tài khoản người thuê đã đăng nhập. Cổng yêu cầu và hóa đơn sẽ nối ở bước tiếp theo.</p> : <>
            <form className="mb-5 grid gap-3 rounded bg-white p-5 shadow"
              onSubmit={(event) => {
                event.preventDefault();
                if (!busy) saveMutation.mutate({ id: editingId, data: houseForm });
              }}>
              <h2 className="font-semibold">{editingId == null ? "Thêm nhà trọ" : "Sửa nhà trọ"}</h2>
              <label>Tên nhà trọ
                <input className={control + " w-full"} required maxLength={255}
                  value={houseForm.tenNhaTro}
                  onChange={(e) => setHouseForm({ ...houseForm, tenNhaTro: e.target.value })} />
              </label>
              <label>Địa chỉ
                <input className={control + " w-full"} required maxLength={500}
                  value={houseForm.diaChi}
                  onChange={(e) => setHouseForm({ ...houseForm, diaChi: e.target.value })} />
              </label>
              <div className="flex gap-2">
                <button className={button} disabled={busy}>Lưu</button>
                {editingId != null && <button type="button" className={control} disabled={busy}
                  onClick={() => { setEditingId(null); setHouseForm({ tenNhaTro: "", diaChi: "" }); }}>
                  Hủy sửa
                </button>}
              </div>
            </form>
            {houses.isError ? <div>
              <p className="text-red-600">{getErrorMessage(houses.error, "Không tải được nhà trọ")}</p>
              <button className={button} onClick={() => houses.refetch()}>Thử lại</button>
            </div> : houses.isPending ? <p>Đang tải nhà trọ...</p> : <>
              <div className="overflow-x-auto rounded bg-white shadow">
                <table className="w-full text-left">
                  <thead><tr><th className="p-3">Nhà trọ</th><th>Địa chỉ</th><th>Thao tác</th></tr></thead>
                  <tbody>{houses.data.content.map((house) => (
                    <tr key={house.id} className="border-t">
                      <td className="p-3">{house.tenNhaTro}</td><td>{house.diaChi}</td>
                      <td className="space-x-3">
                        <button disabled={busy || houses.isFetching} className="text-blue-600"
                          onClick={() => { setEditingId(house.id); setHouseForm({
                            tenNhaTro: house.tenNhaTro, diaChi: house.diaChi }); }}>Sửa</button>
                        <button disabled={busy || houses.isFetching} className="text-red-600"
                          onClick={() => { if (window.confirm("Xóa nhà trọ này?")) deleteMutation.mutate(house.id); }}>Xóa</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
                {houses.data.content.length === 0 && <p className="p-3">Chưa có nhà trọ.</p>}
              </div>
              <Pagination page={page} totalPages={houses.data.totalPages}
                onPageChange={setPage} disabled={busy || houses.isFetching} />
            </>}
          </>}
        </>
      )}
    </main>
  );
}
export default TaiKhoanPage;
