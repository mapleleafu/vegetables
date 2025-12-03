"use client";

import { FormEvent, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Category, Word } from "@prisma/client";
import { Switch } from "@/components/ui/switch";
import { uploadImage } from "@/lib/storage";

interface WordsFormProps {
  initialData?: Word | null;
  onSuccess?: () => void;
}

export function WordsForm({ initialData, onSuccess }: WordsFormProps) {
  const isEditing = !!initialData;

  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [coinValue, setCoinValue] = useState(initialData?.coinValue ?? 1);
  const [maxCoinsPerUser, setMaxCoinsPerUser] = useState(initialData?.maxCoinsPerUser ?? 1);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || "");

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.categories
      .getAll()
      .then(setCategories)
      .catch(err => toast.error("Failed to load categories"));
  }, []);

  useEffect(() => {
    if (initialData) {
      setCategoryId(initialData.categoryId || "");
      setName(initialData.name);
      setSlug(initialData.slug);
      setCoinValue(initialData.coinValue);
      setMaxCoinsPerUser(initialData.maxCoinsPerUser);
      setIsActive(initialData.isActive);
      setPreviewUrl(initialData.imageUrl || "");
      setImageFile(null);
    }
  }, [initialData]);

  function autoSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Max file size 5MB");

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const finalSlug = slug || autoSlug(name);

    try {
      let finalImageUrl = previewUrl; // Default to existing URL or pasted URL

      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, finalSlug);
      }

      const payload = {
        categoryId,
        name,
        slug: finalSlug,
        coinValue,
        maxCoinsPerUser,
        isActive,
        imageUrl: finalImageUrl || null,
      };

      if (isEditing && initialData) {
        await api.words.update(initialData.id, payload);
        toast.success("Word updated");
      } else {
        await api.words.create(payload);
        toast.success("Word created");

        setName("");
        setSlug("");
        setPreviewUrl("");
        setImageFile(null);
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-700 p-4 mt-4 bg-neutral-900/50">
      <h2 className="font-semibold text-sm flex items-center gap-2">
        {isEditing ? "Edit Word" : "Create New Word"}
        {isEditing && <span className="text-xs font-normal text-neutral-500">({initialData.id})</span>}
      </h2>

      <div className="space-y-1">
        <label className="text-xs text-neutral-400">Category</label>
        <select
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}>
          <option value="">— No Category —</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs text-neutral-400">Name</label>
          <input
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-neutral-400">Slug</label>
          <input
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder={name ? autoSlug(name) : "auto"}
          />
        </div>
      </div>

      {/* Image Upload Block */}
      <div className="space-y-2">
        <label className="text-xs text-neutral-400">Image</label>
        <div className="flex gap-4 items-start">
          {previewUrl && (
            <div className="relative w-16 h-16 rounded overflow-hidden border border-neutral-700 shrink-0">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl("");
                }}
                className="absolute top-0 right-0 bg-black/60 text-white p-0.5 hover:bg-red-500">
                ✕
              </button>
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="text-xs text-neutral-400 file:mr-2 file:py-1 file:px-2 file:rounded file:bg-neutral-800 file:text-neutral-300"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 items-end">
        <div className="space-y-1">
          <label className="text-xs text-neutral-400">Value</label>
          <input
            type="number"
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-2 text-sm"
            value={coinValue}
            onChange={e => setCoinValue(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-neutral-400">Max</label>
          <input
            type="number"
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-2 text-sm"
            value={maxCoinsPerUser}
            onChange={e => setMaxCoinsPerUser(Number(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-2 pb-2">
          <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-green-600" />
          <label className="text-xs text-neutral-400">Active</label>
        </div>
      </div>

      <div className="flex gap-2">
        {isEditing && (
          <button type="button" onClick={() => onSuccess?.()} className="flex-1 rounded border border-neutral-700 py-2 text-sm hover:bg-neutral-800">
            Cancel
          </button>
        )}
        <button type="submit" disabled={loading} className="flex-1 rounded bg-green-700 py-2 text-sm font-medium disabled:opacity-50">
          {loading ? "Saving..." : isEditing ? "Update Word" : "Create Word"}
        </button>
      </div>
    </form>
  );
}
