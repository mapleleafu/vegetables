"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { Category } from "@prisma/client";

interface CategoryDialogProps {
  children: React.ReactNode;
  category?: Category;
}

export function CategoryDialog({ children, category }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Create New Category"}
          </DialogTitle>
        </DialogHeader>

        <CategoryForm
          initialData={category}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
