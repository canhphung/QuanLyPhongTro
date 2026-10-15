import { useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createHoaDon,
  deleteHoaDon,
  getAllHoaDon,
  updateHoaDon,
} from "../../api/hoaDonApi";

import { getAllHopDong } from "../../api/hopDongApi";

import HoaDonForm from "./components/HoaDonForm";
import HoaDonTable from "./components/HoaDonTable";

const emptyForm = {
  hopDongId: "",
  kyThanhToan: "",
  ngayLap: "",
  hanThanhToan: "",
  tienPhong: "",
};

function HoaDonPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  // Trạng thái đang lọc ("" = tất cả)
  const [trangThaiFilter, setTrangThaiFilter] = useState("");

  // ==========================================
  // GET danh sách hóa đơn / hợp đồng
  // ==========================================

  const {
    data: hoaDons = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["hoa-don", trangThaiFilter],

    queryFn: () => getAllHoaDon(trangThaiFilter),
  });

  const { data: hopDongs = [] } = useQuery({
    queryKey: ["hop-dong"],
    queryFn: getAllHopDong,
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

  const refreshHoaDonList = () => {
    queryClient.invalidateQueries({
      queryKey: ["hoa-don"],
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
    //   kyThanhToan: "Kỳ thanh toán không được để trống",
    //   hanThanhToan: "Hạn thanh toán không được sớm hơn ngày lập"
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
    mutationFn: createHoaDon,

    onSuccess: () => {
      refreshHoaDonList();
      resetForm();
    },

    onError: (error) => {
      alert(
          getErrorMessage(
              error,
              "Không thể thêm hóa đơn"
          )
      );
    },
  });

  // ==========================================
  // UPDATE
  // ==========================================

  const updateMutation = useMutation({
    mutationFn: updateHoaDon,

    onSuccess: () => {
      refreshHoaDonList();
      resetForm();
    },

    onError: (error) => {
      alert(
          getErrorMessage(
              error,
              "Không thể cập nhật hóa đơn"
          )
      );
    },
  });

  // ==========================================
  // DELETE
  // ==========================================

  const deleteMutation = useMutation({
    mutationFn: deleteHoaDon,

    onSuccess: () => {
      refreshHoaDonList();
    },

    onError: (error) => {
      alert(
          getErrorMessage(
              error,
              "Không thể xóa hóa đơn"
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

  const handleEdit = (hoaDon) => {
    setEditingId(hoaDon.id);

    setFormData({
      hopDongId: hoaDon.hopDongId || "",
      kyThanhToan: hoaDon.kyThanhToan || "",
      ngayLap: hoaDon.ngayLap || "",
      hanThanhToan: hoaDon.hanThanhToan || "",
      tienPhong: hoaDon.tienPhong || "",
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
      hopDongId: Number(formData.hopDongId),

      kyThanhToan: formData.kyThanhToan,

      ngayLap: formData.ngayLap,

      hanThanhToan: formData.hanThanhToan,

      tienPhong:
          formData.tienPhong === ""
              ? null
              : Number(formData.tienPhong),
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

  const handleDelete = (hoaDon) => {
    const confirmDelete = window.confirm(
        `Bạn có chắc chắn muốn xóa hóa đơn "${hoaDon.soPhong}" kỳ ${hoaDon.kyThanhToan}?`
    );

    if (confirmDelete) {
      deleteMutation.mutate(hoaDon.id);
    }
  };

  // ==========================================
  // Lọc theo trạng thái
  // ==========================================

  const handleFilterChange = (event) => {
    setTrangThaiFilter(event.target.value);
  };

  // ==========================================
  // Xóa lọc
  // ==========================================

  const handleClearFilter = () => {
    setTrangThaiFilter("");
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
          Không thể tải danh sách hóa đơn
        </p>
    );
  }

  return (
      <div>
        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Quản lý hóa đơn
          </h1>

          <button
              onClick={handleAdd}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Thêm hóa đơn
          </button>
        </div>

        {/* FILTER */}

        <form
            onSubmit={(event) => event.preventDefault()}
            className="mb-6 flex gap-2"
        >
          <select
              value={trangThaiFilter}
              onChange={handleFilterChange}
              className="w-full max-w-md rounded border bg-white px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="">
              -- Tất cả trạng thái --
            </option>

            <option value="CHUA_THANH_TOAN">
              Chưa thanh toán
            </option>

            <option value="THANH_TOAN_MOT_PHAN">
              Thanh toán một phần
            </option>

            <option value="DA_THANH_TOAN">
              Đã thanh toán
            </option>
          </select>

          {trangThaiFilter && (
              <button
                  type="button"
                  onClick={handleClearFilter}
                  className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
              >
                Xóa lọc
              </button>
          )}
        </form>

        {/* FORM */}

        {showForm && (
            <HoaDonForm
                formData={formData}
                editingId={editingId}
                hopDongs={hopDongs}
                isSaving={isSaving}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={resetForm}
            />
        )}

        {/* TABLE */}

        <HoaDonTable
            hoaDons={hoaDons}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
        />
      </div>
  );
}

export default HoaDonPage;
