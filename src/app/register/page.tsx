"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  CardDescription,
} from "@/components/ui/card";
import OAuth from "@/components/OAuth";
import { authRegex } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(authRegex.username, "");
    setUsername(sanitized);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(authRegex.password, "");
    setPassword(sanitized);
  };

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
        <Card>
          <CardHeader>
            <CardTitle className="w-full text-center text-2xl">
              Create your account
            </CardTitle>
            <CardDescription className="w-full text-center text-sm">
              Fill in the form below to create your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-6">
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                className="w-full"
                value={username}
                onChange={handleUsernameChange}
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
                  onChange={handlePasswordChange}
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

            <Button type="submit" className="w-full">
              Create account
            </Button>

            <OAuth />
          </CardContent>
          <CardFooter className="flex flex-col gap-2 px-6">
            <CardDescription className="px-6 text-center">
              Already have an account?{" "}
              <span className="cursor-pointer underline" onClick={handleLogin}>
                Sign in
              </span>
            </CardDescription>
          </CardFooter>
        </Card>
      </form>
    </main>
  );
}
