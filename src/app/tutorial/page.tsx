import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Tutorial } from "@/components/Tutorial";
import { LanguageCode, DEFAULT_LANGUAGE_CODE } from "@/types/language";

export default async function TutorialPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { targetLanguage: true },
  });

  const helloWord = await prisma.word.findUnique({
    where: { name: "hello" },
    select: { translations: true, image: true },
  });

  const targetLanguage =
    (user?.targetLanguage as LanguageCode) || DEFAULT_LANGUAGE_CODE;

  return (
    <Tutorial
      targetLanguage={targetLanguage}
      helloWord={helloWord ?? undefined}
    />
  );
}
