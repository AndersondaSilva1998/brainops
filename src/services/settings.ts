import { api } from "./api";
export const settingsService = {
  get: () => api.get("/settings"),
  update: (patch: Record<string, unknown>) => api.post("/settings", patch),
};
