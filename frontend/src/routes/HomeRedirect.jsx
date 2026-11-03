import { Navigate } from "react-router-dom";
import useAccount from "../hooks/useAccount";
import { signedInDestination } from "../utils/managementNavigation";
export default function HomeRedirect() {
  const account = useAccount();
  if (account.isPending) return <p className="p-6">Đang kiểm tra đăng nhập...</p>;
  if (account.isError) return <div className="p-6"><p>Không thể kiểm tra phiên đăng nhập.</p>
    <button onClick={() => account.refetch()}>Thử lại</button></div>;
  return <Navigate to={signedInDestination(account.data)} replace />;
}
