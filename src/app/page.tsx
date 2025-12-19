import { Suspense } from "react";
import MenuActions from "@/components/MenuActions";
import { Card, CardContent } from "@/components/ui/card";
import { MenuActionsSkeleton } from "@/components/skeletons/MenuActionsSkeleton";

export default async function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-4">
      <Card>
        <CardContent>
          <Suspense fallback={<MenuActionsSkeleton />}>
            <MenuActions />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
