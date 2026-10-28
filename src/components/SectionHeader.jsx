import { cn } from "@/lib/utils";

export default function SectionHeader({ title, subtitle, icon: Icon, as = "h2", className, children }) {
  const Heading = as;
  return (
    <div className={cn("mb-4 flex items-start gap-3", className)}>
      {Icon && (
        <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <Heading className={as === "h1" ? "text-2xl sm:text-3xl" : "text-xl"}>{title}</Heading>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
