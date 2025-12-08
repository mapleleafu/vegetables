"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { uploadFile } from "@/lib/storage";
import { toast } from "sonner";
import { Category, Word } from "@prisma/client";
import { X, ImagePlus, Plus, Trash } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
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
import { Card, CardContent } from "@/components/ui/card";
import { createWordSchema } from "@/lib/validations/words";
import { AudioRecorder } from "@/components/ui/audio-recorder";
import { LANGUAGE_CODES, LANGUAGE_NAMES } from "@/types/word";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GAME_CONFIG } from "@/lib/constants";

const formSchema = createWordSchema.extend({
  slug: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  translations: z
    .array(
      z.object({
        languageCode: z.string().min(2),
        text: z.string().min(1),
        audioUrl: z.string().optional().nullable(),
      }),
    )
    .default([]),
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

  const [audioFiles, setAudioFiles] = useState<Record<number, File>>({});

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || undefined,
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      imageUrl: initialData?.imageUrl || "",
      coinValue: initialData?.coinValue ?? GAME_CONFIG.POINTS_PER_CORRECT_WORD,
      maxCoinsPerUser:
        initialData?.maxCoinsPerUser ?? GAME_CONFIG.DEFAULT_MAX_COINS_PER_WORD,
      isActive: initialData?.isActive ?? true,
      translations: initialData?.translations,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "translations",
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
        translations: initialData.translations?.length
          ? initialData.translations
          : [{ languageCode: "tr", text: "", audioUrl: "" }],
      });
      setPreviewUrl(initialData.imageUrl || "");
      setImageFile(null);
      setAudioFiles({});
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

  const handleAudioRecorded = (index: number, file: File) => {
    setAudioFiles((prev) => ({ ...prev, [index]: file }));
  };

  const handleAudioDeleted = (index: number) => {
    const newFiles = { ...audioFiles };
    delete newFiles[index];
    setAudioFiles(newFiles);
    form.setValue(`translations.${index}.audioUrl`, null);
  };

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const finalSlug = values.slug || autoSlug(values.name);

    try {
      let finalImageUrl = previewUrl;
      if (imageFile) {
        finalImageUrl = await uploadFile(
          imageFile,
          finalSlug,
          "images",
          "words",
        );
      }

      const processedTranslations = await Promise.all(
        values.translations.map(async (t, index) => {
          let audioUrl = t.audioUrl;
          if (audioFiles[index]) {
            audioUrl = await uploadFile(
              audioFiles[index],
              `${finalSlug}-${t.languageCode}`,
              "audios",
            );
          }
          return { ...t, audioUrl };
        }),
      );

      const payload = {
        ...values,
        slug: finalSlug,
        imageUrl: finalImageUrl || null,
        coinValue: Number(values.coinValue),
        maxCoinsPerUser: Number(values.maxCoinsPerUser),
        translations: processedTranslations,
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
        setAudioFiles({});
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
                        placeholder="auto-generated"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <FormLabel>Translations</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    append({ languageCode: "", text: "", audioUrl: "" })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="mb-3 flex flex-wrap items-end gap-2 border-b pb-3 last:mb-0 last:border-0 last:pb-0"
                >
                  <FormField
                    control={form.control}
                    name={`translations.${index}.languageCode`}
                    render={({ field }) => (
                      <FormItem className="w-25">
                        <FormLabel className="text-xs">Lang</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl className="w-full">
                            <SelectTrigger>
                              <SelectValue placeholder="Code" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LANGUAGE_CODES.map((code) => (
                              <SelectItem key={code} value={code}>
                                {LANGUAGE_NAMES[code]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`translations.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="min-w-[200px] flex-1">
                        <FormLabel className="text-xs">Translation</FormLabel>
                        <Input {...field} />
                      </FormItem>
                    )}
                  />

                  <AudioRecorder
                    initialUrl={form.getValues(
                      `translations.${index}.audioUrl`,
                    )}
                    onAudioRecorded={(file) => handleAudioRecorded(index, file)}
                    onAudioDeleted={() => handleAudioDeleted(index)}
                    wordName={form.watch("name")}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <FormLabel>Image</FormLabel>
              <div className="border-input bg-accent/20 flex items-center gap-4 rounded-md border p-3">
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
                      className="bg-destructive text-destructive-foreground absolute top-0 right-0 p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="border-muted-foreground/50 bg-muted/50 flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-dashed">
                    <ImagePlus className="text-muted-foreground h-8 w-8" />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 items-end gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="coinValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <Tooltip>
                      <TooltipTrigger>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Coin value for this word.</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxCoinsPerUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Coins</FormLabel>
                    <Tooltip>
                      <TooltipTrigger>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Maximum number of coins the user <br /> can earn for
                          this word.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="bg-card flex flex-row items-center justify-between rounded-lg border p-2 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
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
                {loading && <Spinner />}
                {isEditing ? "Update Word" : "Create Word"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
