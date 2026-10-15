import { useMemo, useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createHopDong,
  getAllHopDong,
  huyHopDong,
  ketThucHopDong,
  updateHopDong,
} from "../../api/hopDongApi";

import { getAllPhong } from "../../api/phongApi";

import HopDongForm from "./components/HopDongForm";
import HopDongTable from "./components/HopDongTable";

const emptyForm = {
  phongId: "",
  ngayBatDau: "",
  ngayKetThuc: "",
  giaThueThoaThuan: "",
  tienCoc: "",
};

function HopDongPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  // Text đang nhập vào ô tìm kiếm
  const [searchInput, setSearchInput] = useState("");

  // Từ khóa đã submit (tìm kiếm phía client theo số phòng)
  const [searchKeyword, setSearchKeyword] = useState("");

  // ==========================================
  // GET danh sách hợp đồng / phòng
  // ==========================================

  const {
    data: hopDongs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["hop-dong"],
    queryFn: getAllHopDong,
  });

  const { data: phongs = [] } = useQuery({
    queryKey: ["phong"],
    queryFn: getAllPhong,
  });

  // ==========================================
  // Lọc theo số phòng
  // ==========================================

  const filteredHopDongs = useMemo(() => {
    if (!searchKeyword) {
      return hopDongs;
    }

    const keyword = searchKeyword.toLowerCase();

    return hopDongs.filter((hopDong) =>
        (hopDong.soPhong || "")
            .toLowerCase()
            .includes(keyword)
    );
  }, [hopDongs, searchKeyword]);

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

  const refreshHopDongList = () => {
    queryClient.invalidateQueries({
      queryKey: ["dashboard"],
    });

    // Trạng thái phòng thay đổi khi lập / kết thúc / hủy hợp đồng
    queryClient.invalidateQueries({
      queryKey: ["phong"],
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
    //   ngayBatDau: "Ngày bắt đầu không được để trống",
    //   tienCoc: "Tiền cọc không được âm"
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
    mutationFn: createHopDong,

    onSuccess: () => {
      refreshHopDongList();
      resetForm();
    },

    onError: (error) => {
      alert(
          getErrorMessage(
              error,
              "Không thể thêm hợp đồng"
          )
      );
    },
  });

  // ==========================================
  // UPDATE
  // ==========================================

  const updateMutation = useMutation({
    mutationFn: updateHopDong,

    onSuccess: () => {
      refreshHopDongList();
      resetForm();
    },

    onError: (error) => {
      alert(
          getErrorMessage(
              error,
              "Không thể cập nhật hợp đồng"
          )
      );
    },
  });

  // ==========================================
  // KẾT THÚC hợp đồng
  // ==========================================

  const ketThucMutation = useMutation({
    mutationFn: ketThucHopDong,

    onSuccess: () => {
      refreshHopDongList();
      resetForm();
    },

    onError: (error) => {
      alert(
          getErrorMessage(
              error,
              "Không thể kết thúc hợp đồng"
          )
      );
    },
  });

  // ==========================================
  // HỦY hợp đồng
  // ==========================================

  const huyMutation = useMutation({
    mutationFn: huyHopDong,

    onSuccess: () => {
      refreshHopDongList();
      resetForm();
    },

    onError: (error) => {
      alert(
          getErrorMessage(
              error,
              "Không thể hủy hợp đồng"
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

  const handleEdit = (hopDong) => {
    setEditingId(hopDong.id);

    setFormData({
      phongId: hopDong.phongId || "",
      ngayBatDau: hopDong.ngayBatDau || "",
      ngayKetThuc: hopDong.ngayKetThuc || "",
      giaThueThoaThuan:
          hopDong.giaThueThoaThuan || "",
      tienCoc: hopDong.tienCoc || "",
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
      phongId: Number(formData.phongId),

      ngayBatDau: formData.ngayBatDau,

      ngayKetThuc: formData.ngayKetThuc,

      giaThueThoaThuan: Number(
          formData.giaThueThoaThuan
      ),

      tienCoc: Number(formData.tienCoc),
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
  // Kết thúc hợp đồng
  // ==========================================

  const handleKetThuc = (hopDong) => {
    const ngayKetThucThucTe = window.prompt(
        "Nhập ngày trả phòng thực tế theo định dạng YYYY-MM-DD:"
    );

    if (ngayKetThucThucTe === null) return;

    const ngay = ngayKetThucThucTe.trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(ngay)) {
      alert("Ngày phải có định dạng YYYY-MM-DD");
      return;
    }

    const lyDoKetThuc = window.prompt("Nhập lý do kết thúc:");

    if (lyDoKetThuc === null) return;

    const lyDo = lyDoKetThuc.trim();

    if (!lyDo || lyDo.length > 500) {
      alert("Lý do phải có từ 1 đến 500 ký tự");
      return;
    }

    const confirmed = window.confirm(
        `Kết thúc hợp đồng phòng "${hopDong.soPhong}" ngày ${ngay}?\n` +
        "Các hóa đơn còn nợ vẫn được giữ để tiếp tục thu."
    );

    if (!confirmed) return;

    ketThucMutation.mutate({
      id: hopDong.id,
      data: {
        ngayKetThucThucTe: ngay,
        lyDoKetThuc: lyDo,
      },
    });
  };

  // ==========================================
  // Hủy hợp đồng
  // ==========================================

  const handleHuy = (hopDong) => {
    const confirmHuy = window.confirm(
        `Bạn có chắc chắn muốn hủy hợp đồng phòng "${hopDong.soPhong}"?`
    );

    if (confirmHuy) {
      huyMutation.mutate(hopDong.id);
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

  const isProcessing =
      ketThucMutation.isPending ||
      huyMutation.isPending;

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
          Không thể tải danh sách hợp đồng
        </p>
    );
  }

  return (
      <div>
        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Quản lý hợp đồng
          </h1>

          <button
              onClick={handleAdd}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Thêm hợp đồng
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
              placeholder="Tìm kiếm theo số phòng..."
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
            <HopDongForm
                formData={formData}
                editingId={editingId}
                phongs={phongs}
                isSaving={isSaving}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={resetForm}
            />
        )}

        {/* TABLE */}

        <HopDongTable
            hopDongs={filteredHopDongs}
            onEdit={handleEdit}
            onKetThuc={handleKetThuc}
            onHuy={handleHuy}
            isProcessing={isProcessing}
        />
      </div>
  );
}

export default HopDongPage;
