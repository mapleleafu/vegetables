"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result && !result.ok) {
      setError("Invalid credentials");
      return;
    }

    router.push("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
        <h1 className="text-lg font-semibold text-center">Login</h1>
        {error && <p className="text-sm text-red-400">{error}</p>}
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
          <input
            className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="w-full cursor-pointer rounded bg-green-700 py-2 text-sm font-medium">
          Continue
        </button>
      </form>
    </main>
  );
}
