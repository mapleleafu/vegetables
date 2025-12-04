import MenuActions from "@/components/MenuActions";

export default async function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-4">
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-3">
        <MenuActions />
      </div>
    </main>
  );
}
