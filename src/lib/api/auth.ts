import { sendRequest } from "./client";
import { User } from "@prisma/client";

type RegisterInput = {
  username: string;
  password?: string;
};

export const authApi = {
  register: (data: RegisterInput) =>
    sendRequest<User>("/api/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};