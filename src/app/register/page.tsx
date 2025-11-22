"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Failed to register");
      return;
    }

    router.push("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
        <h1 className="text-lg font-semibold text-center">Register</h1>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="space-y-1">
          <label className="text-sm">Username</label>
          <input
            className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm"
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
        <button type="submit" className="w-full rounded bg-green-700 py-2 text-sm font-medium">
          Create account
        </button>
      </form>
    </main>
  );
}
