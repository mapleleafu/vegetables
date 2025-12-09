import AuthActions from "@/components/MenuAuthActions";
import { ThemeToggle } from "./ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { Shield, Home, BookOpen, UserIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserSettingsDialog } from "@/components/UserSettingsDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MenuActions() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return redirect("/login");
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Button asChild variant="ghost" className="justify-start px-2">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
        <Button asChild variant="ghost" className="justify-start px-2">
          <Link href="/categories">
            <BookOpen className="mr-2 h-4 w-4" />
            Categories
          </Link>
        </Button>
        <Button asChild variant="ghost" className="justify-start px-2">
          <Link href="/">
            <BookOpen className="mr-2 h-4 w-4" />
            Focus Practice
          </Link>
        </Button>
        <Button asChild variant="ghost" className="justify-start px-2">
          <Link href="/">
            <BookOpen className="mr-2 h-4 w-4" />
            Grammar Notes
          </Link>
        </Button>
        <Button asChild variant="ghost" className="justify-start px-2">
          <Link href="/">
            <BookOpen className="mr-2 h-4 w-4" />
            Associations
          </Link>
        </Button>
        <Button asChild variant="ghost" className="justify-start px-2">
          <Link href="/">
            <BookOpen className="mr-2 h-4 w-4" />
            Library
          </Link>
        </Button>
        <Button asChild variant="ghost" className="justify-start px-2">
          <Link href="/">
            <BookOpen className="mr-2 h-4 w-4" />
            Favorites
          </Link>
        </Button>
        <Button asChild variant="ghost" className="justify-start px-2">
          <Link href="/">
            <BookOpen className="mr-2 h-4 w-4" />
            Notes
          </Link>
        </Button>
        <Button
          variant="outline"
          className="mt-2 mr-5 ml-5 flex-1 cursor-pointer"
        >
          Quick Test
        </Button>
      </div>

      <Separator className="my-2" />

      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground mb-2 px-2 text-xs font-medium uppercase">
          Settings
        </p>
        <ThemeToggle />
      </div>

      {isAdmin && (
        <>
          <Separator className="my-2" />
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground mb-2 px-2 text-xs font-medium uppercase">
              Admin
            </p>
            <Button
              asChild
              variant="ghost"
              className="justify-start px-2 text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
            >
              <Link href="/admin">
                <Shield className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Link>
            </Button>
          </div>
        </>
      )}

      <div className="mt-auto border-t pt-4">
        <UserSettingsDialog user={user}>
          <div className="hover:bg-accent hover:text-accent-foreground mb-4 flex cursor-pointer flex-row items-center justify-between rounded-md px-2 py-2 transition-colors">
            <p className="text-md font-medium">{user.username || "User"}</p>
            <Avatar className="border-border h-10 w-10 border-2">
              <AvatarImage
                src={user?.imageUrl || ""}
                alt={user?.username || "User"}
              />
              <AvatarFallback className="text-lg">
                {user?.username?.[0]?.toUpperCase() || <UserIcon />}
              </AvatarFallback>
            </Avatar>
          </div>
        </UserSettingsDialog>
        <AuthActions />
      </div>
    </div>
  );
}
