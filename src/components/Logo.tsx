import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  size?: LogoSize;
  showLabel?: boolean;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

const sizeMap: Record<LogoSize, { box: string; rounded: string; label: string; gap: string }> = {
  sm: { box: "h-9 w-9", rounded: "rounded-xl", label: "text-[10px] tracking-[0.22em]", gap: "gap-1.5" },
  md: { box: "h-12 w-12", rounded: "rounded-2xl", label: "text-[11px] tracking-[0.26em]", gap: "gap-2" },
  lg: { box: "h-20 w-20", rounded: "rounded-3xl", label: "text-xs tracking-[0.34em]", gap: "gap-2.5" },
};

export function Logo({
  size = "md",
  showLabel = true,
  orientation = "vertical",
  className,
}: LogoProps) {
  const s = sizeMap[size];
  return (
    <div
      className={cn(
        "inline-flex items-center",
        orientation === "vertical" ? "flex-col" : "flex-row",
        s.gap,
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden border border-border bg-surface shadow-luxe",
          s.box,
          s.rounded,
        )}
      >
        <img src="/logo.png" alt="Caloteiros" className="block h-full w-full object-contain dark:hidden" />
        <img
          src="/logo-dark.png"
          alt="Caloteiros"
          className="hidden h-full w-full object-contain dark:block"
        />
      </div>
      {showLabel && (
        <p className={cn("font-display font-bold uppercase leading-none text-foreground", s.label)}>
          Caloteiros
        </p>
      )}
    </div>
  );
}
