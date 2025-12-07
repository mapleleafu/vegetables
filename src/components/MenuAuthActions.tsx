import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

export default async function AuthActions() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Link>
        </Button>
        <Button asChild className="w-full">
          <Link href="/register">
            <UserPlus className="mr-2 h-4 w-4" />
            Register
          </Link>
        </Button>
      </div>
    );
  }
}
