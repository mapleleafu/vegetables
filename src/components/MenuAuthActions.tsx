import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AuthActions() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="flex gap-3">
        <Link href="/login" className="flex-1 rounded border border-neutral-700 py-2 text-center">
          Login
        </Link>
        <Link href="/register" className="flex-1 rounded border border-neutral-700 py-2 text-center">
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <LogoutButton />
    </div>
  );
}
