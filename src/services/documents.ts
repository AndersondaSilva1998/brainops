import { api } from "./api";
export const documentsService = {
  list: () => api.get("/documents"),
  upload: (formData: FormData) =>
    fetch(`${api.baseUrl}/documents/upload`, { method: "POST", body: formData }).then((r) => r.json()),
  remove: (id: string) => api.post(`/documents/${id}/delete`, {}),
};
