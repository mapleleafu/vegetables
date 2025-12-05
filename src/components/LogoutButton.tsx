"use client";

import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Failed to log out.");
    }
  };

  return (
    <Button onClick={handleLogout} className="flex-1 cursor-pointer">
      Logout
    </Button>
  );
}
