import { sendRequest } from "./client";
import { Word } from "@prisma/client";

type CreateWordInput = {
  categoryId: string;
  name: string;
  slug: string;
  coinValue: number;
  maxCoinsPerUser: number;
};

export const wordsApi = {
  create: (data: CreateWordInput) =>
    sendRequest<Word>("/api/words", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
