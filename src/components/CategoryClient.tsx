"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Search as SearchIcon, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useDebouncedCallback } from "use-debounce";
import { api } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CategoryWithProgress = {
  id: string;
  name: string;
  slug: string;
  costCoins: number;
  isUnlocked: boolean;
  progress: number;
  goldProgress: number;
  totalWords: number;
};

// Formatting helper
const formatNumber = (num: number) =>
  new Intl.NumberFormat("en-US").format(num);

export function CategoryFilters({
  query,
  filter,
  sort,
}: {
  query: string;
  filter: string;
  sort: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) params.set("query", term);
    else params.delete("query");
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  }, 300);

  const handleFilter = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val !== "all") params.set("filter", val);
    else params.delete("filter");
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  };

  const handleSort = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val !== "name_asc") params.set("sort", val);
    else params.delete("sort");
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1">
        <SearchIcon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
        <Input
          placeholder="Search categories..."
          className="pl-9"
          defaultValue={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Select defaultValue={filter} onValueChange={handleFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unlocked">Unlocked</SelectItem>
            <SelectItem value="locked">Locked</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue={sort} onValueChange={handleSort}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
            <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            <SelectItem value="cost_asc">Cost (Low)</SelectItem>
            <SelectItem value="cost_desc">Cost (High)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function CategoryCard({
  category,
  userCoins,
}: {
  category: CategoryWithProgress;
  userCoins: number;
}) {
  const router = useRouter();
  const [isUnlocking, setIsUnlocking] = useState(false);

  const unlockCategory = (categoryId: string) => async () => {
    if (isUnlocking) return;
    setIsUnlocking(true);

    try {
      await api.categories.unlock(categoryId);
      toast.success(`Unlocked ${category.name}!`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to unlock category. Please try again.");
      setIsUnlocking(false);
    }
  };

  if (category.isUnlocked) {
    return (
      <Link
        href={`/categories/${category.slug}`}
        className="group block h-full"
      >
        <Card className="hover:border-primary/50 relative h-full overflow-hidden transition-all hover:shadow-md">
          <div className="from-primary/5 absolute inset-0 bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="line-clamp-1">{category.name}</CardTitle>
              <Badge
                variant="default"
                className="bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:text-green-400"
              >
                Unlocked
              </Badge>
            </div>
            <CardDescription>Mastery Progress</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2">
            <div className="relative w-full">
              <Progress value={category.progress} className="h-2" />
              {category.goldProgress > 0 && (
                <Progress
                  value={category.goldProgress}
                  className="absolute top-0 left-0 h-2 bg-transparent [&>div]:bg-yellow-500 [&>div]:shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                />
              )}
            </div>

            <div className="text-muted-foreground flex w-full items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono">
                  {Math.round(category.progress)}%
                </span>
              </div>
              <PlayCircle className="text-primary h-4 w-4 translate-x-[-5px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </CardFooter>
        </Card>
      </Link>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group bg-muted/30 hover:bg-muted/50 hover:border-primary/20 relative h-full cursor-pointer overflow-hidden border-dashed transition-all">
          <div className="bg-background/50 absolute inset-0 flex items-center justify-center opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
            <Lock className="text-muted-foreground h-8 w-8" />
          </div>
          <CardHeader className="opacity-60 transition-opacity group-hover:opacity-40">
            <div className="flex items-start justify-between">
              <CardTitle className="line-clamp-1">{category.name}</CardTitle>
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" /> Locked
              </Badge>
            </div>
            <CardDescription>Requires Unlock</CardDescription>
          </CardHeader>
          <CardFooter className="opacity-80 group-hover:opacity-40">
            <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5",
                  userCoins >= category.costCoins
                    ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                    : "bg-red-500/20 text-red-600 dark:text-red-400",
                )}
              >
                Cost: {formatNumber(category.costCoins)}
              </div>
            </div>
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unlock {category.name}?</DialogTitle>
          <DialogDescription>
            This category is currently locked. You need to spend coins to access
            these words.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Cost</span>
              <p className="text-muted-foreground text-xs">Coins required</p>
            </div>
            <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
              {formatNumber(category.costCoins)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Your Balance</span>
              <p className="text-muted-foreground text-xs">Current coins</p>
            </div>
            <span
              className={cn(
                "text-xl font-bold",
                userCoins < category.costCoins && "text-red-500",
              )}
            >
              {formatNumber(userCoins)}
            </span>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button variant="outline" disabled={isUnlocking}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={userCoins < category.costCoins || isUnlocking}
            onClick={unlockCategory(category.id)}
          >
            {isUnlocking ? "Unlocking..." : "Unlock Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
