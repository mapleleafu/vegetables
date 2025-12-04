"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { uploadImage } from "@/lib/storage";
import { toast } from "sonner";
import { Category, Word } from "@prisma/client";
import { Loader2, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent} from "@/components/ui/card";
import { createWordSchema } from "@/lib/validations/words";

const formSchema = createWordSchema.extend({
  slug: z.string().optional(),
  categoryId: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface WordsFormProps {
  initialData?: (Word & { translations?: any[] }) | null;
  onSuccess?: () => void;
}

export function WordsForm({ initialData, onSuccess }: WordsFormProps) {
  const isEditing = !!initialData;
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || "");
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || undefined,
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      imageUrl: initialData?.imageUrl || "",
      coinValue: initialData?.coinValue ?? 1,
      maxCoinsPerUser: initialData?.maxCoinsPerUser ?? 1,
      isActive: initialData?.isActive ?? true,
      translations: initialData?.translations || [],
    },
  });

  useEffect(() => {
    api.categories
      .getAll()
      .then(setCategories)
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  useEffect(() => {
    if (initialData) {
      form.reset({
        categoryId: initialData.categoryId || null,
        name: initialData.name,
        slug: initialData.slug,
        imageUrl: initialData.imageUrl || "",
        coinValue: initialData.coinValue,
        maxCoinsPerUser: initialData.maxCoinsPerUser,
        isActive: initialData.isActive,
        translations: initialData.translations || [],
      });
      setPreviewUrl(initialData.imageUrl || "");
      setImageFile(null);
    }
  }, [initialData, form]);

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

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const finalSlug = values.slug || autoSlug(values.name);

    try {
      let finalImageUrl = previewUrl;

      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, finalSlug);
      }

      const payload = {
        ...values,
        slug: finalSlug,
        imageUrl: finalImageUrl || null,
        coinValue: Number(values.coinValue),
        maxCoinsPerUser: Number(values.maxCoinsPerUser),
      };

      if (isEditing && initialData) {
        await api.words.update(initialData.id, payload);
        toast.success("Word updated successfully");
      } else {
        await api.words.create(payload);
        toast.success("Word created successfully");
        form.reset();
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
    <Card className="mt-4">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={field.value || "null"}
                    onValueChange={(val) =>
                      field.onChange(val === "null" ? null : val)
                    }
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem
                        value="null"
                        className="text-muted-foreground font-bold italic"
                      >
                        — No Category —
                      </SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 items-baseline gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder={
                          form.watch("name")
                            ? autoSlug(form.watch("name"))
                            : "auto-generated"
                        }
                      />
                    </FormControl>
                    <FormDescription className="text-muted-foreground text-xs">
                      Leave empty to auto-generate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Image</FormLabel>
              <div className="border-input bg-accent/20 flex items-start gap-4 rounded-md border p-3">
                {previewUrl ? (
                  <div className="border-border relative h-20 w-20 shrink-0 overflow-hidden rounded-md border">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setPreviewUrl("");
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 absolute top-0 right-0 p-1 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="border-muted-foreground/50 bg-muted/50 flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-dashed">
                    <ImagePlus className="text-muted-foreground h-8 w-8" />
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="file:text-foreground cursor-pointer"
                  />
                  <p className="text-muted-foreground text-xs">
                    Max size 5MB. Uploads are processed automatically on save.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 items-end gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="coinValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxCoinsPerUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Coins</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="bg-card flex flex-row items-center justify-between rounded-lg border p-2 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-2">
              {isEditing && onSuccess && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSuccess}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Word" : "Create Word"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
