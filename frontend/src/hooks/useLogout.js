import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/authApi";
import { setSessionAccount } from "../utils/sessionState";
export default function useLogout() {
  const client = useQueryClient(), navigate = useNavigate();
  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await setSessionAccount(client, null);
      navigate("/tai-khoan", { replace: true });
    },
  });
}
