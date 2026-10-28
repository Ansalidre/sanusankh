import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Kachel mit Icon, Titel und Untertitel – als interner Link (`to`) oder externer/tel-Link (`href`). */
export default function QuickTile({ icon: Icon, title, subtitle, to, href, tone = "default", className }) {
  const classes = cn(
    "card-soft group flex min-h-[7rem] flex-col gap-2 hyphens-auto break-words p-4 text-start transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
    tone === "emergency" && "border-emergency/30 bg-emergency-soft",
    className,
  );
  const content = (
    <>
      <span
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-xl",
          tone === "emergency" ? "bg-emergency text-white" : "bg-accent text-primary",
        )}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <span className="font-heading text-base font-bold leading-tight text-foreground">{title}</span>
      {subtitle && <span className="text-sm leading-snug text-muted-foreground">{subtitle}</span>}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link to={to} className={classes}>
      {content}
    </Link>
  );
}
