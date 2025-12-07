import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import MenuActions from "@/components/MenuActions";

export function MenuButton() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="border-input hover:bg-accent hover:text-accent-foreground ml-auto cursor-pointer rounded-md border p-2 transition-colors">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader className="mb-4 border-b pb-4 text-left">
          <SheetTitle>Vegetables</SheetTitle>
        </SheetHeader>

        <MenuActions />
      </SheetContent>
    </Sheet>
  );
}
