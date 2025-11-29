"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result && !result.ok) {
      toast.error("Invalid credentials");
      return;
    }

    toast.success("Logged in successfully!");

    router.push("/");
  }

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    router.push("/register");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="relative w-full max-w-sm space-y-4 rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
        <Link href="/" className="absolute left-4 top-4 text-neutral-400 hover:text-neutral-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-semibold text-center">Login</h1>
        <div className="space-y-1">
          <label className="text-sm">Username</label>
          <input
            className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <div className="relative">
            <input
              className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm pr-10"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" className="w-full cursor-pointer rounded bg-green-700 py-2 text-sm font-medium">
          Continue
        </button>
        <button type="button" onClick={handleRegister} className="w-full cursor-pointer rounded bg-blue-700 py-2 text-sm font-medium">
          Register
        </button>
      </form>
    </main>
  );
}
