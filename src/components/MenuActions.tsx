import AuthActions from "@/components/MenuAuthActions";
import { AdminButton } from "./AdminButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const isUserAdmin = user.role !== "ADMIN" as 

  return (
    <>
      <AuthActions />
      <AdminButton />
    </>
  );
}
