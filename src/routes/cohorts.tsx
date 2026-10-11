import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  UsersRound,
  MapPin,
  UserCheck,
  BookOpen,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";

import { PageHeading } from "@/components/PageHeading";
import { TierPill } from "@/components/StatusPill";
import { LAB_CENTERS, modules, type Tier } from "@/data/mis";
import { useTraining } from "@/lib/training-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cohorts")({
  head: () => ({
    meta: [
      { title: "Teacher Classes & Enrolment | TutorTrack" },
      {
        name: "description",
        content:
          "Manage teacher training classes, educator enrolment, hub lab allocations and module completion across Kuwadzana, Chitungwiza, and Warren Park.",
      },
      { property: "og:title", content: "Teacher Classes & Enrolment | TutorTrack" },
      {
        property: "og:description",
        content: "Educator training classes, lab allocations, attendance and module progression.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CohortsPage,
});

const tierFilters: ("All" | Tier)[] = ["All", "Infants", "Middle Junior", "Upper Junior"];
const centerFilters = ["All Hubs", ...LAB_CENTERS] as const;

const STAFF_COORDINATORS = [
  "Diana Dumbu",
  "Simba",
  "Anesu Muchirewesi",
] as const;

export function CohortsPage() {
  const { cohorts: rows, updateCohort, addCohort, settings } = useTraining();
  const [tierFilter, setTierFilter] = useState<"All" | Tier>("All");
  const [centerFilter, setCenterFilter] = useState<string>("All Hubs");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const totalEducators = rows.reduce((acc, c) => acc + (c.educators || 0), 0);
  const avgAttendance = rows.length
    ? Math.round(rows.reduce((acc, c) => acc + c.attendance, 0) / rows.length)
    : 0;
  const avgModulesDone = rows.length
    ? (rows.reduce((acc, c) => acc + c.modulesDone, 0) / rows.length).toFixed(1)
    : "0";

  const visible = rows.filter((c) => {
    const matchesTier = tierFilter === "All" || c.tier === tierFilter;
    const matchesCenter = centerFilter === "All Hubs" || c.center === centerFilter;
    const term = query.toLowerCase();
    const matchesSearch =
      !term ||
      c.name.toLowerCase().includes(term) ||
      c.center.toLowerCase().includes(term) ||
      (c.facilitator && c.facilitator.toLowerCase().includes(term));
    return matchesTier && matchesCenter && matchesSearch;
  });

  async function handleSaveCohort(form: FormData) {
    if (!editing) return;
    const attendance = Number(form.get("attendance"));
    const modulesDone = Number(form.get("modulesDone"));
    const educators = Number(form.get("educators"));
    const facilitator = String(form.get("facilitator") || "Simba");

    await updateCohort(editing, { attendance, modulesDone, educators, facilitator });
    setEditing(null);
    setStatusMsg("Class details saved and synced with Neon database.");
    setTimeout(() => setStatusMsg(""), 3500);
  }

  async function handleCreateCohort(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name")).trim();
    const tier = form.get("tier") as Tier;
    const center = String(form.get("center"));
    const educators = Number(form.get("educators")) || 25;
    const facilitator = String(form.get("facilitator") || "Simba");

    await addCohort({
      name,
      tier,
      center,
      educators,
      facilitator,
    });

    setShowAddModal(false);
    setStatusMsg(`Class "${name}" successfully enrolled into ${center}.`);
    setTimeout(() => setStatusMsg(""), 4000);
  }

  return (
    <>
      <PageHeading
        eyebrow="Program Participants & Enrolment"
        title="Teacher Classes"
        meta={`${totalEducators} enrolled educators across ${rows.length} classes · 3 Innovation Hub Labs`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              asChild
              className="text-xs font-semibold"
            >
              <Link to="/assessments">
                <Award className="size-3.5 mr-1 text-accent" />
                View Assessment Results
              </Link>
            </Button>
            <Button
              icon={<Plus className="size-4" />}
              onClick={() => setShowAddModal(!showAddModal)}
              className="text-xs font-semibold"
            >
              Enrol New Class
            </Button>
          </div>
        }
      />

      {statusMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-xs font-semibold text-accent animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Top Program Metrics */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-ink/45">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Enrolled Educators</span>
            <UsersRound className="size-4 text-brand" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold">{totalEducators}</p>
          <p className="text-[11px] text-accent mt-0.5 font-medium">Active in Term 3</p>
        </div>

        <div className="glass rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-ink/45">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Classes</span>
            <BookOpen className="size-4 text-accent" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold">{rows.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Across 3 Hub Labs</p>
        </div>

        <div className="glass rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-ink/45">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Attendance</span>
            <TrendingUp className="size-4 text-accent" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold">{avgAttendance}%</p>
          <p className={`text-[11px] mt-0.5 font-medium ${avgAttendance >= settings.attendanceTarget ? "text-accent" : "text-amber"}`}>
            Target: ≥{settings.attendanceTarget}%
          </p>
        </div>

        <div className="glass rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-ink/45">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Modules Done</span>
            <Award className="size-4 text-brand" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold">{avgModulesDone} <span className="text-sm font-normal text-ink/40">/ 8</span></p>
          <p className="text-[11px] text-brand mt-0.5 font-medium">ICT Curriculum Track</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tier Filter */}
          <div className="glass flex items-center gap-1 rounded-xl p-1">
            {tierFilters.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTierFilter(tf)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  tierFilter === tf
                    ? "bg-brand text-brand-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Hub Center Filter */}
          <select
            value={centerFilter}
            onChange={(e) => setCenterFilter(e.target.value)}
            className="glass rounded-xl px-3 py-1.5 text-xs font-medium text-foreground outline-hidden"
          >
            {centerFilters.map((cf) => (
              <option key={cf} value={cf}>
                {cf}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <label className="glass flex items-center gap-2 rounded-xl px-3 py-1.5">
          <Search className="size-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search class or lab..."
            className="w-40 bg-transparent text-xs text-foreground outline-hidden placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {/* Enrol Class Modal / Form */}
      {showAddModal && (
        <form
          onSubmit={handleCreateCohort}
          className="mt-4 glass rounded-xl p-5 border border-brand/30 shadow-md animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
              <UsersRound className="size-4 text-brand" />
              Enrol New Teacher Class
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-xs font-semibold sm:col-span-2">
              Class Name
              <input
                name="name"
                required
                placeholder="e.g. Infants Class G (ECD–Gr2)"
                className="field mt-1 w-full text-xs"
              />
            </label>

            <label className="text-xs font-semibold">
              Teaching Band (Tier)
              <select name="tier" required className="field mt-1 w-full text-xs">
                <option value="Infants">Infants (ECD–Gr2)</option>
                <option value="Middle Junior">Middle Junior (Gr3–Gr4)</option>
                <option value="Upper Junior">Upper Junior (Gr5–Gr7)</option>
              </select>
            </label>

            <label className="text-xs font-semibold">
              Host Hub Lab
              <select name="center" required className="field mt-1 w-full text-xs">
                {LAB_CENTERS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className="text-xs font-semibold">
              Educators Enrolled
              <input
                name="educators"
                type="number"
                min="5"
                max="60"
                defaultValue={28}
                required
                className="field mt-1 w-full text-xs"
              />
            </label>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
            <label className="text-xs font-semibold flex items-center gap-2">
              <span>Assigned Coordinator:</span>
              <select name="facilitator" defaultValue="Diana Dumbu" className="field py-1 text-xs">
                {STAFF_COORDINATORS.map((sc) => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
            </label>
            <Button type="submit" size="sm">
              Save & Enrol Class
            </Button>
          </div>
        </form>
      )}

      {/* Main Grid: Classes List & Side Details */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Class Cards */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-foreground">
              Enrolled Classes ({visible.length})
            </h2>
            <span className="text-xs text-muted-foreground">
              Term 3 2026 Programme Register
            </span>
          </div>

          {visible.map((cohort) => {
            const isAttendanceOnTarget = cohort.attendance >= settings.attendanceTarget;
            const progressPercent = Math.round((cohort.modulesDone / 8) * 100);

            return (
              <div
                key={cohort.id}
                className="glass rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-[15px] font-bold text-foreground">
                        {cohort.name}
                      </h3>
                      <TierPill tier={cohort.tier} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <MapPin className="size-3.5 text-brand" />
                        {cohort.center}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <UsersRound className="size-3.5" />
                        {cohort.educators} school teachers
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="size-3.5 text-accent" />
                        Coordinator: {cohort.facilitator || "Simba"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        isAttendanceOnTarget
                          ? "bg-accent/10 text-accent border border-accent/20"
                          : "bg-amber/10 text-amber border border-amber/20"
                      }`}
                    >
                      {isAttendanceOnTarget ? (
                        <>
                          <CheckCircle2 className="size-3" />
                          Attendance on target
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="size-3" />
                          Attendance follow-up
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 pt-3 border-t border-border/40">
                  {/* Attendance */}
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">Class Attendance</span>
                      <span className="font-display font-bold text-foreground">{cohort.attendance}%</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isAttendanceOnTarget ? "bg-accent" : "bg-amber"
                        }`}
                        style={{ width: `${cohort.attendance}%` }}
                      />
                    </div>
                  </div>

                  {/* Modules Complete */}
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">
                        ICT Modules Completed ({cohort.modulesDone}/8)
                      </span>
                      <span className="font-display font-bold text-brand">{progressPercent}%</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Module Pill Track */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-[11px] font-medium text-muted-foreground mr-1">Modules:</span>
                  {modules.map((m, idx) => {
                    const isCompleted = idx < cohort.modulesDone;
                    return (
                      <span
                        key={m.code}
                        title={`${m.code}: ${m.name} (${isCompleted ? "Completed" : "Pending"})`}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                          isCompleted
                            ? "bg-brand/20 text-brand border border-brand/30"
                            : "bg-muted/40 text-muted-foreground/60 border border-border/40"
                        }`}
                      >
                        {m.code}
                      </span>
                    );
                  })}
                </div>

                {/* Action Row */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setEditing(editing === cohort.id ? null : cohort.id)}
                  >
                    {editing === cohort.id ? "Close Editor" : "Edit Class Roster & Attendance"}
                  </Button>

                  <Link
                    to="/assessments"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                  >
                    View Diagnostic Assessment Scores
                    <ArrowRight className="size-3" />
                  </Link>
                </div>

                {/* Inline Editing Drawer */}
                {editing === cohort.id && (
                  <form
                    action={handleSaveCohort}
                    className="mt-3 rounded-lg border border-border bg-card/60 p-4 animate-in fade-in"
                  >
                    <p className="text-xs font-bold text-foreground">Update Roster & Attendance: {cohort.name}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <label className="text-xs font-semibold">
                        Attendance %
                        <input
                          name="attendance"
                          type="number"
                          min="0"
                          max="100"
                          required
                          defaultValue={cohort.attendance}
                          className="field mt-1 text-xs"
                        />
                      </label>
                      <label className="text-xs font-semibold">
                        Modules Done (0-8)
                        <input
                          name="modulesDone"
                          type="number"
                          min="0"
                          max="8"
                          required
                          defaultValue={cohort.modulesDone}
                          className="field mt-1 text-xs"
                        />
                      </label>
                      <label className="text-xs font-semibold">
                        Educator Count
                        <input
                          name="educators"
                          type="number"
                          min="1"
                          max="80"
                          required
                          defaultValue={cohort.educators}
                          className="field mt-1 text-xs"
                        />
                      </label>
                      <label className="text-xs font-semibold">
                        Facilitator
                        <select
                          name="facilitator"
                          defaultValue={cohort.facilitator || "Simba"}
                          className="field mt-1 text-xs"
                        >
                          {STAFF_COORDINATORS.map((sc) => (
                            <option key={sc} value={sc}>{sc}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}

          {visible.length === 0 && (
            <div className="glass rounded-xl p-8 text-center">
              <UsersRound className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-semibold text-foreground">No classes match this filter</p>
              <p className="text-xs text-muted-foreground">Try selecting "All Hubs" or clearing search terms.</p>
            </div>
          )}
        </div>

        {/* Sidebar Info Panels */}
        <div className="space-y-5">
          {/* Hub Lab Allocation Card */}
          <div className="glass rounded-xl p-5 shadow-xs">
            <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
              <MapPin className="size-4 text-brand" />
              Innovation Hub Labs
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Educators allocated per Uncommon tech lab center
            </p>

            <div className="mt-4 space-y-3">
              {LAB_CENTERS.map((lab) => {
                const labCohorts = rows.filter((c) => c.center === lab);
                const count = labCohorts.reduce((acc, c) => acc + c.educators, 0);
                const labAvgAtt = labCohorts.length
                  ? Math.round(labCohorts.reduce((acc, c) => acc + c.attendance, 0) / labCohorts.length)
                  : 0;

                return (
                  <div key={lab} className="rounded-lg border border-border/70 bg-card/60 p-3">
                    <div className="flex items-center justify-between font-semibold text-xs">
                      <span>{lab}</span>
                      <span className="font-display font-bold text-brand">{count} teachers</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{labCohorts.length} classes active</span>
                      <span>Avg attendance: {labAvgAtt}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Training Team Card */}
          <div className="glass rounded-xl p-5 shadow-xs">
            <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
              <UserCheck className="size-4 text-accent" />
              Teacher Training Team
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Uncommon.org program leadership & lab coordinators
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-card/40 p-2.5">
                <div>
                  <p className="font-semibold text-foreground">Anesu Muchirewesi</p>
                  <p className="text-[11px] text-muted-foreground">Teacher Training Manager</p>
                </div>
                <span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                  Lead
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-card/40 p-2.5">
                <div>
                  <p className="font-semibold text-foreground">Diana Dumbu</p>
                  <p className="text-[11px] text-muted-foreground">Teacher Training Coordinator</p>
                </div>
                <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                  Coordinator
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-card/40 p-2.5">
                <div>
                  <p className="font-semibold text-foreground">Simba</p>
                  <p className="text-[11px] text-muted-foreground">Teacher Training Coordinator</p>
                </div>
                <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                  Coordinator
                </span>
              </div>
            </div>
          </div>

          {/* Curriculum Track Card */}
          <div className="glass rounded-xl p-5 shadow-xs">
            <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
              <BookOpen className="size-4 text-brand" />
              National ICT Curriculum Modules
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Average teacher progression across 8 practical modules
            </p>

            <div className="mt-4 space-y-3">
              {modules.map((m) => (
                <div key={m.code}>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="truncate pr-2 font-semibold">
                      {m.code} · {m.name}
                    </span>
                    <span className="shrink-0 text-muted-foreground">{m.completion}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        m.completion >= 85 ? "bg-brand" : m.completion >= 70 ? "bg-accent" : "bg-amber"
                      }`}
                      style={{ width: `${m.completion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
