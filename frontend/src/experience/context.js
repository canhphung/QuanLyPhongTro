import { createContext, useContext } from "react";
export const AppDataContext = createContext(null);
export function useAppData() {
  return useContext(AppDataContext);
}
