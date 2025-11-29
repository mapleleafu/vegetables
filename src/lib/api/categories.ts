import { sendRequest } from "./client";
import { Category } from "@prisma/client";

export const categoriesApi = {
  getAll: () => sendRequest<Category[]>("/api/categories"),

  create: (data: { name: string; slug: string; costCoins: number; maxCoinsPerUser: number }) =>
    sendRequest<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    sendRequest(`/api/categories/${id}`, {
      method: "DELETE",
    }),
};
