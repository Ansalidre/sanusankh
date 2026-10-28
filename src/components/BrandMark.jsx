import { cn } from "@/lib/utils";

/** Bildmarke: stilisiertes Ankh mit Kreuz-Querbalken und rotem Notfallpunkt. */
export default function BrandMark({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-10 w-10 shrink-0", className)} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="hsl(193 76% 20%)" />
      <circle cx="32" cy="19" r="9" fill="none" stroke="#fff" strokeWidth="5" />
      <path d="M32 28v24M20 34h24" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <circle cx="47" cy="47" r="7" fill="#D7263D" />
    </svg>
  );
}
