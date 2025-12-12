import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PUBLIC_ROUTES, IS_TUTORIAL_ON } from "@/lib/constants";
import { excalifont } from "@/lib/fonts";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gabs ❤️ Atakan",
  description: "Language training for my wife",
  icons: {
    icon: [
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const headersList = await headers();
  const pathname = headersList.get("x-url") || "";

  if (pathname) {
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!session?.user?.id && !isPublicRoute) {
      redirect("/login");
    }

    if (session?.user?.id && !isPublicRoute && IS_TUTORIAL_ON) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { hasCompletedTutorial: true },
      });

      if (user && !user.hasCompletedTutorial && pathname !== "/tutorial") {
        redirect("/tutorial");
      }

      if (user && user.hasCompletedTutorial && pathname === "/tutorial") {
        redirect("/");
      }
    } else if (!IS_TUTORIAL_ON) {
      if (pathname === "/tutorial") {
        redirect("/");
      }
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${excalifont.variable} bg-background text-foreground antialiased`}
      >
        {/* Background image */}
        <div className="fixed inset-0 z-[-1] bg-[url('/static/carrots.png')] bg-contain bg-repeat blur-[2.5px]" />

        {/* Blur the edges */}
        <div className="pointer-events-none fixed inset-0 z-50 border-8 border-black blur-xl" />

        {/* //TODO: add the font selection option!!! */}
        <div className="font-excali relative z-10 min-h-screen">
          <TooltipProvider>
            <Providers>
              {children}
              <Toaster />
            </Providers>
          </TooltipProvider>
        </div>
      </body>
    </html>
  );
}
