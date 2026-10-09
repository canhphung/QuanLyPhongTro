import { useMemo, useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createThanhToan,
  deleteThanhToan,
  getAllThanhToan,
  updateThanhToan,
} from "../../api/thanhToanApi";

import { getAllHoaDon } from "../../api/hoaDonApi";

import ThanhToanForm from "./components/ThanhToanForm";
import ThanhToanTable from "./components/ThanhToanTable";

const emptyForm = {
  hoaDonId: "",
  soTien: "",
  phuongThuc: "TIEN_MAT",
  ngayThanhToan: "",
  maGiaoDich: "",
};

function ThanhToanPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [hoaDonFilter, setHoaDonFilter] = useState("");

  // GET toàn bộ thanh toán.
  const thanhToanQuery = useQuery({
    queryKey: ["thanh-toan"],
    queryFn: getAllThanhToan,
  });

  // GET hóa đơn, dùng lại API cũ.
  const hoaDonQuery = useQuery({
    queryKey: ["hoa-don", ""],
    queryFn: () => getAllHoaDon(),
  });

  // const thanhToans = thanhToanQuery.data ?? [];
  // const hoaDons = hoaDonQuery.data ?? [];
console.log("Dữ liệu hóa đơn:", hoaDonQuery.data);
console.log("Dữ liệu thanh toán:", thanhToanQuery.data);

const thanhToans = Array.isArray(thanhToanQuery.data)
  ? thanhToanQuery.data
  : [];

const hoaDons = Array.isArray(hoaDonQuery.data)
  ? hoaDonQuery.data
  : [];
  
  // Tính tổng tiền đã thu của từng hóa đơn.
  // Luôn dùng toàn bộ thanh toán, không dùng danh sách đang lọc.
  const daThanhToanMap = useMemo(() => {
    const result = {};

    thanhToans.forEach((item) => {
      result[item.hoaDonId] =
        (result[item.hoaDonId] ?? 0) + Number(item.soTien);
    });

    return result;
  }, [thanhToans]);

  // Lọc lịch sử theo hóa đơn.
  const filteredThanhToans = useMemo(() => {
    if (!hoaDonFilter) {
      return thanhToans;
    }

    return thanhToans.filter(
      (item) => item.hoaDonId === Number(hoaDonFilter)
    );
  }, [thanhToans, hoaDonFilter]);

  // Hóa đơn đang được chọn trên form.
  const selectedHoaDon = hoaDons.find(
    (item) => item.id === Number(formData.hoaDonId)
  );

  // Khoản thu đang sửa.
  const editingThanhToan = thanhToans.find(
    (item) => item.id === editingId
  );

  const daThanhToan = selectedHoaDon
    ? daThanhToanMap[selectedHoaDon.id] ?? 0
    : 0;

  const conNo = selectedHoaDon
    ? Math.max(
        0,
        Number(selectedHoaDon.tongTien) - daThanhToan
      )
    : 0;

  // Khi sửa phải cộng lại khoản cũ để tính mức tối đa.
  // Ví dụ tổng 3 triệu, đã thu 3 triệu, đang sửa khoản 1 triệu:
  // mức tối đa của khoản đang sửa là 1 triệu.
  const maxAmount =
    conNo + Number(editingThanhToan?.soTien ?? 0);

  // Khi thêm chỉ chọn hóa đơn còn nợ.
  // Khi sửa chỉ hiển thị hóa đơn của khoản thu đó.
  const availableHoaDons = hoaDons.filter((item) => {
    if (editingId !== null) {
      return item.id === Number(formData.hoaDonId);
    }

    const daThu = daThanhToanMap[item.id] ?? 0;

    return Number(item.tongTien) > daThu;
  });

  // Reset form.
  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
  };

  // Refresh thanh toán và hóa đơn.
  const refreshThanhToanList = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["thanh-toan"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["hoa-don"],
      }),
    ]);
  };

  // Đọc lỗi backend, đặt ngay trong Page.
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
    mutationFn: createThanhToan,

    onSuccess: async () => {
      resetForm();
      await refreshThanhToanList();
    },

    onError: (error) => {
      alert(getErrorMessage(error, "Không thể thêm thanh toán"));
      refreshThanhToanList();
    },
  });

  // UPDATE.
  const updateMutation = useMutation({
    mutationFn: updateThanhToan,

    onSuccess: async () => {
      resetForm();
      await refreshThanhToanList();
    },

    onError: (error) => {
      alert(getErrorMessage(error, "Không thể cập nhật thanh toán"));
      refreshThanhToanList();
    },
  });

  // DELETE.
  const deleteMutation = useMutation({
    mutationFn: deleteThanhToan,

    onSuccess: async (_, deletedId) => {
      if (editingId === deletedId) {
        resetForm();
      }

      await refreshThanhToanList();
    },

    onError: (error) => {
      alert(getErrorMessage(error, "Không thể xóa thanh toán"));
      refreshThanhToanList();
    },
  });

  // Mở form thêm.
  const handleAdd = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setShowForm(true);
  };

  // Mở form sửa.
  const handleEdit = (item) => {
    setEditingId(item.id);

    setFormData({
      hoaDonId: String(item.hoaDonId),
      soTien: item.soTien ?? "",
      phuongThuc: item.phuongThuc,
      ngayThanhToan: item.ngayThanhToan?.slice(0, 19) ?? "",
      maGiaoDich: item.maGiaoDich ?? "",
    });

    setShowForm(true);
  };

  // Input thay đổi.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,

      // Đổi hóa đơn thì xóa số tiền đã nhập.
      ...(name === "hoaDonId" ? { soTien: "" } : {}),
    }));
  };

  // Submit thêm / sửa.
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedHoaDon) {
      alert("Vui lòng chọn hóa đơn");
      return;
    }

    const soTien = Number(formData.soTien);

    if (
      String(formData.soTien).trim() === "" ||
      !Number.isSafeInteger(soTien) ||
      soTien <= 0
    ) {
      alert("Số tiền phải là số nguyên dương hợp lệ");
      return;
    }

    if (soTien > maxAmount) {
      alert(
        `Số tiền tối đa được nhập là ${maxAmount.toLocaleString("vi-VN")} đ`
      );
      return;
    }

    if (formData.ngayThanhToan) {
      const paymentTime = new Date(formData.ngayThanhToan).getTime();

      if (!Number.isFinite(paymentTime)) {
        alert("Ngày thanh toán không hợp lệ");
        return;
      }

      if (paymentTime > Date.now()) {
        alert("Ngày thanh toán không được nằm trong tương lai");
        return;
      }
    }

    const data = {
      hoaDonId: Number(formData.hoaDonId),
      soTien,
      phuongThuc: formData.phuongThuc,
      ngayThanhToan: formData.ngayThanhToan || null,
      maGiaoDich: formData.maGiaoDich.trim() || null,
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

  // Xóa thanh toán.
  const handleDelete = (item) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa khoản thanh toán #${item.id}, ` +
      `số tiền ${Number(item.soTien).toLocaleString("vi-VN")} đ?`
    );

    if (confirmDelete) {
      deleteMutation.mutate(item.id);
    }
  };

  const isSaving =
    createMutation.isPending || updateMutation.isPending;

  const isProcessing = isSaving || deleteMutation.isPending;

  if (thanhToanQuery.isLoading || hoaDonQuery.isLoading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  if (thanhToanQuery.isError || hoaDonQuery.isError) {
    return (
      <div>
        <p className="text-red-500">
          Không thể tải hóa đơn hoặc danh sách thanh toán
        </p>

        <button
          onClick={() => {
            thanhToanQuery.refetch();
            hoaDonQuery.refetch();
          }}
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
          Quản lý thanh toán
        </h1>

        <button
          onClick={handleAdd}
          disabled={isProcessing}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          + Ghi nhận thanh toán
        </button>
      </div>

      {/* FILTER */}
      <div className="mb-6 flex flex-wrap gap-2">
        <select
          value={hoaDonFilter}
          onChange={(event) => setHoaDonFilter(event.target.value)}
          className="rounded border bg-white px-3 py-2"
        >
          <option value="">-- Tất cả hóa đơn --</option>

          {hoaDons.map((item) => (
            <option key={item.id} value={item.id}>
              #{item.id} - Phòng {item.soPhong} -
              Kỳ {item.kyThanhToan}
            </option>
          ))}
        </select>

        {hoaDonFilter && (
          <button
            type="button"
            onClick={() => setHoaDonFilter("")}
            className="rounded bg-gray-200 px-4 py-2"
          >
            Xóa lọc
          </button>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <ThanhToanForm
          formData={formData}
          editingId={editingId}
          hoaDons={availableHoaDons}
          selectedHoaDon={selectedHoaDon}
          daThanhToan={daThanhToan}
          conNo={conNo}
          maxAmount={maxAmount}
          isSaving={isProcessing}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      {/* TABLE */}
      <ThanhToanTable
        thanhToans={filteredThanhToans}
        hoaDons={hoaDons}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isProcessing={isProcessing}
      />
    </div>
  );
}

export default ThanhToanPage;