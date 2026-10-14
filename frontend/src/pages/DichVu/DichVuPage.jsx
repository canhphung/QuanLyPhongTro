import { useEffect, useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createDichVu,
  deleteDichVu,
  getDichVuPage,
  updateDichVu,
} from "../../api/dichVuApi";

import DichVuForm from "./components/DichVuForm";
import DichVuTable from "./components/DichVuTable";

import useAccount from "../../hooks/useAccount";
import Pagination from "../../components/common/Pagination";

const emptyForm = {
  tenDichVu: "",
  donViTinh: "",
  donGiaHienTai: "",
  tinhTheoChiSo: false,
  dangHoatDong: true,
};

function DichVuPage() {
  const queryClient = useQueryClient();
  const { data: account } = useAccount();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // GET danh sách dịch vụ.
  const params = { page, size, keyword: searchKeyword || undefined, hoatDong: statusFilter === "" ? undefined : statusFilter === "true" };
  const { data: result, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["dich-vu", account?.id, "phan-trang", params],
    queryFn: ({ signal }) => getDichVuPage(params, signal),
    enabled: Boolean(account),
  });
  const dichVus = result?.content ?? [];

  useEffect(() => {
    if (result && !isFetching && !isError) {
      const last = Math.max(0, result.totalPages - 1);
      if (page > last) setPage(last);
    }
  }, [result, isFetching, isError, page]);
  // Tìm kiếm theo tên và lọc theo trạng thái.


  // Reset form.
  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
  };

  // Refresh danh sách.
  const refreshDichVuList = () => {
    return queryClient.invalidateQueries({
      queryKey: ["dich-vu"],
    });
  };

  // Đọc lỗi backend, giống cách HoaDonPage đang làm.
  const getErrorMessage = (error, defaultMessage) => {
    const data = error.response?.data;

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (data && typeof data === "object") {
      const messages = Object.values(data).filter(
        (value) => typeof value === "string"
      );

      if (messages.length > 0) {
        return messages.join("\n");
      }
    }

    return defaultMessage;
  };

  // CREATE.
  const createMutation = useMutation({
    mutationFn: createDichVu,

    onSuccess: () => {
      refreshDichVuList();
      resetForm();
    },

    onError: (error) => {
      alert(getErrorMessage(error, "Không thể thêm dịch vụ"));
    },
  });

  // UPDATE.
  const updateMutation = useMutation({
    mutationFn: updateDichVu,

    onSuccess: () => {
      refreshDichVuList();
      resetForm();
    },

    onError: (error) => {
      alert(getErrorMessage(error, "Không thể cập nhật dịch vụ"));
    },
  });

  // DELETE.
  const deleteMutation = useMutation({
    mutationFn: deleteDichVu,

    onSuccess: (_, deletedId) => {
      refreshDichVuList();

      if (editingId === deletedId) {
        resetForm();
      }
    },

    onError: (error) => {
      alert(getErrorMessage(error, "Không thể xóa dịch vụ"));
    },
  });

  // Mở form thêm.
  const handleAdd = () => {
    if (isProcessing) return;
    setEditingId(null);
    setFormData({ ...emptyForm });
    setShowForm(true);
  };

  // Mở form sửa.
  const handleEdit = (item) => {
    if (isProcessing) return;
    setEditingId(item.id);

    setFormData({
      tenDichVu: item.tenDichVu,
      donViTinh: item.donViTinh,
      donGiaHienTai: item.donGiaHienTai ?? "",
      tinhTheoChiSo: Boolean(item.tinhTheoChiSo),
      dangHoatDong: Boolean(item.dangHoatDong),
    });

    setShowForm(true);
  };

  // Input thay đổi.
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit thêm / sửa.
  const handleSubmit = (event) => {
    event.preventDefault();
    if (isProcessing) return;

    const tenDichVu = formData.tenDichVu.trim();
    const donViTinh = formData.donViTinh.trim();
    const donGia = Number(formData.donGiaHienTai);

    if (!tenDichVu || !donViTinh) {
      alert("Tên dịch vụ và đơn vị tính không được để trống");
      return;
    }

    if (
      String(formData.donGiaHienTai).trim() === "" ||
      !Number.isSafeInteger(donGia) ||
      donGia < 0
    ) {
      alert("Đơn giá phải là số nguyên không âm hợp lệ");
      return;
    }

    const data = {
      tenDichVu,
      donViTinh,
      donGiaHienTai: donGia,
      tinhTheoChiSo: formData.tinhTheoChiSo,
      dangHoatDong: formData.dangHoatDong,
    };

    if (editingId !== null) {
      updateMutation.mutate({
        id: editingId,
        data,
      });
      return;
    }

    createMutation.mutate(data);
  };

  // Xóa dịch vụ.
  const handleDelete = (item) => {
    if (isProcessing) return;
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa dịch vụ "${item.tenDichVu}"?`
    );

    if (confirmDelete) {
      deleteMutation.mutate(item.id);
    }
  };

  // Tìm kiếm.
  const handleSearch = (event) => {
    event.preventDefault();
    setSearchKeyword(searchInput.trim());
    setPage(0);
  };

  // Xóa lọc.
  const handleClearFilter = () => {
    setSearchInput("");
    setSearchKeyword("");
    setPage(0);
    setStatusFilter("");
  };

  const isSaving =
    createMutation.isPending || updateMutation.isPending;

  const isProcessing = isSaving || deleteMutation.isPending || isFetching;

  if (isLoading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  if (isError) {
    return (
      <div>
        <p className="text-red-500">
          Không thể tải danh sách dịch vụ
        </p>

        <button
          onClick={() => refetch()}
          className="mt-3 rounded bg-gray-200 px-4 py-2"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          Quản lý dịch vụ
        </h1>

        <button
          onClick={handleAdd}
          disabled={isProcessing}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          + Thêm dịch vụ
        </button>
      </div>

      {/* SEARCH / FILTER */}
      <form
        onSubmit={handleSearch}
        className="mb-6 flex flex-wrap gap-2"
      >
        <input
          type="text"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Tìm kiếm theo tên dịch vụ..."
          className="rounded border bg-white px-3 py-2"
        />

        <select
          value={statusFilter}
          onChange={(event) => { setStatusFilter(event.target.value); setPage(0); }}
          className="rounded border bg-white px-3 py-2"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Ngừng hoạt động</option>
        </select>

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Tìm kiếm
        </button>

        <button
          type="button"
          onClick={handleClearFilter}
          className="rounded bg-gray-200 px-4 py-2"
        >
          Xóa lọc
        </button>
      </form>

      {/* FORM */}
      {showForm && (
        <DichVuForm
          formData={formData}
          editingId={editingId}
          isSaving={isProcessing}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      {/* TABLE */}
      <DichVuTable
        dichVus={dichVus}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isProcessing={isProcessing}
      />
      <Pagination page={page} size={size}
        totalElements={result?.totalElements ?? 0} totalPages={result?.totalPages ?? 0}
        disabled={isProcessing} onPageChange={setPage}
        onSizeChange={(next) => { setSize(next); setPage(0); }} />

    </div>
  );
}

export default DichVuPage;
