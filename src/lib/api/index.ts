import { categoriesApi } from "./categories";
import { authApi } from "./auth";
import { wordsApi } from "./words";

export const api = {
  categories: categoriesApi,
  auth: authApi,
  words: wordsApi
};
