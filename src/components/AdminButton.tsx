import Link from "next/link";

export function AdminButton() {
  return (
    <Link href="/admin" className="flex-1 rounded border border-neutral-700 py-2 text-center cursor-pointer">
      Admin Panel
    </Link>
  );
}
