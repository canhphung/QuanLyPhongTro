import { useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createNguoiThue,
  deleteNguoiThue,
  getAllNguoiThue,
  searchNguoiThue,
  updateNguoiThue,
} from "../../api/nguoiThueApi";

import NguoiThueForm from "./components/NguoiThueForm";
import NguoiThueTable from "./components/NguoiThueTable";

const emptyForm = {
  hoTen: "",
  cccd: "",
  soDienThoai: "",
  ngaySinh: "",
  diaChiThuongTru: "",
};

function NguoiThuePage() {
  const queryClient = useQueryClient();

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

  const {
    data: nguoiThues = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["nguoi-thue", searchKeyword],

    queryFn: () => {
      if (searchKeyword) {
        return searchNguoiThue(searchKeyword);
      }

      return getAllNguoiThue();
    },
  });

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
    queryClient.invalidateQueries({
      queryKey: ["nguoi-thue"],
    });
  };

  // ==========================================
  // Lấy message lỗi từ Spring Boot
  // ==========================================

  const getErrorMessage = (error, defaultMessage) => {
    const data = error.response?.data;

    if (data?.message) {
      return data.message;
    }

    // Validation error của Spring Boot
    // Ví dụ:
    // {
    //   hoTen: "Họ tên không được để trống",
    //   cccd: "CCCD tối đa 20 ký tự"
    // }

    if (data && typeof data === "object") {
      const messages = Object.values(data);

      if (messages.length > 0) {
        return messages.join("\n");
      }
    }

    return defaultMessage;
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

    onSuccess: () => {
      refreshNguoiThueList();
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
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  // ==========================================
  // Mở form sửa
  // ==========================================

  const handleEdit = (nguoiThue) => {
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
  };

  // ==========================================
  // Xóa tìm kiếm
  // ==========================================

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchKeyword("");
  };

  const isSaving =
      createMutation.isPending ||
      updateMutation.isPending;

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
        <p className="text-red-500">
          Không thể tải danh sách người thuê
        </p>
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
                isSaving={isSaving}
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
            isDeleting={deleteMutation.isPending}
        />
      </div>
  );
}

export default NguoiThuePage;