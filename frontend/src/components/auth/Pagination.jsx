export default function Pagination({ page, totalPages, onPageChange, disabled = false }) {
  const count = Math.max(0, totalPages);
  const button = "rounded border bg-white px-3 py-2 disabled:opacity-50";
  return (
    <nav aria-label="Phân trang" className="mt-3 flex items-center gap-3">
      <button type="button" className={button}
        disabled={disabled || page <= 0} onClick={() => onPageChange(page - 1)}>Trước</button>
      <span aria-live="polite">Trang {count === 0 ? 0 : page + 1}/{count}</span>
      <button type="button" className={button}
        disabled={disabled || page + 1 >= count} onClick={() => onPageChange(page + 1)}>Sau</button>
    </nav>
  );
}
