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
import { Camera, User as UserIcon, Eye, EyeOff, Loader2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { LANGUAGE_NAMES } from "@/types/language";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "@/components/LogoutButton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { authRegex } from "@/lib/validations/auth";
import { SafeUser } from "@/lib/session";
import { UserBackgroundSelector } from "@/components/UserBackgroundSelector";
import { DynamicBackground } from "@/components/DynamicBackground";

interface UserSettingsDialogProps {
  children: React.ReactNode;
  user: SafeUser;
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
      if (imageFile) formData.append("image", imageFile);

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
      toast.error("Please fill in all fields");
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

  const sanitizedPassword = (value: string) =>
    value.replace(authRegex.password, "");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          {user.hasPassword && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="general" className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="border-background h-32 w-32 border-4 shadow-lg">
                  <AvatarImage
                    src={previewUrl || user?.image || ""}
                    alt={user?.username || "User"}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl">
                    {user?.username?.[0]?.toUpperCase() || <UserIcon />}
                  </AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="picture"
                  className="bg-primary text-primary-foreground absolute right-0 bottom-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full shadow-md hover:opacity-90"
                >
                  <Camera size={20} />
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
              <Label htmlFor="language" className="w-full text-sm font-medium">
                Target Language
              </Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger id="language" className="w-full">
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

            <div className="space-y-3">
              <Label className="text-sm font-medium">Background</Label>
              <p className="text-muted-foreground text-sm">
                Personalize your app with a word from your unlocked categories
              </p>

              <div className="border-muted-foreground/30 bg-muted/20 relative overflow-hidden rounded-xl border-2 border-dashed">
                <div className="relative aspect-video w-full">
                  <div className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 overflow-hidden">
                    <DynamicBackground
                      imageUrl={user?.backgroundWord?.image || undefined}
                      gradient={user?.backgroundGradient || undefined}
                      tileCount={15}
                      appyBlur={false}
                    />
                  </div>

                  <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/60 via-transparent to-transparent p-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-3 w-fit border border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                      asChild
                    >
                      <UserBackgroundSelector
                        currentWordId={user.backgroundWordId}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <LogoutButton />
              <Button onClick={handleProfileUpdate} disabled={isLoading}>
                {isLoading && <Spinner />}
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {user.hasPassword && (
            <TabsContent value="security" className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(sanitizedPassword(e.target.value))
                      }
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1/2 right-2 -translate-y-1/2"
                      onClick={() => setShowCurrentPassword((s) => !s)}
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
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(sanitizedPassword(e.target.value))
                      }
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1/2 right-2 -translate-y-1/2"
                      onClick={() => setShowNewPassword((s) => !s)}
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(sanitizedPassword(e.target.value))
                      }
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1/2 right-2 -translate-y-1/2"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handlePasswordUpdate} disabled={isLoading}>
                  {isLoading && <Spinner className="mr-2" />}
                  Update Password
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
