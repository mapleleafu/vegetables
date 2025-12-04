import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AuthActions from "@/components/MenuAuthActions";
import { ThemeToggle } from "./ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { Shield, Home, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";

export default async function MenuActions() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex flex-col gap-1">
        <Button asChild variant="ghost" className="justify-start px-2">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
        <Button asChild variant="ghost" className="justify-start px-2">
          <Link href="/admin/categories">
            <BookOpen className="mr-2 h-4 w-4" />
            Categories
          </Link>
        </Button>
      </div>

      <Separator className="my-2" />

      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground px-2 mb-2 font-medium uppercase">Settings</p>
        <ThemeToggle />
      </div>

      {isAdmin && (
        <>
          <Separator className="my-2" />
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground px-2 mb-2 font-medium uppercase">Admin</p>
            <Button asChild variant="ghost" className="justify-start px-2 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20">
              <Link href="/admin">
                <Shield className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Link>
            </Button>
          </div>
        </>
      )}

      <div className="mt-auto pt-4 border-t">
        {session?.user && (
          <div className="flex flex-row items-center justify-between px-2 mb-4">
            <p className="text-md font-medium">{session.user.username || "User"}</p>
            {session.user.image ? (
              <Image src={session.user.image} alt="User Avatar" width={40} height={40} className="rounded-full" />
            ) : (
              <ImageIcon className="rounded-full" size={32} />
            )}
          </div>
        )}
        <AuthActions />
      </div>
    </div>
  );
}
