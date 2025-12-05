import MenuActions from "@/components/MenuActions";
import { Card, CardContent } from "@/components/ui/card";

export default async function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-4">
      <Card>
        <CardContent>
          <MenuActions />
        </CardContent>
      </Card>
    </main>
  );
}
