"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button 
      type="button" 
      onClick={() => signOut()} 
      className="flex-1 rounded border border-neutral-700 py-2 text-center cursor-pointer"
    >
      Logout
    </button>
  );
}
