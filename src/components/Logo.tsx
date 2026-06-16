import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  size?: LogoSize;
  showLabel?: boolean;
  className?: string;
}

const sizeMap: Record<LogoSize, { box: string; rounded: string; label: string; gap: string }> = {
  sm: { box: "h-8 w-8", rounded: "rounded-lg", label: "text-[9px] tracking-[0.25em]", gap: "gap-1" },
  md: { box: "h-12 w-12", rounded: "rounded-2xl", label: "text-[10px] tracking-[0.3em]", gap: "gap-1.5" },
  lg: { box: "h-20 w-20", rounded: "rounded-3xl", label: "text-xs tracking-[0.4em]", gap: "gap-2" },
};

export function Logo({ size = "md", showLabel = true, className }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn("inline-flex flex-col items-center", s.gap, className)}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden border border-border bg-secondary shadow-sm shrink-0",
          s.box,
          s.rounded,
        )}
      >
        <img src="/logo.png" alt="Caloteiros" className="h-full w-full object-contain block dark:hidden" />
        <img src="/logo-dark.png" alt="Caloteiros" className="h-full w-full object-contain hidden dark:block" />
      </div>
      {showLabel && (
        <p className={cn("uppercase font-semibold text-gold leading-none", s.label)}>
          CALOTEIROS
        </p>
      )}
    </div>
  );
}
