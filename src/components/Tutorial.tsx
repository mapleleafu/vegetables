import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function Tutorial() {
  return (
    <div className="flex h-full flex-col gap-2">
      <Button asChild variant="ghost" className="justify-start px-2">
        <Link href="/tutorial">
          <Shield className="mr-2 h-4 w-4" />
          Start Tutorial
        </Link>
      </Button>
    </div>
  );
}