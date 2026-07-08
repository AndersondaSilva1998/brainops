import { api } from "./api";
export const uploadsService = {
  list: () => api.get("/uploads"),
  status: (id: string) => api.get(`/uploads/${id}`),
};
