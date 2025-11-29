"use client";

import { signOut } from "next-auth/react";
import { toast } from "sonner";

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
    <button type="button" onClick={handleLogout} className="flex-1 rounded border border-neutral-700 py-2 text-center cursor-pointer">
      Logout
    </button>
  );
}
