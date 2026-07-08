import { api } from "./api";
export const analyticsService = {
  overview: () => api.get("/analytics/overview"),
  categories: () => api.get("/analytics/categories"),
  topDocuments: () => api.get("/analytics/top-documents"),
};
