"use client";

import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

interface LogoutButtonProps extends ButtonProps {
  iconOnly?: boolean;
}

export function LogoutButton({
  className,
  variant = "ghost",
  iconOnly = false,
  ...props
}: LogoutButtonProps) {
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Failed to log out.");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      className={cn(
        "text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
        className,
      )}
      {...props}
    >
      <LogOut className={cn("h-4 w-4", !iconOnly && "mr-2")} />
      {!iconOnly && "Log out"}
    </Button>
  );
}
