import { sendRequest } from "./client";
import { Category } from "@prisma/client";

type CreateCategoryInput = {
  name: string;
  slug: string;
  costCoins: number;
  maxCoinsPerUser: number;
};

export const categoriesApi = {
  getAll: () => sendRequest<Category[]>("/api/categories"),

  create: (data: CreateCategoryInput) =>
    sendRequest<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    sendRequest(`/api/categories/${id}`, {
      method: "DELETE",
    }),

  update: (id: string, data: CreateCategoryInput) =>
    sendRequest<Category>(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
