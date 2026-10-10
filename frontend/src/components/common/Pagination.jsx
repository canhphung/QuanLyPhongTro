function Pagination({
  page,
  size,
  totalElements,
  totalPages,
  disabled = false,
  onPageChange,
  onSizeChange,
}) {
  const buttonClass =
      "rounded border bg-white px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Tổng: {totalElements} bản ghi · Trang{" "}
          {totalPages === 0 ? 0 : page + 1}/{totalPages}
        </p>

        <div className="flex items-center gap-2">
          <select
              aria-label="Số bản ghi mỗi trang"
              value={size}
              disabled={disabled}
              onChange={(event) => onSizeChange(Number(event.target.value))}
              className={buttonClass}
          >
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </select>

          <button
              type="button"
              disabled={disabled || page <= 0}
              onClick={() => onPageChange(page - 1)}
              className={buttonClass}
          >
            Trước
          </button>

          <button
              type="button"
              disabled={
                  disabled || totalPages === 0 || page >= totalPages - 1
              }
              onClick={() => onPageChange(page + 1)}
              className={buttonClass}
          >
            Sau
          </button>
        </div>
      </div>
  );
}

export default Pagination;