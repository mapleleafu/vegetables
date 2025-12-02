import { sendRequest } from "./client";
import { Word } from "@prisma/client";

type CreateWordInput = {
  categoryId?: string | null;
  name: string;
  slug: string;
  coinValue: number;
  maxCoinsPerUser: number;
  isActive: boolean;
  imageUrl?: string | null;
};

export const wordsApi = {
  create: (data: CreateWordInput) =>
    sendRequest<Word>("/api/words", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
