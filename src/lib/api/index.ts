import { categoriesApi } from "@/lib/api/categories";
import { authApi } from "@/lib/api/auth";
import { wordsApi } from "@/lib/api/words";
import { userApi } from "@/lib/api/user";

export const api = {
  categories: categoriesApi,
  auth: authApi,
  words: wordsApi,
  user: userApi
};
