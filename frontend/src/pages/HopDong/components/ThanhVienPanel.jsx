import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllNguoiThue } from "../../../api/nguoiThueApi";
import { getThanhVien, saveThanhVien, deleteThanhVien } from "../../../api/thanhVienApi";
import getErrorMessage from "../../../utils/getErrorMessage";

export default function ThanhVienPanel({ contract, accountId, disabled, onBusyChange }) {
  const client = useQueryClient();
  const [dangO, setDangO] = useState(false);
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState("");
  const editable = contract.trangThai === "DANG_HIEU_LUC";
  const members = useQuery({
    queryKey: ["thanh-vien", accountId, contract.id, dangO],
    queryFn: ({ signal }) => getThanhVien(contract.id, dangO, signal),
  });
  const tenants = useQuery({
    queryKey: ["nguoi-thue", accountId, "member-options"],
    queryFn: getAllNguoiThue,
    enabled: editable,
  });
  const reset = () => { setForm(null); setEditingId(null); };
  const refresh = () => client.invalidateQueries({
    queryKey: ["thanh-vien", accountId, contract.id],
  });
  const onError = (error) => setNotice(getErrorMessage(error, "Không thể cập nhật thành viên"));
  const save = useMutation({
    mutationFn: saveThanhVien,
    onSuccess: async () => { reset(); setNotice("Đã lưu thành viên."); await refresh(); },
    onError,
  });
  const remove = useMutation({
    mutationFn: deleteThanhVien,
    onSuccess: async (_, variables) => {
      if (editingId === variables.nguoiThueId) reset();
      setNotice("Đã xóa bản ghi nhập nhầm."); await refresh();
    },
    onError,
  });
  const writing = save.isPending || remove.isPending;
  useEffect(() => { onBusyChange(writing); }, [writing, onBusyChange]);
  const busy = disabled || writing || members.isFetching;
  const control = "rounded border bg-white px-3 py-2 disabled:opacity-50";
  const edit = (member) => {
    if (busy || !editable) return;
    setEditingId(member.nguoiThueId);
    setForm({ nguoiThueId: member.nguoiThueId, ngayVao: member.ngayVao,
      ngayRoi: member.ngayRoi ?? "", laDaiDien: member.laDaiDien });
    setNotice("");
  };

  return <div>
    <h2 className="mb-2 text-xl font-semibold">
      Hợp đồng #{contract.id} · {contract.tenNhaTro} · {contract.soPhong}
    </h2>
    <p className="mb-3">{contract.ngayBatDau} → {contract.ngayKetThuc} · {contract.trangThai}</p>
    {contract.ngayKetThucThucTe &&
      <p className="mb-3">Trả phòng: {contract.ngayKetThucThucTe} · {contract.lyDoKetThuc}</p>}
    {!editable && <p className="mb-3">Hợp đồng đã đóng; chỉ xem lịch sử thành viên.</p>}
    {notice && <p role="status" className="mb-3 whitespace-pre-line">{notice}</p>}
    <div className="mb-4 flex flex-wrap items-center gap-4">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={dangO} disabled={busy}
          onChange={(e) => setDangO(e.target.checked)} />Chỉ người chưa ghi ngày rời
      </label>
      {editable && <button disabled={busy || tenants.isPending || tenants.isError}
        className={control} onClick={() => {
          setEditingId(null);
          setForm({ nguoiThueId: "", ngayVao: contract.ngayBatDau, ngayRoi: "", laDaiDien: false });
          setNotice("");
        }}>Thêm thành viên</button>}
    </div>
    {editable && tenants.isError && <p className="text-red-600">
      Không tải được người thuê. <button onClick={() => tenants.refetch()}>Thử lại</button>
    </p>}
    {form && editable && <form className="mb-4 rounded border p-4" onSubmit={(e) => {
      e.preventDefault();
      if (busy) return;
      save.mutate({ hopDongId: contract.id, editingId, data: {
        nguoiThueId: Number(form.nguoiThueId), ngayVao: form.ngayVao,
        ngayRoi: form.ngayRoi || null, laDaiDien: Boolean(form.laDaiDien),
      } });
    }}>
      <fieldset disabled={busy || tenants.isFetching} className="grid gap-3 md:grid-cols-2">
        <label>Người thuê
          <select required disabled={editingId != null} value={form.nguoiThueId}
            className={control + " w-full"} onChange={(e) => setForm({ ...form, nguoiThueId: e.target.value })}>
            <option value="">Chọn người thuê</option>
            {(tenants.data ?? []).map((person) => <option key={person.id} value={person.id}>
              {person.hoTen} · {person.cccd} · #{person.id}
            </option>)}
          </select>
        </label>
        <label>Ngày vào
          <input type="date" required value={form.ngayVao} min={contract.ngayBatDau}
            max={contract.ngayKetThuc} className={control + " w-full"}
            onChange={(e) => setForm({ ...form, ngayVao: e.target.value })} />
        </label>
        <label>Ngày rời (để trống nếu chưa rời)
          <input type="date" value={form.ngayRoi} min={form.ngayVao} max={contract.ngayKetThuc}
            className={control + " w-full"} onChange={(e) => setForm({ ...form,
              ngayRoi: e.target.value, laDaiDien: e.target.value ? false : form.laDaiDien })} />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.laDaiDien} disabled={Boolean(form.ngayRoi)}
            onChange={(e) => setForm({ ...form, laDaiDien: e.target.checked })} />Người đại diện
        </label>
        <div className="flex gap-2">
          <button className={control}>Lưu</button>
          <button type="button" className={control} onClick={reset}>Hủy sửa</button>
        </div>
      </fieldset>
      <p className="mt-3 text-sm">Ghi ngày rời bằng form để giữ lịch sử. Xóa dành cho bản ghi nhập nhầm.</p>
    </form>}
    {members.isError ? <div className="text-red-600">
      <p>{getErrorMessage(members.error, "Không tải được thành viên")}</p>
      <button onClick={() => members.refetch()}>Thử lại</button>
    </div> : members.isPending ? <p>Đang tải thành viên...</p> :
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr><th>Người thuê</th><th>CCCD</th><th>Ngày vào</th><th>Ngày rời</th>
            <th>Đại diện</th><th>Thao tác</th></tr></thead>
          <tbody>{members.data.map((member) => <tr key={member.nguoiThueId} className="border-t">
            <td className="py-3">{member.hoTen}</td><td>{member.cccd}</td>
            <td>{member.ngayVao}</td><td>{member.ngayRoi ?? "Chưa ghi"}</td>
            <td>{member.laDaiDien ? "Có" : "Không"}</td>
            <td>{editable && <div className="flex gap-3">
              <button className="text-blue-600" disabled={busy} onClick={() => edit(member)}>Sửa / Rời phòng</button>
              <button className="text-red-600" disabled={busy} onClick={() => {
                if (window.confirm("Xóa bản ghi nhập nhầm? Dùng Sửa để ghi ngày rời."))
                  remove.mutate({ hopDongId: contract.id, nguoiThueId: member.nguoiThueId });
              }}>Xóa</button>
            </div>}</td>
          </tr>)}</tbody>
        </table>
        {members.data.length === 0 && <p className="py-3">Không có thành viên phù hợp.</p>}
      </div>}
  </div>;
}
