import { NavLink } from "react-router-dom";
import { managementNavigation } from "../../utils/managementNavigation";
export default function Sidebar() {
  return <aside className="w-full shrink-0 bg-slate-900 text-white md:w-64">
    <div className="p-4 text-xl font-bold md:p-6">Quản Lý Phòng Trọ</div>
    <nav aria-label="Quản lý" className="flex gap-2 overflow-x-auto px-4 pb-3 md:block">
      {managementNavigation.map((item) => <NavLink key={item.path} to={item.path}
        className={({ isActive }) => "block shrink-0 rounded px-4 py-3 md:mb-2 " +
          (isActive ? "bg-blue-600" : "hover:bg-slate-800")}>{item.name}</NavLink>)}
    </nav>
  </aside>;
}
