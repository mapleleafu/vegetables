import { PasswordChangeData } from "@/lib/validations/user";
import { RegisterInput } from "@/lib/validations/auth";
import { sendRequest } from "@/lib/api/client";
import { User, Word } from "@prisma/client";

export const userApi = {
  profile: () =>
    sendRequest<User>("/api/user", {
      method: "GET",
    }),

  updateProfile: (formData: FormData) =>
    sendRequest<User>("/api/user", {
      method: "PUT",
      body: formData,
    }),

  updatePassword: (data: PasswordChangeData) =>
    sendRequest<{ success: boolean }>("/api/user/password", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  completeTutorial: () =>
    sendRequest<{ success: boolean }>("/api/user/tutorial", {
      method: "POST",
    }),

  completeProfile: (username: RegisterInput["username"]) =>
    sendRequest<{ success: boolean }>("/api/user/complete-profile", {
      method: "POST",
      body: JSON.stringify({ username }),
    }),

  setBackgroundWord: (wordId: string | null) =>
    sendRequest<{ success: boolean }>("/api/user/background/word", {
      method: "PUT",
      body: JSON.stringify({ wordId }),
    }),

  setBackgroundGradient: (gradient: string) =>
    sendRequest<{ success: boolean }>("/api/user/background/gradient", {
      method: "PUT",
      body: JSON.stringify({ gradient }),
    }),

  userWords: (page: number, pageSize: number) =>
    sendRequest<{ words: Word[]; hasMore: boolean }>(
      `/api/user/words?page=${page}&limit=${pageSize}`,
      {
        method: "GET",
      },
    ),
};
