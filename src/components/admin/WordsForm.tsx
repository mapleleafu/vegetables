"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Category } from "@prisma/client";

interface WordsFormProps {
  categories?: Category[];
}

export function WordsForm({ categories = [] }: WordsFormProps) {
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [coinValue, setCoinValue] = useState(1);
  const [maxCoinsPerUser, setMaxCoinsPerUser] = useState(1);
  const [loading, setLoading] = useState(false);

  function autoSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const finalSlug = slug || autoSlug(name);

    try {
      if (!categoryId) throw new Error("Please select a category");

      await api.words.create({
        categoryId,
        name,
        slug: finalSlug,
        coinValue,
        maxCoinsPerUser,
      });

      toast.success("Word created");
      setName("");
      setSlug("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create word");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-neutral-700 p-4 mt-4">
      <h2 className="font-semibold text-sm">Create new word</h2>

      <div className="space-y-1">
        <label className="text-xs">Category</label>
        <select
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}>
          <option value="">— No initial category —</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

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
          placeholder={name ? autoSlug(name) : "auto-generated"}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs">Coin Value</label>
          <input
            type="number"
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
            value={coinValue}
            onChange={e => setCoinValue(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs">Max Coins</label>
          <input
            type="number"
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
            value={maxCoinsPerUser}
            onChange={e => setMaxCoinsPerUser(Number(e.target.value))}
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full rounded bg-green-700 py-2 text-sm font-medium disabled:opacity-60">
        {loading ? "Saving..." : "Create Word"}
      </button>
    </form>
  );
}
