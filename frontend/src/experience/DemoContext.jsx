import { useState, useCallback, useRef } from "react";
import { DemoContext } from "./context";
import {
  initialRooms,
  initialBuildings,
  initialTenants,
  initialServices,
  initialContracts,
  initialInvoices,
  initialPayments,
} from "./data";

const seeds = {
  rooms: initialRooms,
  buildings: initialBuildings,
  tenants: initialTenants,
  services: initialServices,
  contracts: initialContracts,
  invoices: initialInvoices,
  payments: initialPayments,
};
const initial = { ...seeds, saved: [], requests: [], user: null };
function readDemo() {
  try {
    const stored = JSON.parse(localStorage.getItem("phong-minh-demo-v1"));
    return stored ? { ...initial, ...stored } : initial;
  } catch {
    return initial;
  }
}
export function DemoProvider({ children }) {
  const [data, setData] = useState(readDemo);
  const dataRef = useRef(data);
  const [notice, setNotice] = useState("");
  const [storageWarning, setStorageWarning] = useState(false);
  const notify = useCallback((message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 4600);
  }, []);
  const update = useCallback((fn) => {
    const next =
      typeof fn === "function"
        ? fn(dataRef.current)
        : { ...dataRef.current, ...fn };
    dataRef.current = next;
    setData(next);
    try {
      localStorage.setItem("phong-minh-demo-v1", JSON.stringify(next));
    } catch {
      setStorageWarning(true);
    }
  }, []);
  function toggleSaved(id) {
    update((previous) => ({
      ...previous,
      saved: previous.saved.includes(id)
        ? previous.saved.filter((x) => x !== id)
        : [...previous.saved, id],
    }));
  }
  return (
    <DemoContext.Provider value={{ ...data, update, notify, toggleSaved }}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {notice && (
          <div className="toast">
            {notice}
            <button aria-label="Đóng thông báo" onClick={() => setNotice("")}>
              ×
            </button>
          </div>
        )}
      </div>
      {storageWarning && (
        <div className="storage-warning" role="status">
          Trình duyệt chưa cho phép lưu. Thay đổi được giữ đến khi tải lại
          trang.
          <button onClick={() => setStorageWarning(false)} aria-label="Đóng">
            ×
          </button>
        </div>
      )}
    </DemoContext.Provider>
  );
}
