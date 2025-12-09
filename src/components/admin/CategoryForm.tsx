"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Category } from "@prisma/client";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { createCategorySchema } from "@/lib/validations/categories";
import { GAME_CONFIG } from "@/lib/constants";

type FormValues = z.infer<typeof createCategorySchema>;

interface CategoryFormProps {
  initialData?: Category | null;
  onSuccess?: () => void;
}

export function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      costCoins: initialData?.costCoins ?? GAME_CONFIG.DEFAULT_CATEGORY_COST,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        slug: initialData.slug,
        costCoins: initialData.costCoins,
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        costCoins: GAME_CONFIG.DEFAULT_CATEGORY_COST,
      });
    }
  }, [initialData, form]);

  function autoSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const finalSlug = values.slug || autoSlug(values.name);

    try {
      const payload = {
        ...values,
        slug: finalSlug,
      };

      if (isEditing && initialData) {
        await api.categories.update(initialData.id, payload);
        toast.success("Category updated successfully");
      } else {
        await api.categories.create(payload);
        toast.success("Category created successfully");
        form.reset();
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-none shadow-none">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    Leave empty to auto-generate from name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="costCoins"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost (Coins)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value as number | undefined}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {loading && <Spinner />}
                {isEditing ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
