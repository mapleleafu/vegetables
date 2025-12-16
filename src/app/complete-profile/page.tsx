"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { authRegex, registerSchema } from "@/lib/validations/auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CompleteProfilePage() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { update } = useSession();
  const router = useRouter();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(authRegex.username, "");
    setUsername(sanitized);
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validation = registerSchema.shape.username.safeParse(username);

    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    setIsLoading(true);

    try {
      await api.user.completeProfile(validation.data);
      await update({ username: validation.data });

      toast.success("Profile completed!");
      setIsLoading(false);
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
        <Card className="border-neutral-700 bg-neutral-900">
          <CardHeader>
            <CardTitle className="w-full text-center text-lg">
              One Last Step
            </CardTitle>
            <CardDescription className="text-center">
              Please choose a unique username to continue. This cannot be
              changed later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6">
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                className="w-full"
                placeholder="e.g. johndoe"
                value={username}
                onChange={handleUsernameChange}
                autoComplete="off"
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="px-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Register
            </Button>
          </CardFooter>
        </Card>
      </form>
    </main>
  );
}
