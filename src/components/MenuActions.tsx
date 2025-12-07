import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AuthActions from "@/components/MenuAuthActions";
import { ThemeToggle } from "./ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { Shield, Home, BookOpen, UserIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { UserSettingsDialog } from "@/components/UserSettingsDialog";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function MenuActions() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  let userData = null;
  if (session?.user?.id) {
    userData = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
  }

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
        {session?.user && userData && (
          <UserSettingsDialog user={userData}>
            <div className="hover:bg-accent hover:text-accent-foreground mb-4 flex cursor-pointer flex-row items-center justify-between rounded-md px-2 py-2 transition-colors">
              <p className="text-md font-medium">
                {userData.username || "User"}
              </p>
              <Avatar className="border-border h-10 w-10 border-2">
                <AvatarImage
                  src={userData?.imageUrl || ""}
                  alt={userData?.username || "User"}
                />
                <AvatarFallback className="text-lg">
                  {userData?.username?.[0]?.toUpperCase() || <UserIcon />}
                </AvatarFallback>
              </Avatar>
            </div>
          </UserSettingsDialog>
        )}
        <AuthActions />
      </div>
    </div>
  );
}
