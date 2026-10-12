import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import { StatusPill } from "@/components/StatusPill";
import { kpiTrend, modules, tiers, LAB_CENTERS, type LabQuarterlyAudit } from "@/data/mis";
import { getKpis, useTraining, type PersonaType } from "@/lib/training-store";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Building2,
  Users,
  ArrowUpRight,
  Laptop,
  Sun,
  BatteryCharging,
  Zap,
  Plug,
  Wrench,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  GraduationCap,
  CalendarDays,
  UserCheck,
  FileText,
  Clock,
  MapPin,
  Edit3,
  Plus,
  X,
  Check,
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
          "Role-tailored operations dashboard for Teacher Training Manager Anesu Muchirewesi and resident facilitators Simba and Diana Dumbu.",
      },
      { property: "og:title", content: "Training Allocation Dashboard | TutorTrack" },
      {
        property: "og:description",
        content: "Role-tailored educator training allocation, lab inventory, and solar M&E tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const toneClass = { accent: "text-accent", amber: "text-amber", brand: "text-brand" } as const;

function Dashboard() {
  const {
    cohorts,
    sessions: bookings,
    settings,
    activePersona,
    setActivePersona,
    labAudits,
    updateLabAudit,
    addLabAudit,
  } = useTraining();

  const kpis = getKpis(cohorts, bookings, settings);
  const topModules = modules.filter((m) => ["M1", "M3", "M7", "M5", "M8"].includes(m.code));

  // Notification toast state
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal state for quarterly audit editing
  const [editingAudit, setEditingAudit] = useState<LabQuarterlyAudit | null>(null);

  function triggerNotice(msg: string) {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  }

  function handleSaveAudit(updated: LabQuarterlyAudit) {
    updateLabAudit(updated.id, updated);
    setEditingAudit(null);
    triggerNotice(`Quarterly audit for ${updated.center} (${updated.quarter}) updated successfully.`);
  }

  return (
    <div className="space-y-6">
      {/* 1. Sleek, Professional Workspace Switcher (Zero Emojis, Native Segmented Control) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-accent animate-pulse" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">Active Perspective:</span>
          <span className="font-bold text-foreground">
            {activePersona === "Anesu Muchirewesi"
              ? "Training Manager (Warren Park Lead)"
              : activePersona === "Diana Dumbu"
                ? "Resident Facilitator (Chitungwiza Hub)"
                : "Resident Facilitator (Kuwadzana Hub)"}
          </span>
        </div>

        {/* Clean Segmented Pill Buttons */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActivePersona("Anesu Muchirewesi")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activePersona === "Anesu Muchirewesi"
                ? "bg-brand text-brand-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <ShieldCheck className="size-3.5" />
            <span>Anesu Muchirewesi (Manager)</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePersona("Diana Dumbu")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activePersona === "Diana Dumbu"
                ? "bg-brand text-brand-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Building2 className="size-3.5" />
            <span>Diana Dumbu (Chitungwiza)</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePersona("Simba")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activePersona === "Simba"
                ? "bg-brand text-brand-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Building2 className="size-3.5" />
            <span>Simba (Kuwadzana)</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-xs font-semibold text-accent">
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

      {/* 2. Main Role View */}
      {activePersona === "Anesu Muchirewesi" ? (
        <ManagerDashboardView
          kpis={kpis}
          cohorts={cohorts}
          bookings={bookings}
          settings={settings}
          topModules={topModules}
          labAudits={labAudits}
          onOpenAuditModal={(audit) => setEditingAudit(audit)}
          triggerNotice={triggerNotice}
        />
      ) : activePersona === "Diana Dumbu" ? (
        <DianaFacilitatorView
          cohorts={cohorts}
          bookings={bookings}
          labAudits={labAudits}
          onOpenAuditModal={(audit) => setEditingAudit(audit)}
          triggerNotice={triggerNotice}
        />
      ) : (
        <SimbaFacilitatorView
          cohorts={cohorts}
          bookings={bookings}
          labAudits={labAudits}
          onOpenAuditModal={(audit) => setEditingAudit(audit)}
          triggerNotice={triggerNotice}
        />
      )}

      {/* 3. Modal for Recording & Updating Quarterly Lab Hardware & Solar Audits */}
      {editingAudit && (
        <QuarterlyAuditModal
          audit={editingAudit}
          onClose={() => setEditingAudit(null)}
          onSave={handleSaveAudit}
        />
      )}
    </div>
  );
}

/* =========================================================================
   COMPONENT: LAB ASSET INVENTORY & SOLAR QUARTERLY AUDIT CARD
   Tracks initial laptops, functional/faulty/missing, chargers, and solar performance
   ========================================================================= */
function LabAssetAndSolarAuditCard({
  audit,
  onOpenModal,
}: {
  audit?: LabQuarterlyAudit;
  onOpenModal: (audit: LabQuarterlyAudit) => void;
}) {
  if (!audit) return null;

  const availabilityRate = Math.round(
    (audit.functionalLaptops / Math.max(1, audit.initialLaptops)) * 100
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Laptop className="size-4" />
            </span>
            <h3 className="font-display text-sm font-bold text-foreground">
              {audit.center} — Quarterly Hardware & Solar Audit
            </h3>
            <span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
              {audit.quarter}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified by {audit.auditor} on {audit.auditDate} · Status:{" "}
            <span className="font-semibold text-accent">{audit.status}</span>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Edit3 className="size-3.5 text-brand" />}
          onClick={() => onOpenModal(audit)}
          className="text-xs shrink-0"
        >
          Update Quarterly Audit
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Laptops & Chargers Asset Register */}
        <div className="space-y-3.5 rounded-xl border border-border/70 bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Laptop className="size-3.5 text-brand" />
              Laptops & Power Adapters
            </span>
            <span className="text-xs font-bold text-accent">
              {availabilityRate}% Operational
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Initial</p>
              <p className="font-display text-base font-extrabold text-foreground">{audit.initialLaptops}</p>
              <p className="text-[10px] text-muted-foreground">Baseline</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Working</p>
              <p className="font-display text-base font-extrabold text-accent">{audit.functionalLaptops}</p>
              <p className="text-[10px] text-muted-foreground">Active in Lab</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Faulty</p>
              <p className={`font-display text-base font-extrabold ${audit.faultyLaptops ? "text-amber" : "text-foreground"}`}>
                {audit.faultyLaptops}
              </p>
              <p className="text-[10px] text-muted-foreground">Under Repair</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Missing</p>
              <p className={`font-display text-base font-extrabold ${audit.missingLaptops ? "text-destructive" : "text-foreground"}`}>
                {audit.missingLaptops}
              </p>
              <p className="text-[10px] text-muted-foreground">Unaccounted</p>
            </div>
          </div>

          {/* Chargers Strip */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/15 px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <Plug className="size-3.5 text-muted-foreground" />
              <span className="font-semibold text-foreground">Chargers & Adapters:</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-accent font-semibold">{audit.functionalChargers} working</span>
              <span>·</span>
              <span className={audit.faultyChargers ? "text-amber font-semibold" : "text-muted-foreground"}>
                {audit.faultyChargers} faulty
              </span>
              <span>·</span>
              <span className={audit.missingChargers ? "text-destructive font-semibold" : "text-muted-foreground"}>
                {audit.missingChargers} missing
              </span>
            </div>
          </div>

          {/* Fault Details Log */}
          <div className="rounded-lg border border-border/60 bg-muted/10 p-2.5 text-xs">
            <p className="font-bold text-foreground text-[11px] mb-0.5 flex items-center gap-1.5">
              <Wrench className="size-3 text-brand" />
              Hardware Fault & Repair Notes:
            </p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {audit.laptopFaultDetails || "No hardware faults reported for this quarter."}
            </p>
          </div>
        </div>

        {/* Right Column: Solar Power & Energy System Monitoring */}
        <div className="space-y-3.5 rounded-xl border border-border/70 bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sun className="size-3.5 text-amber" />
              Solar & Energy Performance
            </span>
            <span className="text-xs font-bold text-accent flex items-center gap-1">
              <BatteryCharging className="size-3.5" />
              {audit.batteryHealthPct}% Battery Health
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Inverter State</p>
              <p className="font-display text-sm font-extrabold text-foreground">{audit.inverterStatus}</p>
              <p className="text-[10px] text-accent">Zero Trips</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Daily Solar Yield</p>
              <p className="font-display text-sm font-extrabold text-foreground">{audit.avgDailyYieldKwh} kWh</p>
              <p className="text-[10px] text-muted-foreground">Average</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Backup Runtime</p>
              <p className="font-display text-sm font-extrabold text-foreground">{audit.backupRuntimeHours} hrs</p>
              <p className="text-[10px] text-muted-foreground">Load Shedding</p>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2 text-xs">
            <p className="font-semibold text-foreground text-[11px]">System Specification:</p>
            <p className="text-muted-foreground text-[11px] mt-0.5">{audit.solarSystemType}</p>
          </div>

          {/* Solar Faults & Maintenance Log */}
          <div className="rounded-lg border border-border/60 bg-muted/10 p-2.5 text-xs">
            <p className="font-bold text-foreground text-[11px] mb-0.5 flex items-center gap-1.5">
              <Zap className="size-3 text-amber" />
              Solar Maintenance & Fault Log:
            </p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {audit.solarFaults || "System running normally; routine cleaning performed."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   VIEW 1: TEACHER TRAINING MANAGER (ANESU MUCHIREWESI)
   Executive Program Oversight, Simba/Diana Supervision, Warren Park Dual-Role & 3-Hub Hardware Register
   ========================================================================= */
function ManagerDashboardView({
  kpis,
  cohorts,
  bookings,
  settings,
  topModules,
  labAudits,
  onOpenAuditModal,
  triggerNotice,
}: {
  kpis: ReturnType<typeof getKpis>;
  cohorts: any[];
  bookings: any[];
  settings: any;
  topModules: any[];
  labAudits: LabQuarterlyAudit[];
  onOpenAuditModal: (a: LabQuarterlyAudit) => void;
  triggerNotice: (m: string) => void;
}) {
  const anesuWarrenParkSessions = bookings.filter((s) => s.facilitator === "Anesu Muchirewesi");
  const anesuWarrenParkCohorts = cohorts.filter((c) => c.facilitator === "Anesu Muchirewesi");
  const warrenParkAudit = labAudits.find((a) => a.center === "Warren Park Hub Lab");

  const totalInitialLaptops = labAudits.reduce((sum, a) => sum + a.initialLaptops, 0);
  const totalFunctionalLaptops = labAudits.reduce((sum, a) => sum + a.functionalLaptops, 0);
  const totalFaultyLaptops = labAudits.reduce((sum, a) => sum + a.faultyLaptops, 0);
  const totalMissingLaptops = labAudits.reduce((sum, a) => sum + a.missingLaptops, 0);

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

      {/* Cross-Hub Laptop & Solar Quarterly Health Cockpit */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Laptop className="size-4" />
              </span>
              <h2 className="font-display text-base font-bold text-foreground">
                Cross-Hub Hardware Asset & Solar Resilience Register
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Continuous quarterly monitoring across Kuwadzana, Chitungwiza, and Warren Park hubs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-border bg-muted/30 px-3 py-1 text-xs font-semibold text-foreground">
              Total Hardware: <strong className="text-accent">{totalFunctionalLaptops}</strong> / {totalInitialLaptops} Operational
            </span>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Total Initial Laptops</p>
            <p className="font-display text-xl font-extrabold text-foreground">{totalInitialLaptops}</p>
            <p className="text-[10px] text-muted-foreground">Allocated across 3 hubs</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Currently Functional</p>
            <p className="font-display text-xl font-extrabold text-accent">{totalFunctionalLaptops}</p>
            <p className="text-[10px] text-accent">95.7% Availability</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Reported Faults</p>
            <p className="font-display text-xl font-extrabold text-amber">{totalFaultyLaptops}</p>
            <p className="text-[10px] text-muted-foreground">Logged for IT repair</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Missing Units</p>
            <p className="font-display text-xl font-extrabold text-foreground">{totalMissingLaptops}</p>
            <p className="text-[10px] text-accent">100% Accounted For</p>
          </div>
        </div>

        {/* Hub-by-Hub Summary Cards */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {labAudits.map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-background p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="font-display text-xs font-bold text-foreground">{a.center.replace(" Hub Lab", "")}</span>
                  <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                    {a.quarter}
                  </span>
                </div>
                <div className="mt-2.5 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Laptops:</span>
                    <span className="font-semibold text-foreground">
                      {a.functionalLaptops} / {a.initialLaptops} working
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Faults:</span>
                    <span className={a.faultyLaptops ? "font-semibold text-amber" : "text-muted-foreground"}>
                      {a.faultyLaptops} ({a.faultyChargers} chargers)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Solar Battery:</span>
                    <span className="font-semibold text-accent">{a.batteryHealthPct}% health ({a.backupRuntimeHours}h runtime)</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Auditor: {a.auditor}</span>
                <button
                  type="button"
                  onClick={() => onOpenAuditModal(a)}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Edit Audit →
                </button>
              </div>
            </div>
          ))}
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
                      4.96 Rating
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Resident Facilitator · Chitungwiza Hub Lab
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
                <p className="text-[10px] text-muted-foreground">92% pass rate</p>
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
                      4.86 Rating
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Resident Facilitator · Kuwadzana Hub Lab
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
                <p className="text-[10px] text-muted-foreground">91% pass rate</p>
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

        {/* Warren Park Asset & Solar Card */}
        {warrenParkAudit && (
          <div className="mt-4">
            <LabAssetAndSolarAuditCard audit={warrenParkAudit} onOpenModal={onOpenAuditModal} />
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   VIEW 2: DIANA DUMBU — RESIDENT FACILITATOR (CHITUNGWIZA HUB LAB)
   ========================================================================= */
function DianaFacilitatorView({
  cohorts,
  bookings,
  labAudits,
  onOpenAuditModal,
  triggerNotice,
}: {
  cohorts: any[];
  bookings: any[];
  labAudits: LabQuarterlyAudit[];
  onOpenAuditModal: (a: LabQuarterlyAudit) => void;
  triggerNotice: (m: string) => void;
}) {
  const mySessions = bookings.filter((s) => s.facilitator === "Diana Dumbu");
  const myCohorts = cohorts.filter((c) => c.facilitator === "Diana Dumbu");
  const chitungwizaAudit = labAudits.find((a) => a.center === "Chitungwiza Hub Lab");

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
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Teaching Output</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-foreground">48 hrs</p>
          <p className="mt-1.5 text-[11px] font-semibold text-brand">22 sessions logged (Term 3)</p>
        </div>

        <div className="glass rounded-xl p-5 border-l-4 border-l-accent">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Educator Rating</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-accent">
            4.96<span className="text-sm font-normal text-muted-foreground">/5.0</span>
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
          <p className="mt-1.5 text-[11px] font-semibold text-brand">38 1-on-1 mentorship clinics</p>
        </div>
      </div>

      {/* Quarterly Lab Hardware & Solar Audit Card for Chitungwiza */}
      {chitungwizaAudit && (
        <LabAssetAndSolarAuditCard audit={chitungwizaAudit} onOpenModal={onOpenAuditModal} />
      )}

      {/* Timetable & Cohorts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
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
   VIEW 3: SIMBA — RESIDENT FACILITATOR (KUWADZANA HUB LAB)
   ========================================================================= */
function SimbaFacilitatorView({
  cohorts,
  bookings,
  labAudits,
  onOpenAuditModal,
  triggerNotice,
}: {
  cohorts: any[];
  bookings: any[];
  labAudits: LabQuarterlyAudit[];
  onOpenAuditModal: (a: LabQuarterlyAudit) => void;
  triggerNotice: (m: string) => void;
}) {
  const mySessions = bookings.filter((s) => s.facilitator === "Simba");
  const myCohorts = cohorts.filter((c) => c.facilitator === "Simba");
  const kuwadzanaAudit = labAudits.find((a) => a.center === "Kuwadzana Hub Lab");

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
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Teaching Output</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-foreground">44 hrs</p>
          <p className="mt-1.5 text-[11px] font-semibold text-brand">20 sessions logged (Term 3)</p>
        </div>

        <div className="glass rounded-xl p-5 border-l-4 border-l-accent">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Educator Rating</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-accent">
            4.86<span className="text-sm font-normal text-muted-foreground">/5.0</span>
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
          <p className="mt-1.5 text-[11px] font-semibold text-brand">42 1-on-1 coding clinics</p>
        </div>
      </div>

      {/* Quarterly Lab Hardware & Solar Audit Card for Kuwadzana */}
      {kuwadzanaAudit && (
        <LabAssetAndSolarAuditCard audit={kuwadzanaAudit} onOpenModal={onOpenAuditModal} />
      )}

      {/* Timetable & Cohorts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
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

/* =========================================================================
   MODAL: RECORD & UPDATE QUARTERLY HARDWARE & SOLAR AUDIT
   Allows recording initial allocation, continuous quarterly counts, faults, and solar health
   ========================================================================= */
function QuarterlyAuditModal({
  audit,
  onClose,
  onSave,
}: {
  audit: LabQuarterlyAudit;
  onClose: () => void;
  onSave: (audit: LabQuarterlyAudit) => void;
}) {
  const [form, setForm] = useState<LabQuarterlyAudit>({ ...audit });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              Quarterly Lab Hardware & Solar Audit
            </h2>
            <p className="text-xs text-muted-foreground">
              {form.center} · Audit Quarter: {form.quarter}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Audit Quarter
              </label>
              <select
                value={form.quarter}
                onChange={(e) => setForm({ ...form, quarter: e.target.value })}
                className="field text-xs font-semibold"
              >
                <option value="Q3 2026">Q3 2026</option>
                <option value="Q4 2026">Q4 2026</option>
                <option value="Q1 2027">Q1 2027</option>
                <option value="Q2 2027">Q2 2027</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Audit Date
              </label>
              <input
                type="text"
                value={form.auditDate}
                onChange={(e) => setForm({ ...form, auditDate: e.target.value })}
                className="field text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Auditor Name
              </label>
              <input
                type="text"
                value={form.auditor}
                onChange={(e) => setForm({ ...form, auditor: e.target.value })}
                className="field text-xs font-semibold"
              />
            </div>
          </div>

          {/* Section: Laptop Inventory */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
              <Laptop className="size-3.5" />
              Laptops Asset Tracking
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Initial Allocation
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.initialLaptops}
                  onChange={(e) => setForm({ ...form, initialLaptops: Number(e.target.value) })}
                  className="field text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Functional Laptops
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.functionalLaptops}
                  onChange={(e) => setForm({ ...form, functionalLaptops: Number(e.target.value) })}
                  className="field text-xs font-bold text-accent"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Faulty Laptops
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.faultyLaptops}
                  onChange={(e) => setForm({ ...form, faultyLaptops: Number(e.target.value) })}
                  className="field text-xs font-bold text-amber"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Missing Laptops
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.missingLaptops}
                  onChange={(e) => setForm({ ...form, missingLaptops: Number(e.target.value) })}
                  className="field text-xs font-bold text-destructive"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Laptop Fault Details (screens, keyboards, operating system, boot issues)
              </label>
              <textarea
                rows={2}
                value={form.laptopFaultDetails}
                onChange={(e) => setForm({ ...form, laptopFaultDetails: e.target.value })}
                className="field text-xs"
                placeholder="Describe any faulty laptops and required repairs..."
              />
            </div>
          </div>

          {/* Section: Chargers */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
              <Plug className="size-3.5" />
              Power Adapters & Chargers
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Working Chargers
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.functionalChargers}
                  onChange={(e) => setForm({ ...form, functionalChargers: Number(e.target.value) })}
                  className="field text-xs font-bold text-accent"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Faulty Chargers
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.faultyChargers}
                  onChange={(e) => setForm({ ...form, faultyChargers: Number(e.target.value) })}
                  className="field text-xs font-bold text-amber"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Missing Chargers
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.missingChargers}
                  onChange={(e) => setForm({ ...form, missingChargers: Number(e.target.value) })}
                  className="field text-xs font-bold text-destructive"
                />
              </div>
            </div>
          </div>

          {/* Section: Solar Performance */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-amber flex items-center gap-1.5">
              <Sun className="size-3.5" />
              Solar & Energy System Performance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Inverter State
                </label>
                <select
                  value={form.inverterStatus}
                  onChange={(e) => setForm({ ...form, inverterStatus: e.target.value as any })}
                  className="field text-xs font-semibold"
                >
                  <option value="Optimal">Optimal</option>
                  <option value="Operational">Operational</option>
                  <option value="Warning">Warning (Tripped)</option>
                  <option value="Faulty">Faulty (Needs Service)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Battery Health (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.batteryHealthPct}
                  onChange={(e) => setForm({ ...form, batteryHealthPct: Number(e.target.value) })}
                  className="field text-xs font-bold text-accent"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Backup Runtime (hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.backupRuntimeHours}
                  onChange={(e) => setForm({ ...form, backupRuntimeHours: Number(e.target.value) })}
                  className="field text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Solar Faults & Maintenance Log
              </label>
              <textarea
                rows={2}
                value={form.solarFaults}
                onChange={(e) => setForm({ ...form, solarFaults: e.target.value })}
                className="field text-xs"
                placeholder="Log any inverter trips, battery alerts, panel cleaning or repairs..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <Button type="submit" size="sm" icon={<Check className="size-3.5" />}>
              Save Quarterly Audit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
