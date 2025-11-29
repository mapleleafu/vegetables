import AuthActions from "@/components/MenuAuthActions";
import { AdminButton } from "./AdminButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  let isAdmin = false;

  if (session?.user) {
    const userId = (session.user as any).id as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    isAdmin = user?.role === "ADMIN";
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <AuthActions />
        {isAdmin && <AdminButton />}
      </div>
    </>
  );
}
