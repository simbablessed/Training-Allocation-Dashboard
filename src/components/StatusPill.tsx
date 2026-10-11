import type { SessionStatus, Tier } from "@/data/mis";

const statusTone: Record<SessionStatus, string> = {
  Confirmed: "bg-accent/15 text-accent",
  Pending: "bg-brand/15 text-brand",
  Conflict: "bg-amber/15 text-amber",
};

export function StatusPill({ status }: { status: SessionStatus }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone[status]}`}>
      {status}
    </span>
  );
}

const tierTone: Record<Tier, string> = {
  Infants: "bg-brand/10 text-brand",
  "Middle Junior": "bg-accent/10 text-accent",
  "Upper Junior": "bg-amber/10 text-amber",
};

export function TierPill({ tier }: { tier: Tier }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tierTone[tier]}`}>
      {tier}
    </span>
  );
}
