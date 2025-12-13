"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      await api.auth.register({ username, password });
      router.push("/login");
      toast.success("Registered successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to register");
    }
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
        <Card className="border-neutral-700 bg-neutral-900">
          <CardHeader>
            <CardTitle className="w-full text-center text-lg">
              Register
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 px-6">
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                className="w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  className="pr-10"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-0"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 px-6">
            <Button type="submit" className="w-full">
              Create account
            </Button>
            <Button
              type="button"
              onClick={handleLogin}
              variant="secondary"
              className="w-full"
            >
              Already have an account
            </Button>
          </CardFooter>
        </Card>
      </form>
    </main>
  );
}
