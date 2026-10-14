import getErrorMessage from "../../utils/getErrorMessage";
import { useEffect, useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createNguoiThue,
  deleteNguoiThue,
  getNguoiThuePage,
  updateNguoiThue,
} from "../../api/nguoiThueApi";

import NguoiThueForm from "./components/NguoiThueForm";
import NguoiThueTable from "./components/NguoiThueTable";

import useAccount from "../../hooks/useAccount";
import Pagination from "../../components/common/Pagination";

const emptyForm = {
  hoTen: "",
  cccd: "",
  soDienThoai: "",
  ngaySinh: "",
  diaChiThuongTru: "",
};

function NguoiThuePage() {
  const queryClient = useQueryClient();
  const { data: account } = useAccount();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  // Text đang nhập vào ô tìm kiếm
  const [searchInput, setSearchInput] = useState("");

  // Từ khóa đã submit để gọi API
  const [searchKeyword, setSearchKeyword] = useState("");

  // ==========================================
  // GET danh sách / tìm kiếm người thuê
  // ==========================================

  const params = { page, size, keyword: searchKeyword || undefined };
  const { data: result, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["nguoi-thue", account?.id, "phan-trang", params],
    queryFn: ({ signal }) => getNguoiThuePage(params, signal),
    enabled: Boolean(account),
  });
  const nguoiThues = result?.content ?? [];

  useEffect(() => {
    if (result && !isFetching && !isError) {
      const last = Math.max(0, result.totalPages - 1);
      if (page > last) setPage(last);
    }
  }, [result, isFetching, isError, page]);
  // ==========================================
  // Reset form
  // ==========================================

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  // ==========================================
  // Refresh danh sách
  // ==========================================

  const refreshNguoiThueList = () => {
    return Promise.all(["nguoi-thue", "thanh-vien", "dashboard"].map(
      (key) => queryClient.invalidateQueries({ queryKey: [key, account?.id] })));
  };

  // ==========================================
  // CREATE
  // ==========================================

  const createMutation = useMutation({
    mutationFn: createNguoiThue,

    onSuccess: () => {
      refreshNguoiThueList();
      resetForm();
    },

    onError: (error) => {
      alert(
          getErrorMessage(
              error,
              "Không thể thêm người thuê"
          )
      );
    },
  });

  // ==========================================
  // UPDATE
  // ==========================================

  const updateMutation = useMutation({
    mutationFn: updateNguoiThue,

    onSuccess: () => {
      refreshNguoiThueList();
      resetForm();
    },

    onError: (error) => {
      alert(
          getErrorMessage(
              error,
              "Không thể cập nhật người thuê"
          )
      );
    },
  });

  // ==========================================
  // DELETE
  // ==========================================

  const deleteMutation = useMutation({
    mutationFn: deleteNguoiThue,

    onSuccess: (_, deletedId) => {
      refreshNguoiThueList();
      if (editingId === deletedId) resetForm();
    },

    onError: (error) => {
      alert(
          getErrorMessage(
              error,
              "Không thể xóa người thuê"
          )
      );
    },
  });

  // ==========================================
  // Mở form thêm
  // ==========================================

  const handleAdd = () => {
    if (isProcessing) return;
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  // ==========================================
  // Mở form sửa
  // ==========================================

  const handleEdit = (nguoiThue) => {
    if (isProcessing) return;
    setEditingId(nguoiThue.id);

    setFormData({
      hoTen: nguoiThue.hoTen || "",
      cccd: nguoiThue.cccd || "",
      soDienThoai: nguoiThue.soDienThoai || "",
      ngaySinh: nguoiThue.ngaySinh || "",
      diaChiThuongTru:
          nguoiThue.diaChiThuongTru || "",
    });

    setShowForm(true);
  };

  // ==========================================
  // Input form thay đổi
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // Submit thêm / sửa
  // ==========================================

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isProcessing) return;

    const data = {
      hoTen: formData.hoTen.trim(),

      cccd: formData.cccd.trim(),

      soDienThoai:
          formData.soDienThoai.trim() || null,

      ngaySinh:
          formData.ngaySinh || null,

      diaChiThuongTru:
          formData.diaChiThuongTru.trim() || null,
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

  // ==========================================
  // Xóa
  // ==========================================

  const handleDelete = (nguoiThue) => {
    if (isProcessing) return;
    const confirmDelete = window.confirm(
        `Bạn có chắc chắn muốn xóa người thuê "${nguoiThue.hoTen}"?`
    );

    if (confirmDelete) {
      deleteMutation.mutate(nguoiThue.id);
    }
  };

  // ==========================================
  // Tìm kiếm
  // ==========================================

  const handleSearch = (event) => {
    event.preventDefault();

    setSearchKeyword(searchInput.trim());
    setPage(0);
  };

  // ==========================================
  // Xóa tìm kiếm
  // ==========================================

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchKeyword("");
    setPage(0);
  };

  const isSaving =
      createMutation.isPending ||
      updateMutation.isPending;
  const isProcessing = isSaving || deleteMutation.isPending || isFetching;

  // ==========================================
  // Loading
  // ==========================================

  if (isLoading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  // ==========================================
  // Error
  // ==========================================

  if (isError) {
    return (
        <div><p className="text-red-500">Không thể tải danh sách người thuê</p>
          <button onClick={() => refetch()} className="text-blue-600">Thử lại</button>
        </div>
    );
  }

  return (
      <div>
        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Quản lý người thuê
          </h1>

          <button
              onClick={handleAdd}
              disabled={isProcessing}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Thêm người thuê
          </button>
        </div>

        {/* SEARCH */}

        <form
            onSubmit={handleSearch}
            className="mb-6 flex gap-2"
        >
          <input
              type="text"
              value={searchInput}
              onChange={(event) =>
                  setSearchInput(event.target.value)
              }
              placeholder="Tìm kiếm theo tên..."
              className="w-full max-w-md rounded border bg-white px-3 py-2 outline-none focus:border-blue-500"
          />

          <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Tìm kiếm
          </button>

          {searchKeyword && (
              <button
                  type="button"
                  onClick={handleClearSearch}
                  className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
              >
                Xóa lọc
              </button>
          )}
        </form>

        {/* FORM */}

        {showForm && (
            <NguoiThueForm
                formData={formData}
                editingId={editingId}
                isSaving={isProcessing}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={resetForm}
            />
        )}

        {/* TABLE */}

        <NguoiThueTable
            nguoiThues={nguoiThues}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={isProcessing}
        />
      <Pagination page={page} size={size}
        totalElements={result?.totalElements ?? 0} totalPages={result?.totalPages ?? 0}
        disabled={isProcessing} onPageChange={setPage}
        onSizeChange={(next) => { setSize(next); setPage(0); }} />

      </div>
  );
}

export default NguoiThuePage;
