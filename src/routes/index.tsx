import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeading } from "@/components/PageHeading";
import { StatusPill } from "@/components/StatusPill";
import { kpiTrend, modules, tiers } from "@/data/mis";
import { getKpis, useTraining } from "@/lib/training-store";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Building2, Users, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Training Allocation Dashboard | TutorTrack" },
      {
        name: "description",
        content:
          "Live overview of educator training classes, attendance, module completion and lab booking conflicts.",
      },
      { property: "og:title", content: "Training Allocation Dashboard | TutorTrack" },
      {
        property: "og:description",
        content: "Live overview of educator training classes, attendance and lab booking conflicts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const toneClass = { accent: "text-accent", amber: "text-amber", brand: "text-brand" } as const;

function Dashboard() {
  const { cohorts, sessions: bookings, settings } = useTraining();
  const kpis = getKpis(cohorts, bookings, settings);
  const topModules = modules.filter((m) => ["M1", "M3", "M7", "M5", "M8"].includes(m.code));

  return (
    <>
      <PageHeading
        eyebrow="Program Overview"
        title="Training Allocation Dashboard"
        meta="Term 3 · Week 12 · 8 curriculum modules · 3 host centers (Kuwadzana, Chitungwiza, Warren Park)"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" icon={<ShieldCheck className="size-3.5 text-brand" />}>
              <Link to="/oversight">Manager Oversight →</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/schedule">View schedule →</Link>
            </Button>
          </div>
        }
      />

      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="glass rounded-lg p-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink/45">Teacher Classes</p>
           <p className="mt-2 font-display text-3xl font-semibold">{kpis.total}</p>
           <p className="mt-1.5 text-[11px] font-medium text-accent">{cohorts.reduce((n, c) => n + c.educators, 0)} educators enrolled</p>
        </div>
        <div className="glass rounded-lg p-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink/45">Attendance Rate</p>
           <p className="mt-2 font-display text-3xl font-semibold">{kpis.attendance}%</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
             <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${kpis.attendance}%` }} />
          </div>
        </div>
        <div className="glass rounded-lg p-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink/45">Avg Post-Score</p>
          <p className="mt-2 font-display text-3xl font-semibold">
             {kpis.post}<span className="text-lg text-ink/35">/100</span>
          </p>
           <p className="mt-1.5 text-[11px] font-medium text-accent">▲ {kpis.post - kpis.pre} vs pre-test</p>
        </div>
        <div className="glass rounded-lg p-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink/45">Lab Conflicts</p>
           <p className="mt-2 font-display text-3xl font-semibold text-amber">{kpis.conflicts}</p>
           <p className="mt-1.5 text-[11px] font-medium text-amber/90">{kpis.conflicts ? "Needs resolution" : "No active conflicts"}</p>
        </div>
      </div>

      {/* Teacher Training Manager Executive Spotlight Banner */}
      <div className="mt-4 rounded-2xl border border-brand/25 bg-brand/5 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-brand text-brand-foreground shadow-xs">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-foreground">
                  Teacher Training Manager Oversight
                </h3>
                <span className="rounded-full bg-brand/15 px-2 py-0.2 text-[10px] font-bold text-brand">
                  Lead: Anesu Muchirewesi
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Audit lab center throughput (Kuwadzana, Chitungwiza, Warren Park), monitor facilitator delivery (Diana Dumbu & Simba), and log directives.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="sm" icon={<ArrowUpRight className="size-3.5" />}>
              <Link to="/oversight">Open Manager Cockpit</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-lg p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-[15px] font-semibold">KPI Trends</h2>
              <p className="text-[12px] text-ink/45">Attendance &amp; competency vs. institutional target</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-medium">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-brand" />
                Attendance
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-accent" />
                Post-score
              </span>
            </div>
          </div>
          <div className="mt-6 flex h-44 items-end gap-2.5">
            {kpiTrend.map((point) => (
              <div key={point.week} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-32 w-full items-end justify-center gap-1">
                  <div
                    className={`w-3 rounded-t ${point.projected ? "bg-brand/40" : "bg-brand/80"}`}
                    style={{ height: `${point.attendance}%` }}
                  />
                  <div
                    className={`w-3 rounded-t ${point.projected ? "bg-accent/40" : "bg-accent/80"}`}
                    style={{ height: `${point.postScore}%` }}
                  />
                </div>
                <span className="text-[10px] text-ink/40">{point.week}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-lg p-5">
          <h2 className="font-display text-[15px] font-semibold">Module Completion</h2>
          <p className="text-[12px] text-ink/45">National curriculum tracks</p>
          <div className="mt-5 space-y-3.5">
            {topModules.map((m) => (
              <div key={m.code}>
                <div className="flex justify-between text-[12px] font-medium">
                  <span className="truncate pr-2">
                    {m.code} · {m.name}
                  </span>
                  <span className="shrink-0 text-ink/55">{m.completion}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-ink/10">
                  <div
                    className={`h-full rounded-full ${m.completion >= 85 ? "bg-brand" : m.completion >= 70 ? "bg-accent" : "bg-amber"}`}
                    style={{ width: `${m.completion}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[15px] font-semibold">Teacher Classes</h2>
              <p className="text-[12px] text-ink/45">Enrolled educators by teaching band</p>
            </div>
            <Link to="/cohorts" className="text-xs font-semibold text-brand hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {tiers.map((t, i) => {
              const tones = ["bg-brand/10 text-brand", "bg-accent/10 text-accent", "bg-amber/10 text-amber"] as const;
              const tone = tones[i] ?? tones[0];
              const [bg, text] = tone.split(" ");
              return (
                <div key={t.tier} className={`rounded-xl p-3 ${bg}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-semibold">
                      {t.tier} · {t.range}
                    </span>
                    <span className={`font-display text-xl font-semibold ${text}`}>{t.educators}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-ink/45">
                    {t.facilitators} facilitators · 3 Hub Labs
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-lg p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-[15px] font-semibold">Upcoming Sessions</h2>
              <p className="text-[12px] text-ink/45">Conflict-checked lab reservations</p>
            </div>
             <Link to="/schedule" className="shrink-0 text-[12px] font-medium text-brand hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-4 divide-y divide-ink/10">
            {bookings.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center gap-4 py-3">
                <div className="w-11 shrink-0 text-center">
                  <p className="font-display text-lg font-semibold leading-none">{s.time}</p>
                  <p className="mt-1 text-[10px] text-ink/40">{s.day}</p>
                </div>
                <div className="h-8 w-px shrink-0 bg-ink/10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">
                    {s.module} · {s.title}
                  </p>
                  <p className="truncate text-[12px] text-ink/45">
                    {s.center} · {s.tier} · Facilitator {s.facilitator}
                  </p>
                </div>
                <StatusPill status={s.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-lg p-5">
          <h2 className="font-display text-[15px] font-semibold">M&amp;E Scorecard</h2>
           <p className="text-[12px] text-ink/45">Current register vs. target</p>
          <div className="mt-4 space-y-3">
             {[
               { label: `Attendance ≥ ${settings.attendanceTarget}%`, value: `${kpis.meetingAttendance} / ${kpis.total}`, tone: kpis.meetingAttendance === kpis.total ? "accent" : "amber" },
               { label: `Post-score ≥ ${settings.scoreTarget}`, value: `${kpis.meetingScore} / ${kpis.total}`, tone: kpis.meetingScore === kpis.total ? "accent" : "amber" },
               { label: `Modules ≥ ${settings.completionTarget}`, value: `${kpis.meetingCompletion} / ${kpis.total}`, tone: "brand" },
               { label: "Lab conflicts", value: String(kpis.conflicts), tone: kpis.conflicts ? "amber" : "accent" },
             ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-xl bg-card/40 px-3 py-2.5"
              >
                <span className="text-[12px] font-medium">{row.label}</span>
                 <span className={`font-display text-sm font-semibold ${toneClass[row.tone as keyof typeof toneClass]}`}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              to="/assessments"
              className="rounded-md border border-border/70 bg-card py-2 text-center text-[12px] font-semibold text-foreground hover:bg-muted/60"
            >
              Assessment results
            </Link>
            <Link
              to="/reports"
              className="rounded-md bg-brand py-2 text-center text-[12px] font-semibold text-brand-foreground hover:bg-brand/90"
            >
              M&amp;E reports
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
