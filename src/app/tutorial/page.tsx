"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";
import { BadRequestError } from "@/lib/errors";

export default function TutorialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/tutorial", { method: "POST" });
      if (!res.ok) throw new BadRequestError();

      toast.success("You are ready to go!");
      router.refresh(); // Refresh to update the Layout check
      router.push("/");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-primary/10 mx-auto mb-4 w-fit rounded-full p-3">
            <ShieldCheck className="text-primary h-8 w-8" />
          </div>
          <CardTitle>Welcome to Vegetables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            This is where you would put your onboarding slides or video. (Since
            I haven't completed the page yet, click below to skip).
          </p>
          <Button
            className="w-full"
            onClick={handleComplete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Tutorial
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
