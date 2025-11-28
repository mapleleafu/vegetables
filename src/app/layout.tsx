import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Gabs ❤️ Atakan",
  description: "Language training for my wife",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const children = props.children;

  return (
    <html lang="en">
      <body className="bg-neutral-900 text-neutral-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
