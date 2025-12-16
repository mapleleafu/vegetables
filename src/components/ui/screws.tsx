import { cn } from "@/lib/utils";

export type ScrewVariant =
  | "corners"
  | "sides"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center-left"
  | "center-right"
  | "top-center"
  | "bottom-center";

interface ScrewsProps {
  className?: string;
  variant?: ScrewVariant;
  size?: "xs" | "sm" | "md" | "lg";
}

export default function Screws({
  className,
  variant = "corners",
  size = "md",
}: ScrewsProps) {
  const sizes = {
    xs: "w-1 h-1",
    sm: "w-[7px] h-[7px]",
    md: "w-2.5 h-2.5",
    lg: "w-4 h-4",
  };

  // Base style
  const s = cn(
    "absolute z-50 bg-[url('/static/screw.png')] bg-cover bg-center bg-no-repeat",
    sizes[size],
    className,
  );

  const p = {
    tl: "top-1.5 left-1.5",
    tr: "top-1.5 right-1.5",
    bl: "bottom-1.5 left-1.5",
    br: "bottom-1.5 right-1.5",
    // Side Centers (Vertical Middle)
    cl: "left-1.5 top-1/2 -translate-y-1/2",
    cr: "right-1.5 top-1/2 -translate-y-1/2",
    // Top/Bottom Centers (Horizontal Middle)
    tc: "top-1.5 left-1/2 -translate-x-1/2",
    bc: "bottom-1.5 left-1/2 -translate-x-1/2",
  };

  if (variant === "corners") {
    return (
      <>
        <div className={cn(s, p.tl)} />
        <div className={cn(s, p.bl)} />
        <div className={cn(s, p.br)} />
        <div className={cn(s, p.tr)} />
      </>
    );
  }

  if (variant === "sides") {
    return (
      <>
        <div className={cn(s, p.cl)} />
        <div className={cn(s, p.cr)} />
      </>
    );
  }

  switch (variant) {
    case "top-left":
      return <div className={cn(s, p.tl)} />;
    case "top-right":
      return <div className={cn(s, p.tr)} />;
    case "bottom-left":
      return <div className={cn(s, p.bl)} />;
    case "bottom-right":
      return <div className={cn(s, p.br)} />;
    case "center-left":
      return <div className={cn(s, p.cl)} />;
    case "center-right":
      return <div className={cn(s, p.cr)} />;
    case "top-center":
      return <div className={cn(s, p.tc)} />;
    case "bottom-center":
      return <div className={cn(s, p.bc)} />;
    default:
      return null;
  }
}
