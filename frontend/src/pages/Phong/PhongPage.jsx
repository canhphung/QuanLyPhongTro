import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createPhong,
  deletePhong,
  getPhongPage,
  updatePhong,
  updateTrangThaiPhong,
} from "../../api/phongApi";

import getErrorMessage from "../../utils/getErrorMessage";
import PhongForm from "./components/PhongForm";
import PhongTable from "./components/PhongTable";
import Pagination from "../../components/common/Pagination";

const emptyForm = {
  soPhong: "",
  dienTich: "",
  giaThue: "",
};

const statusLabels = {
  TRONG: "Trống",
  DANG_THUE: "Đang thuê",
  BAO_TRI: "Bảo trì",
  NGUNG_HOAT_DONG: "Ngừng hoạt động",
};

function PhongPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [trangThai, setTrangThai] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState("id:asc");

  const [sortBy, direction] = sort.split(":");

  const params = {
    page,
    size,
    keyword: keyword || undefined,
    trangThai: trangThai || undefined,
    sortBy,
    direction,
  };

  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["phong", "phan-trang", params],
    queryFn: () => getPhongPage(params),
  });

  const phongs = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  // Nếu xóa dòng cuối của trang, quay về trang còn tồn tại.
  useEffect(() => {
    if (!data || isFetching || isError) return;

    const lastPage = Math.max(0, data.totalPages - 1);

    if (page > lastPage) {
      setPage(lastPage);
    }
  }, [data, isFetching, isError, page]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const refreshData = () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["phong"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);

  const showError = (error, message) => {
    alert(getErrorMessage(error, message));
  };

  const createMutation = useMutation({
    mutationFn: createPhong,
    onSuccess: async () => {
      resetForm();
      await refreshData();
    },
    onError: (error) => showError(error, "Không thể thêm phòng"),
  });

  const updateMutation = useMutation({
    mutationFn: updatePhong,
    onSuccess: async () => {
      resetForm();
      await refreshData();
    },
    onError: (error) => showError(error, "Không thể cập nhật phòng"),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePhong,
    onSuccess: refreshData,
    onError: (error) => showError(error, "Không thể xóa phòng"),
  });

  const statusMutation = useMutation({
    mutationFn: updateTrangThaiPhong,
    onSuccess: refreshData,
    onError: (error) =>
        showError(error, "Không thể đổi trạng thái phòng"),
  });

  const isSaving =
      createMutation.isPending || updateMutation.isPending;

  const isBusy =
      isSaving ||
      deleteMutation.isPending ||
      statusMutation.isPending ||
      isFetching;

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

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isBusy) return;

    const data = {
      soPhong: formData.soPhong.trim(),
      dienTich: Number(formData.dienTich),
      // Gửi chuỗi để không làm mất độ chính xác tiền qua Number.
      giaThue: String(formData.giaThue).trim(),
    };

    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (phong) => {
    if (isBusy) return;

    if (window.confirm(`Xóa phòng "${phong.soPhong}"?`)) {
      deleteMutation.mutate(phong.id);
    }
  };

  const handleUpdateTrangThai = (phong, nextStatus) => {
    if (isBusy || nextStatus === phong.trangThai) return;

    const confirmed = window.confirm(
        `Chuyển phòng "${phong.soPhong}" sang ` +
        `"${statusLabels[nextStatus]}"?`
    );

    if (confirmed) {
      statusMutation.mutate({
        id: phong.id,
        trangThai: nextStatus,
      });
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setKeyword(searchInput.trim());
    setPage(0);
  };

  const clearFilters = () => {
    setSearchInput("");
    setKeyword("");
    setTrangThai("");
    setSort("id:asc");
    setPage(0);
  };

  const controlClass =
      "rounded border bg-white px-3 py-2 disabled:opacity-50";

  return (
      <div>
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Quản lý phòng</h1>

          <button
              type="button"
              onClick={handleAdd}
              disabled={isBusy}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            + Thêm phòng
          </button>
        </div>

        <form
            onSubmit={handleSearch}
            className="mb-4 flex flex-wrap gap-2"
        >
          <input
              aria-label="Tìm số phòng"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm số phòng..."
              className={controlClass}
          />

          <button
              type="submit"
              disabled={isBusy}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Tìm kiếm
          </button>

          <select
              aria-label="Lọc trạng thái phòng"
              value={trangThai}
              disabled={isBusy}
              onChange={(event) => {
                setTrangThai(event.target.value);
                setPage(0);
              }}
              className={controlClass}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
            ))}
          </select>

          <select
              aria-label="Sắp xếp phòng"
              value={sort}
              disabled={isBusy}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(0);
              }}
              className={controlClass}
          >
            <option value="id:asc">ID tăng dần</option>
            <option value="id:desc">ID giảm dần</option>
            <option value="soPhong:asc">Số phòng A–Z</option>
            <option value="giaThue:asc">Giá thấp đến cao</option>
            <option value="giaThue:desc">Giá cao đến thấp</option>
          </select>

          <button
              type="button"
              onClick={clearFilters}
              disabled={isBusy}
              className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
          >
            Xóa lọc
          </button>
        </form>

        {showForm && (
            <PhongForm
                formData={formData}
                editingId={editingId}
                isSaving={isSaving || isFetching}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={resetForm}
            />
        )}

        {isError ? (
            <div className="rounded bg-red-50 p-4">
              <p className="text-red-600">
                {getErrorMessage(error, "Không thể tải danh sách phòng")}
              </p>
              <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-2 text-blue-600"
              >
                Thử lại
              </button>
            </div>
        ) : isPending ? (
            <p>Đang tải danh sách phòng...</p>
        ) : (
            <>
              {isFetching && (
                  <p className="mb-2 text-sm text-gray-500">
                    Đang cập nhật...
                  </p>
              )}

              <PhongTable
                  phongs={phongs}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdateTrangThai={handleUpdateTrangThai}
                  isDeleting={deleteMutation.isPending}
                  isBusy={isBusy}
              />
                <Pagination
                    page={page}
                    size={size}
                    totalElements={data.totalElements}
                    totalPages={data.totalPages}
                    disabled={isBusy}
                    onPageChange={setPage}
                    onSizeChange={(nextSize) => {
                      setSize(nextSize);
                      setPage(0);
                    }}
                />
            </>
        )}
      </div>
  );
}

export default PhongPage;