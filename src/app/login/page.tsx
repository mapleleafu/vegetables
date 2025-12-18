"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
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

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result && !result.ok) {
      toast.error("Invalid credentials");
      setLoading(false);
      return;
    }

    toast.success("Logged in successfully!");
    window.location.href = "/";
  }

  const handleRegister = (event: React.FormEvent) => {
    event.preventDefault();
    router.push("/register");
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="relative w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="w-full text-center text-2xl">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center text-balance">
              Login to your Vegetables account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  className="w-full"
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  disabled={loading}
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
                    disabled={loading}
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

              <Button type="submit" className="w-full" disabled={loading}>
                Continue
              </Button>
            </form>

            <OAuth />
          </CardContent>
          <CardFooter className="flex flex-col gap-2 px-6">
            <CardDescription className="px-6 text-center">
              Don't have an account?{" "}
              <span
                className="cursor-pointer underline"
                onClick={handleRegister}
              >
                Sign up
              </span>
            </CardDescription>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
