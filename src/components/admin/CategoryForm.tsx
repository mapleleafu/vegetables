"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function CategoryForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [costCoins, setCostCoins] = useState(0);
  const [maxCoinsPerUser, setMaxCoinsPerUser] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function autoSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const finalSlug = slug || autoSlug(name);

    try {
      await api.categories.create({
        name,
        slug: finalSlug,
        costCoins,
        maxCoinsPerUser,
      });

      toast.success("Category created");
      setName("");
      setSlug("");
      setCostCoins(0);
      setMaxCoinsPerUser(0);
    } catch (err: any) {
      setError(err.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-neutral-700 p-4 mt-4">
      <h2 className="font-semibold text-sm">Create new category</h2>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-green-400">{success}</p>}

      <div className="space-y-1">
        <label className="text-xs">Name</label>
        <input
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs">Slug (optional)</label>
        <input
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          value={slug}
          onChange={e => setSlug(e.target.value)}
          placeholder="auto from name if empty"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs">Cost coins</label>
        <input
          type="number"
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          value={costCoins}
          onChange={e => setCostCoins(Number(e.target.value))}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs">Max coins per user</label>
        <input
          type="number"
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          value={maxCoinsPerUser}
          onChange={e => setMaxCoinsPerUser(Number(e.target.value))}
        />
      </div>

      <button type="submit" disabled={loading} className="w-full rounded bg-green-700 py-2 text-sm font-medium disabled:opacity-60">
        {loading ? "Saving..." : "Create category"}
      </button>
    </form>
  );
}
