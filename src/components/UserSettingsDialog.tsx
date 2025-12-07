"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { User } from "@prisma/client";
import { LANGUAGE_NAMES } from "@/types/word";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "@/components/LogoutButton";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface UserSettingsDialogProps {
  children: React.ReactNode;
  user: User;
}

export function UserSettingsDialog({
  children,
  user,
}: UserSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [targetLanguage, setTargetLanguage] = useState<string>(
    user.targetLanguage || "TR",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("targetLanguage", targetLanguage);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.user.updateProfile(formData);

      toast.success("Profile updated successfully");
      router.refresh();
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    setIsLoading(true);
    try {
      await api.user.updatePassword({ currentPassword, newPassword });

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="flex flex-col gap-4 py-2">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="border-border h-24 w-24 border-2">
                  <AvatarImage
                    src={previewUrl || user?.imageUrl || ""}
                    alt={user?.username || "User"}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-lg">
                    {user?.username?.[0]?.toUpperCase() || <UserIcon />}
                  </AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="picture"
                  className="bg-primary text-primary-foreground absolute right-0 bottom-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-90"
                >
                  <Camera size={16} />
                </Label>
                <Input
                  id="picture"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <Separator />

            <div className="flex w-full flex-row items-center justify-between px-2">
              <Label htmlFor="language" className="text-sm font-medium">
                Target Language
              </Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger id="language" className="w-[180px]">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex w-full items-center justify-between pt-2">
              <LogoutButton />
              <Button onClick={handleProfileUpdate} disabled={isLoading}>
                {isLoading && <Spinner />}
                Save Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  className="pr-10"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCurrentPassword((s) => !s)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-0"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  className="pr-10"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNewPassword((s) => !s)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-0"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  className="pr-10"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-0"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="default"
                onClick={handlePasswordUpdate}
                disabled={isLoading}
              >
                {isLoading && <Spinner />}
                Update Password
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
