import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api/authApi";

export default function useAccount() {
  return useQuery({ queryKey: ["auth", "me"], queryFn: getMe,
    retry: false, staleTime: 0 });
}
