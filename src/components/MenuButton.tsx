import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import MenuActions from "@/components/MenuActions";

export function MenuButton() {
  return (
    <header className="flex justify-between items-center mb-6">
      <Sheet>
        <SheetTrigger asChild>
          <button className="ml-auto p-2 rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </button>
        </SheetTrigger>

        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader className="text-left border-b pb-4 mb-4">
            <SheetTitle>Vegetables</SheetTitle>
          </SheetHeader>

          <MenuActions />
        </SheetContent>
      </Sheet>
    </header>
  );
}
