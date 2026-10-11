import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import { StatusPill } from "@/components/StatusPill";
import { kpiTrend, modules, tiers, LAB_CENTERS } from "@/data/mis";
import { getKpis, useTraining, type PersonaType } from "@/lib/training-store";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Building2,
  Users,
  ArrowUpRight,
  Sparkles,
  Star,
  Laptop,
  Wifi,
  SunMedium,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  CalendarDays,
  FileText,
  UserCheck,
  BookOpen,
  Award,
  Activity,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Training Allocation Dashboard | TutorTrack" },
      {
        name: "description",
        content:
          "Role-tailored dashboard for Teacher Training Manager Anesu Muchirewesi and resident facilitators Simba and Diana Dumbu.",
      },
      { property: "og:title", content: "Training Allocation Dashboard | TutorTrack" },
      {
        property: "og:description",
        content: "Role-tailored educator training allocation and M&E performance tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const toneClass = { accent: "text-accent", amber: "text-amber", brand: "text-brand" } as const;

function Dashboard() {
  const { cohorts, sessions: bookings, settings, activePersona, setActivePersona } = useTraining();
  const kpis = getKpis(cohorts, bookings, settings);
  const topModules = modules.filter((m) => ["M1", "M3", "M7", "M5", "M8"].includes(m.code));

  // Quick action feedback toast simulation
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  function triggerNotice(msg: string) {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  }

  return (
    <>
      {/* 1. Global Persona Switcher Banner: Easily toggle between Anesu (Manager), Diana (Chitungwiza), and Simba (Kuwadzana) */}
      <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Layers className="size-4" />
          </span>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Dashboard View Mode:
            </span>
            <p className="text-xs font-semibold text-foreground">
              {activePersona === "Anesu Muchirewesi"
                ? "👑 Manager Executive View (Anesu Muchirewesi · Warren Park Dual-Role)"
                : activePersona === "Diana Dumbu"
                  ? "👩‍🏫 Resident Facilitator View (Diana Dumbu · Chitungwiza Hub Lab)"
                  : "👨‍🏫 Resident Facilitator View (Simba · Kuwadzana Hub Lab)"}
            </p>
          </div>
        </div>

        {/* Persona Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setActivePersona("Anesu Muchirewesi")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activePersona === "Anesu Muchirewesi"
                ? "bg-brand text-brand-foreground shadow-xs"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            }`}
          >
            <span>👑 Anesu (Manager)</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePersona("Diana Dumbu")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activePersona === "Diana Dumbu"
                ? "bg-brand text-brand-foreground shadow-xs"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            }`}
          >
            <span>👩‍🏫 Diana (Chitungwiza)</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePersona("Simba")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activePersona === "Simba"
                ? "bg-brand text-brand-foreground shadow-xs"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            }`}
          >
            <span>👨‍🏫 Simba (Kuwadzana)</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-xs font-semibold text-accent">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            {actionNotice}
          </span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-[11px] font-bold uppercase underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Render Tailored Dashboard Based on Persona */}
      {activePersona === "Anesu Muchirewesi" ? (
        <ManagerDashboardView
          kpis={kpis}
          cohorts={cohorts}
          bookings={bookings}
          settings={settings}
          topModules={topModules}
          triggerNotice={triggerNotice}
        />
      ) : activePersona === "Diana Dumbu" ? (
        <DianaFacilitatorView
          cohorts={cohorts}
          bookings={bookings}
          triggerNotice={triggerNotice}
        />
      ) : (
        <SimbaFacilitatorView
          cohorts={cohorts}
          bookings={bookings}
          triggerNotice={triggerNotice}
        />
      )}
    </>
  );
}

/* =========================================================================
   VIEW 1: ANESU MUCHIREWESI — TEACHER TRAINING MANAGER EXECUTIVE DASHBOARD
   Includes Program-wide KPIs, Oversight of Simba & Diana, and Anesu's Warren Park Dual-Role
   ========================================================================= */
function ManagerDashboardView({
  kpis,
  cohorts,
  bookings,
  settings,
  topModules,
  triggerNotice,
}: {
  kpis: ReturnType<typeof getKpis>;
  cohorts: any[];
  bookings: any[];
  settings: any;
  topModules: any[];
  triggerNotice: (m: string) => void;
}) {
  const anesuWarrenParkSessions = bookings.filter((s) => s.facilitator === "Anesu Muchirewesi");
  const anesuWarrenParkCohorts = cohorts.filter((c) => c.facilitator === "Anesu Muchirewesi");

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Executive Programme Oversight"
        title="Teacher Training Manager Dashboard"
        meta="Lead: Anesu Muchirewesi · Term 3 Week 12 · 3 Hub Centers (Kuwadzana, Chitungwiza, Warren Park)"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" icon={<ShieldCheck className="size-3.5 text-brand" />}>
              <Link to="/oversight">Manager Oversight Cockpit →</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/schedule">All Hub Schedules →</Link>
            </Button>
          </div>
        }
      />

      {/* Program High-Level KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="glass rounded-xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Enrolled Teachers</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-foreground">
            {cohorts.reduce((n, c) => n + c.educators, 0)}
          </p>
          <p className="mt-1.5 text-[11px] font-semibold text-accent">6 Active Cohorts across 3 Hubs</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Program Attendance</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-foreground">{kpis.attendance}%</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${kpis.attendance}%` }} />
          </div>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Competency Delta</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-foreground">
            {kpis.post}<span className="text-lg font-normal text-muted-foreground">/100</span>
          </p>
          <p className="mt-1.5 text-[11px] font-semibold text-accent">▲ +{kpis.post - kpis.pre} pts vs pre-test</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Lab Collisions</p>
          <p className={`mt-2 font-display text-3xl font-extrabold ${kpis.conflicts ? "text-amber" : "text-accent"}`}>
            {kpis.conflicts}
          </p>
          <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">
            {kpis.conflicts ? "2 flagged for resolution" : "Zero conflicts active"}
          </p>
        </div>
      </div>

      {/* Facilitator Operations Spotlight: Monitoring Diana Dumbu & Simba */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-brand/10 text-brand">
                <Users className="size-3.5" />
              </span>
              <h2 className="font-display text-base font-bold text-foreground">
                Facilitator Delivery & Lab Operations
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live monitoring of resident field facilitators: Diana Dumbu (Chitungwiza) and Simba (Kuwadzana).
            </p>
          </div>
          <Button asChild variant="outline" size="sm" icon={<ArrowUpRight className="size-3.5 text-brand" />}>
            <Link to="/oversight">Open Detailed Audit Table</Link>
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: Diana Dumbu */}
          <div className="rounded-xl border border-border bg-background p-4.5 hover:border-brand/40 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-brand/10 font-display text-sm font-bold text-brand">
                  DD
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-bold text-foreground">Diana Dumbu</h3>
                    <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                      ⭐ 4.96 Rating
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Resident Facilitator · 📍 Chitungwiza Hub Lab
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                Active in Lab
              </span>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Specialization:</span> Infants (ECD–Gr2) · M1 ICT Tools, M2 Digital Learning Aids, M3 Software.
            </p>

            <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Teaching Output</p>
                <p className="font-display text-sm font-bold text-foreground">48 hrs</p>
                <p className="text-[10px] text-muted-foreground">22 sessions</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Attendance</p>
                <p className="font-display text-sm font-bold text-accent">93.5%</p>
                <p className="text-[10px] text-muted-foreground">54 educators</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Verified Labs</p>
                <p className="font-display text-sm font-bold text-brand">24 / 26</p>
                <p className="text-[10px] text-muted-foreground">92% audit pass</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground text-[11px]">
                Mentorship Clinics: <strong className="text-foreground">38 sessions</strong> (156 teachers)
              </span>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs font-semibold text-brand hover:text-brand">
                <Link to="/schedule">View Schedule →</Link>
              </Button>
            </div>
          </div>

          {/* Card: Simba */}
          <div className="rounded-xl border border-border bg-background p-4.5 hover:border-brand/40 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-brand/10 font-display text-sm font-bold text-brand">
                  SM
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-bold text-foreground">Simba</h3>
                    <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                      ⭐ 4.86 Rating
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Resident Facilitator · 📍 Kuwadzana Hub Lab
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                Active in Lab
              </span>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Specialization:</span> Middle Junior (Gr3–Gr4) · M5 Web, M6 STEAM & M7 Scratch Logic.
            </p>

            <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Teaching Output</p>
                <p className="font-display text-sm font-bold text-foreground">44 hrs</p>
                <p className="text-[10px] text-muted-foreground">20 sessions</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Attendance</p>
                <p className="font-display text-sm font-bold text-accent">89.5%</p>
                <p className="text-[10px] text-muted-foreground">62 educators</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Verified Labs</p>
                <p className="font-display text-sm font-bold text-brand">22 / 24</p>
                <p className="text-[10px] text-muted-foreground">91% audit pass</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground text-[11px]">
                Mentorship Clinics: <strong className="text-foreground">42 sessions</strong> (174 teachers)
              </span>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs font-semibold text-brand hover:text-brand">
                <Link to="/schedule">View Schedule →</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Anesu's Warren Park Dual-Role Facilitation Section */}
      <div className="rounded-2xl border border-brand/30 bg-brand/5 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand/15">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-brand text-brand-foreground shadow-xs">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-foreground">
                  Manager Dual-Role Facilitation — Warren Park Hub Lab
                </h3>
                <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-bold text-brand">
                  Active Facilitator
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                In addition to managerial duties, Anesu leads Upper Junior modules (Gr5–Gr7: M4 Ethics & Safety, M8 Offline Networks) at Warren Park.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-border bg-card px-3 py-1 text-xs font-bold text-foreground">
              38 hrs taught · 100% Punctuality
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Anesu's Warren Park Schedule
            </h4>
            <div className="space-y-2">
              {anesuWarrenParkSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-brand">{s.day} {s.time}</span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{s.title}</p>
                      <p className="text-[11px] text-muted-foreground">{s.center} · {s.tier}</p>
                    </div>
                  </div>
                  <StatusPill status={s.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Assigned Warren Park Classes
            </h4>
            <div className="space-y-2">
              {anesuWarrenParkCohorts.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {c.educators} teachers · Pre: {c.pre} → Post: {c.post}
                    </p>
                  </div>
                  <span className="font-display text-xs font-bold text-accent">{c.attendance}% attendance</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Hub Labs Readiness Strip */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Building2 className="size-4 text-brand" />
          Hub Computer Labs Infrastructure Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold text-foreground">Kuwadzana Hub Lab</span>
              <span className="text-[10px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded">Lead: Simba</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">30 Dell OptiPlex · Fiber (50 Mbps) + Local Ka-Lite</p>
            <p className="text-[11px] font-semibold text-accent mt-2 flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Grid + Auto Generator Operational
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold text-foreground">Chitungwiza Hub Lab</span>
              <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">Lead: Diana Dumbu</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">35 HP AiO · 4G LTE Gateway + Synology NAS</p>
            <p className="text-[11px] font-semibold text-accent mt-2 flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Hybrid Solar Inverter (100%)
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold text-foreground">Warren Park Hub Lab</span>
              <span className="text-[10px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded">Lead: Anesu (Manager)</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">28 Lenovo PCs · Starlink Satellite + Raspberry Pi</p>
            <p className="text-[11px] font-semibold text-accent mt-2 flex items-center gap-1">
              <CheckCircle2 className="size-3" /> 5kVA Solar & Lithium Battery Ready
            </p>
          </div>
        </div>
      </div>

      {/* KPI Trends & Module Completion Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-xl p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[15px] font-semibold">Program Attendance & Competency Trends</h2>
              <p className="text-[12px] text-muted-foreground">Tracking institutional progress across 14 training weeks</p>
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
                <span className="text-[10px] text-muted-foreground">{point.week}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <h2 className="font-display text-[15px] font-semibold">Module Completion</h2>
          <p className="text-[12px] text-muted-foreground">National ICT curriculum tracks</p>
          <div className="mt-5 space-y-3.5">
            {topModules.map((m) => (
              <div key={m.code}>
                <div className="flex justify-between text-[12px] font-medium">
                  <span className="truncate pr-2">{m.code} · {m.name}</span>
                  <span className="shrink-0 text-muted-foreground">{m.completion}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${m.completion >= 85 ? "bg-brand" : m.completion >= 70 ? "bg-accent" : "bg-amber"}`}
                    style={{ width: `${m.completion}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   VIEW 2: DIANA DUMBU — RESIDENT FACILITATOR DASHBOARD (CHITUNGWIZA HUB LAB)
   Tailored to Diana's schedule, Infants cohorts, Chitungwiza Lab specs & student gains
   ========================================================================= */
function DianaFacilitatorView({
  cohorts,
  bookings,
  triggerNotice,
}: {
  cohorts: any[];
  bookings: any[];
  triggerNotice: (m: string) => void;
}) {
  const mySessions = bookings.filter((s) => s.facilitator === "Diana Dumbu");
  const myCohorts = cohorts.filter((c) => c.facilitator === "Diana Dumbu");

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Resident Facilitator Workspace"
        title="Facilitator Dashboard — Diana Dumbu"
        meta="Resident Lab: Chitungwiza Hub Lab · Infants & Early Junior Lead · Term 3 Week 12"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => triggerNotice("Session attendance registered for Chitungwiza lab.")}
              icon={<UserCheck className="size-3.5" />}
            >
              Sign In Educators
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/schedule">My Timetable →</Link>
            </Button>
          </div>
        }
      />

      {/* Diana's Personal Performance KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="glass rounded-xl p-5 border-l-4 border-l-brand">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">My Teaching Output</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-foreground">48 hrs</p>
          <p className="mt-1.5 text-[11px] font-semibold text-brand">22 sessions logged (Term 3)</p>
        </div>

        <div className="glass rounded-xl p-5 border-l-4 border-l-accent">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Educator Rating</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-accent">
            ⭐ 4.96<span className="text-sm font-normal text-muted-foreground">/5.0</span>
          </p>
          <p className="mt-1.5 text-[11px] font-semibold text-accent">99.2% positive feedback (Top Rated)</p>
        </div>

        <div className="glass rounded-xl p-5 border-l-4 border-l-brand">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Chitungwiza Attendance</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-foreground">93.5%</p>
          <p className="mt-1.5 text-[11px] font-semibold text-accent">54 teachers under supervision</p>
        </div>

        <div className="glass rounded-xl p-5 border-l-4 border-l-accent">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Verified Practical Labs</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-foreground">24 / 26</p>
          <p className="mt-1.5 text-[11px] font-semibold text-brand">38 1-on-1 mentorship clinics held</p>
        </div>
      </div>

      {/* Resident Hub Lab Info Banner */}
      <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4.5 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground shadow-xs">
              <Building2 className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-foreground">
                  Resident Hub: Chitungwiza Hub Lab
                </h3>
                <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-bold text-accent">
                  Coordinator: Diana Dumbu
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                35 HP All-in-One PCs · 4G LTE Gateway + Synology NAS · Hybrid Solar Inverter (100% capacity).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-card px-3 py-1 text-xs font-bold text-accent">
              <CheckCircle2 className="size-3.5" />
              All 35 Stations Operational
            </span>
          </div>
        </div>
      </div>

      {/* Schedule & Cohorts Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Diana's Scheduled Sessions */}
        <div className="glass rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div>
              <h2 className="font-display text-sm font-bold text-foreground">
                Diana's Chitungwiza Workshop Timetable
              </h2>
              <p className="text-[11px] text-muted-foreground">Scheduled teaching sessions and lab bookings</p>
            </div>
            <Link to="/schedule" className="text-xs font-semibold text-brand hover:underline">
              Full Schedule →
            </Link>
          </div>

          <div className="mt-3 divide-y divide-border/60">
            {mySessions.map((s) => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 rounded-lg bg-muted/50 p-1.5 text-center">
                    <p className="font-display text-xs font-bold text-foreground">{s.day}</p>
                    <p className="font-mono text-[11px] text-brand">{s.time}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{s.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.center} · {s.tier} · Module {s.module}
                    </p>
                    {s.note && <p className="text-[10px] text-amber font-medium mt-0.5">{s.note}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <StatusPill status={s.status} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => triggerNotice(`Practical lab sign-off recorded for ${s.title}`)}
                  >
                    Verify Lab
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Classes */}
        <div className="glass rounded-xl p-5 space-y-4">
          <h2 className="font-display text-sm font-bold text-foreground">Assigned Chitungwiza Classes</h2>
          <div className="space-y-3">
            {myCohorts.map((c) => (
              <div key={c.id} className="rounded-xl border border-border bg-background p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground">{c.name}</p>
                  <span className="font-display text-xs font-bold text-accent">{c.attendance}% attendance</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {c.educators} teachers enrolled · Pre: {c.pre} → Post: {c.post} (+{c.post - c.pre} gain)
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${c.attendance}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-brand/20 bg-brand/5 p-3">
            <p className="text-[11px] font-bold uppercase text-brand">Manager Directive (From Anesu)</p>
            <p className="text-xs text-muted-foreground mt-1">
              "Chitungwiza Infants Class D attendance follow-up: coordinate with headmasters for Wednesday teacher release."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   VIEW 3: SIMBA — RESIDENT FACILITATOR DASHBOARD (KUWADZANA HUB LAB)
   Tailored to Simba's schedule, STEAM/Scratch cohorts, Kuwadzana Lab specs & student gains
   ========================================================================= */
function SimbaFacilitatorView({
  cohorts,
  bookings,
  triggerNotice,
}: {
  cohorts: any[];
  bookings: any[];
  triggerNotice: (m: string) => void;
}) {
  const mySessions = bookings.filter((s) => s.facilitator === "Simba");
  const myCohorts = cohorts.filter((c) => c.facilitator === "Simba");

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Resident Facilitator Workspace"
        title="Facilitator Dashboard — Simba"
        meta="Resident Lab: Kuwadzana Hub Lab · Coding & STEAM Specialist · Term 3 Week 12"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => triggerNotice("Session attendance registered for Kuwadzana lab.")}
              icon={<UserCheck className="size-3.5" />}
            >
              Sign In Educators
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/schedule">My Timetable →</Link>
            </Button>
          </div>
        }
      />

      {/* Simba's Personal Performance KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="glass rounded-xl p-5 border-l-4 border-l-brand">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">My Teaching Output</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-foreground">44 hrs</p>
          <p className="mt-1.5 text-[11px] font-semibold text-brand">20 sessions logged (Term 3)</p>
        </div>

        <div className="glass rounded-xl p-5 border-l-4 border-l-accent">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Educator Rating</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-accent">
            ⭐ 4.86<span className="text-sm font-normal text-muted-foreground">/5.0</span>
          </p>
          <p className="mt-1.5 text-[11px] font-semibold text-accent">97.1% positive feedback (Coding Specialist)</p>
        </div>

        <div className="glass rounded-xl p-5 border-l-4 border-l-brand">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Kuwadzana Attendance</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-foreground">89.5%</p>
          <p className="mt-1.5 text-[11px] font-semibold text-accent">62 teachers under supervision</p>
        </div>

        <div className="glass rounded-xl p-5 border-l-4 border-l-accent">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Verified Practical Labs</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-foreground">22 / 24</p>
          <p className="mt-1.5 text-[11px] font-semibold text-brand">42 1-on-1 coding clinics held</p>
        </div>
      </div>

      {/* Resident Hub Lab Info Banner */}
      <div className="rounded-2xl border border-brand/25 bg-brand/5 p-4.5 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-brand text-brand-foreground shadow-xs">
              <Building2 className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-foreground">
                  Resident Hub: Kuwadzana Hub Lab
                </h3>
                <span className="rounded-full bg-brand/20 px-2.5 py-0.5 text-[10px] font-bold text-brand">
                  Coordinator: Simba
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                30 Dell OptiPlex PCs + Epson Projector · Dedicated Fiber (50 Mbps) + Local Ka-Lite LMS · Backup Generator.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-card px-3 py-1 text-xs font-bold text-brand">
              <CheckCircle2 className="size-3.5" />
              Scratch 3.0 & Python IDEs Ready
            </span>
          </div>
        </div>
      </div>

      {/* Schedule & Cohorts Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Simba's Scheduled Sessions */}
        <div className="glass rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div>
              <h2 className="font-display text-sm font-bold text-foreground">
                Simba's Kuwadzana Workshop Timetable
              </h2>
              <p className="text-[11px] text-muted-foreground">Scheduled teaching sessions and coding workshops</p>
            </div>
            <Link to="/schedule" className="text-xs font-semibold text-brand hover:underline">
              Full Schedule →
            </Link>
          </div>

          <div className="mt-3 divide-y divide-border/60">
            {mySessions.map((s) => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 rounded-lg bg-muted/50 p-1.5 text-center">
                    <p className="font-display text-xs font-bold text-foreground">{s.day}</p>
                    <p className="font-mono text-[11px] text-brand">{s.time}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{s.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.center} · {s.tier} · Module {s.module}
                    </p>
                    {s.note && <p className="text-[10px] text-amber font-medium mt-0.5">{s.note}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <StatusPill status={s.status} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => triggerNotice(`Practical coding lab sign-off recorded for ${s.title}`)}
                  >
                    Verify Lab
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Classes */}
        <div className="glass rounded-xl p-5 space-y-4">
          <h2 className="font-display text-sm font-bold text-foreground">Assigned Kuwadzana Classes</h2>
          <div className="space-y-3">
            {myCohorts.map((c) => (
              <div key={c.id} className="rounded-xl border border-border bg-background p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground">{c.name}</p>
                  <span className="font-display text-xs font-bold text-accent">{c.attendance}% attendance</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {c.educators} teachers enrolled · Pre: {c.pre} → Post: {c.post} (+{c.post - c.pre} gain)
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${c.attendance}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-brand/20 bg-brand/5 p-3">
            <p className="text-[11px] font-bold uppercase text-brand">Manager Directive (From Anesu)</p>
            <p className="text-xs text-muted-foreground mt-1">
              "Kuwadzana Scratch Practical: Verify offline Scratch 3.0 installers on all 30 Dell stations ahead of Tuesday's M7 session."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
