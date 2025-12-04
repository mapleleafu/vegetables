"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  categoryId: string;
  categoryName?: string;
}

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      await api.categories.delete(categoryId);
      toast.success("Category deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertTriangle className="text-destructive mx-auto mb-2 h-8 w-8" />
          <AlertDialogTitle>Delete category</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{categoryName || "this category"}"?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
