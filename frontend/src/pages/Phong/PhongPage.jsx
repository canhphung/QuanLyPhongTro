import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createPhong,
  deletePhong,
  getAllPhong,
  updatePhong,
} from "../../api/phongApi";

import PhongForm from "./components/PhongForm";
import PhongTable from "./components/PhongTable";

const emptyForm = {
  soPhong: "",
  dienTich: "",
  giaThue: "",
};

function PhongPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const {
    data: phongs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["phong"],
    queryFn: getAllPhong,
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const refreshPhongList = () => {
    queryClient.invalidateQueries({
      queryKey: ["phong"],
    });
  };

  const createMutation = useMutation({
    mutationFn: createPhong,
    onSuccess: () => {
      refreshPhongList();
      resetForm();
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Không thể thêm phòng");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePhong,
    onSuccess: () => {
      refreshPhongList();
      resetForm();
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Không thể cập nhật phòng");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePhong,
    onSuccess: () => {
      refreshPhongList();
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Không thể xóa phòng");
    },
  });

  const handleAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const handleEdit = (phong) => {
    setEditingId(phong.id);
    setFormData({
      soPhong: phong.soPhong,
      dienTich: phong.dienTich,
      giaThue: phong.giaThue,
    });
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = {
      soPhong: formData.soPhong.trim(),
      dienTich: Number(formData.dienTich),
      giaThue: Number(formData.giaThue),
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

  const handleDelete = (phong) => {
    const confirmDelete = window.confirm(
        `Bạn có chắc chắn muốn xóa phòng ${phong.soPhong}?`
    );

    if (confirmDelete) {
      deleteMutation.mutate(phong.id);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  if (isError) {
    return <p className="text-red-500">Không thể tải danh sách phòng</p>;
  }

  return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý phòng</h1>

          <button
              onClick={handleAdd}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Thêm phòng
          </button>
        </div>

        {showForm && (
            <PhongForm
                formData={formData}
                editingId={editingId}
                isSaving={isSaving}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={resetForm}
            />
        )}

        <PhongTable
            phongs={phongs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
        />
      </div>
  );
}

export default PhongPage;
