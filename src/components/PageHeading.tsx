import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  meta,
  action,
}: {
  eyebrow: string;
  title: string;
  meta: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-[14px] text-muted-foreground">{meta}</p>
      </div>
      {action}
    </div>
  );
}
