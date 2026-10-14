import { QueryClient } from "@tanstack/react-query";
export default new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) => count < 1 && ![400, 401, 403, 404, 409].includes(error.response?.status),
      staleTime: 15000,
      refetchOnWindowFocus: true,
    },
    mutations: { retry: false },
  },
});
