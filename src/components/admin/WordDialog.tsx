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
import { WordsForm } from "@/components/admin/WordsForm";
import { Word } from "@prisma/client";

interface WordDialogProps {
  children: React.ReactNode;
  word?: Word;
}

export function WordDialog({ children, word }: WordDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{word ? "Edit Word" : "Create New Word"}</DialogTitle>
        </DialogHeader>

        <WordsForm
          initialData={word}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
