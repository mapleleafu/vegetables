import { Navigation } from "@/components/Navigation";
import NumberPractice from "@/components/NumberPractice";

export default function NumberPracticePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col p-4">
      <Navigation items={[{ label: "Number Practice" }]} />

      <div className="flex w-full flex-1 flex-col justify-center">
        <NumberPractice />
      </div>
    </main>
  );
}
