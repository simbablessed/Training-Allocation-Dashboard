import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Award,
  Download,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Search,
  Check,
  Edit3,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import { PageHeading } from "@/components/PageHeading";
import { TierPill } from "@/components/StatusPill";
import { LAB_CENTERS, type Tier } from "@/data/mis";
import { useTraining } from "@/lib/training-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/assessments")({
  head: () => ({
    meta: [
      { title: "Assessment Results & Competency Diagnostics | TutorTrack" },
      {
        name: "description",
        content:
          "Diagnostic pre-test and post-test assessment outcomes, teacher competency gains, and certification readiness across Kuwadzana, Chitungwiza, and Warren Park Hub Labs.",
      },
      {
        property: "og:title",
        content: "Assessment Results & Competency Diagnostics | TutorTrack",
      },
      {
        property: "og:description",
        content:
          "Diagnostic pre-test and post-test assessment outcomes, teacher competency gains, and certification readiness.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssessmentsPage,
});

const tierFilters: ("All" | Tier)[] = ["All", "Infants", "Middle Junior", "Upper Junior"];
const centerFilters = ["All Hubs", ...LAB_CENTERS] as const;

// Domain rubrics mapped to the 8 curriculum modules
const MODULE_RUBRICS = [
  { code: "M1", title: "ICT Tools & Productivity", pre: 44, post: 94, domain: "Foundational Tools" },
  { code: "M2", title: "Digital Content & Publishing", pre: 38, post: 82, domain: "Lesson Design" },
  { code: "M3", title: "Software & Operating Systems", pre: 40, post: 88, domain: "Technical Competence" },
  { code: "M4", title: "Safety, Ethics & Child Protection", pre: 52, post: 79, domain: "Digital Citizenship" },
  { code: "M5", title: "Web Collaboration & Classroom Tools", pre: 35, post: 71, domain: "Pedagogy" },
  { code: "M6", title: "ICT Enterprise & School STEAM", pre: 31, post: 68, domain: "Innovation" },
  { code: "M7", title: "Coding Logic & Scratch for Kids", pre: 28, post: 76, domain: "Computer Science" },
  { code: "M8", title: "School Networks & Offline LMS", pre: 30, post: 63, domain: "Infrastructure" },
];

export function AssessmentsPage() {
  const { cohorts, updateCohort, settings, uploadReportToR2 } = useTraining();
  const [tierFilter, setTierFilter] = useState<"All" | Tier>("All");
  const [centerFilter, setCenterFilter] = useState<string>("All Hubs");
  const [statusFilter, setStatusFilter] = useState<"All" | "Distinction" | "Proficient" | "Remediation">("All");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const totalCohorts = cohorts.length;
  const avgPre = totalCohorts
    ? Math.round(cohorts.reduce((acc, c) => acc + c.pre, 0) / totalCohorts)
    : 0;
  const avgPost = totalCohorts
    ? Math.round(cohorts.reduce((acc, c) => acc + c.post, 0) / totalCohorts)
    : 0;
  const avgDelta = avgPost - avgPre;
  const percentageGain = avgPre ? Math.round((avgDelta / avgPre) * 100) : 0;

  const certifiedCount = cohorts.filter((c) => c.post >= settings.scoreTarget).length;
  const certifiedRate = totalCohorts ? Math.round((certifiedCount / totalCohorts) * 100) : 0;
  const distinctionCount = cohorts.filter((c) => c.post >= 80).length;
  const remediationCount = cohorts.filter((c) => c.post < settings.scoreTarget).length;

  const filteredCohorts = cohorts.filter((c) => {
    const matchesTier = tierFilter === "All" || c.tier === tierFilter;
    const matchesCenter = centerFilter === "All Hubs" || c.center === centerFilter;
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.center.toLowerCase().includes(query.toLowerCase());

    const isDistinction = c.post >= 80;
    const isProficient = c.post >= settings.scoreTarget && c.post < 80;
    const isRemediation = c.post < settings.scoreTarget;

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Distinction" && isDistinction) ||
      (statusFilter === "Proficient" && isProficient) ||
      (statusFilter === "Remediation" && isRemediation);

    return matchesTier && matchesCenter && matchesSearch && matchesStatus;
  });

  async function handleSaveScores(form: FormData) {
    if (!editingId) return;
    const pre = Number(form.get("pre"));
    const post = Number(form.get("post"));

    await updateCohort(editingId, { pre, post });
    setEditingId(null);
    setToastMsg("Assessment scores updated and saved to Neon Postgres.");
    setTimeout(() => setToastMsg(""), 3500);
  }

  async function handleExportGazette() {
    const rows = [
      ["Class", "Tier", "Innovation Hub Lab", "Facilitator", "Enrolled Educators", "Pre-Test Score", "Post-Test Score", "Competency Delta", "Certification Status"],
      ...cohorts.map((c) => [
        c.name,
        c.tier,
        c.center,
        c.facilitator || "Simba",
        c.educators,
        c.pre,
        c.post,
        `+${c.post - c.pre}`,
        c.post >= 80 ? "Distinction" : c.post >= settings.scoreTarget ? "Certified Proficient" : "Remediation Required",
      ]),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");

    try {
      await uploadReportToR2("assessment-gazette", "Educator Assessment Results Gazette", "Term 3 2026", "Assessment Report", csv);
      setToastMsg("Assessment Gazette archived to Cloudflare R2.");
      setTimeout(() => setToastMsg(""), 3500);
    } catch (err) {
      console.warn("Could not archive to R2:", err);
    }

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tutortrack-assessment-results-gazette.csv";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <>
      <PageHeading
        eyebrow="Quality & Monitoring"
        title="Assessment Results"
        meta="Diagnostic pre-test baseline vs. post-test competency outcomes · Term 3 2026"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={<Download className="size-4" />}
              onClick={handleExportGazette}
              className="text-xs font-semibold"
            >
              Export Results Gazette
            </Button>
          </div>
        }
      />

      {toastMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-xs font-semibold text-accent animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Primary Assessment KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Competency Uplift Card */}
        <div className="glass rounded-xl p-5 shadow-xs border-l-4 border-l-accent">
          <div className="flex items-center justify-between text-ink/45">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Competency Uplift</span>
            <TrendingUp className="size-4 text-accent" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="font-display text-3xl font-bold text-accent">+{avgDelta} <span className="text-base text-ink/40">pts</span></p>
          </div>
          <p className="text-[11px] font-semibold text-accent mt-1">
            Baseline {avgPre} → Certified {avgPost} (+{percentageGain}% gain)
          </p>
        </div>

        {/* Certification Readiness */}
        <div className="glass rounded-xl p-5 shadow-xs border-l-4 border-l-brand">
          <div className="flex items-center justify-between text-ink/45">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Certification Readiness</span>
            <GraduationCap className="size-4 text-brand" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold">{certifiedRate}%</p>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
            <div className="h-full rounded-full bg-brand" style={{ width: `${certifiedRate}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {certifiedCount} of {totalCohorts} classes meet target (≥{settings.scoreTarget} pts)
          </p>
        </div>

        {/* Distinction Rate */}
        <div className="glass rounded-xl p-5 shadow-xs border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-ink/45">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Exemplary Mastery</span>
            <Sparkles className="size-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold">{distinctionCount} <span className="text-sm font-normal text-ink/40">classes</span></p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            Scoring ≥80 points on practical evaluation
          </p>
        </div>

        {/* Remediation Follow-up */}
        <div className="glass rounded-xl p-5 shadow-xs border-l-4 border-l-amber">
          <div className="flex items-center justify-between text-ink/45">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Remediation Priority</span>
            <AlertTriangle className="size-4 text-amber" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-amber">{remediationCount}</p>
          <p className="text-[11px] text-amber mt-1 font-medium">
            {remediationCount > 0 ? "Requires extra hands-on lab sessions" : "All classes on track"}
          </p>
        </div>
      </div>

      {/* Filter and Query Strip */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tier Filters */}
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="glass rounded-xl px-3 py-1.5 text-xs font-medium text-foreground outline-hidden"
          >
            <option value="All">All Evaluation Outcomes</option>
            <option value="Distinction">Distinction (≥80 pts)</option>
            <option value="Proficient">Certified Proficient (70–79 pts)</option>
            <option value="Remediation">Remediation Needed (&lt;70 pts)</option>
          </select>
        </div>

        {/* Search */}
        <label className="glass flex items-center gap-2 rounded-xl px-3 py-1.5">
          <Search className="size-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search class or hub..."
            className="w-40 bg-transparent text-xs text-foreground outline-hidden placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {/* Main Layout: Assessment Cards & Module Diagnostics */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Class Assessment Cards */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-foreground">
              Class Competency Evaluations ({filteredCohorts.length})
            </h2>
            <span className="text-xs text-muted-foreground">
              Pre-Test Diagnostic vs Post-Test Certification
            </span>
          </div>

          {filteredCohorts.map((cohort) => {
            const delta = cohort.post - cohort.pre;
            const pctGain = cohort.pre ? Math.round((delta / cohort.pre) * 100) : 0;
            const isDistinction = cohort.post >= 80;
            const isProficient = cohort.post >= settings.scoreTarget && !isDistinction;
            const isRemediation = cohort.post < settings.scoreTarget;

            return (
              <div
                key={cohort.id}
                className="glass rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-[15px] font-bold text-foreground">
                        {cohort.name}
                      </h3>
                      <TierPill tier={cohort.tier} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {cohort.center} • {cohort.educators} educators evaluated • Coordinator: {cohort.facilitator || "Simba"}
                    </p>
                  </div>

                  {/* Outcome Badge */}
                  <div>
                    {isDistinction && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="size-3.5" />
                        Distinction (Mastery)
                      </span>
                    )}
                    {isProficient && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                        <Check className="size-3.5" />
                        Certified Proficient
                      </span>
                    )}
                    {isRemediation && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs font-bold text-amber">
                        <AlertTriangle className="size-3.5" />
                        Remediation Required
                      </span>
                    )}
                  </div>
                </div>

                {/* Score Comparison Bars */}
                <div className="mt-5 rounded-xl bg-card/60 border border-border/70 p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-center">
                    {/* Pre-Test Baseline */}
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-muted-foreground">Diagnostic Pre-Test</span>
                        <span className="font-display font-bold text-foreground">{cohort.pre} / 100</span>
                      </div>
                      <div className="mt-1.5 h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-muted-foreground/60"
                          style={{ width: `${cohort.pre}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">Baseline ICT assessment</p>
                    </div>

                    {/* Post-Test Outcome */}
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">Post-Test Certification</span>
                        <span className="font-display font-bold text-accent">{cohort.post} / 100</span>
                      </div>
                      <div className="mt-1.5 h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isRemediation ? "bg-amber" : "bg-accent"}`}
                          style={{ width: `${cohort.post}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Passing benchmark: {settings.scoreTarget}%
                      </p>
                    </div>

                    {/* Delta Point Gain */}
                    <div className="rounded-lg bg-background/80 p-3 text-center border border-border/50">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                        Net Competency Gain
                      </p>
                      <p className="mt-0.5 font-display text-xl font-bold text-accent">
                        +{delta} pts
                      </p>
                      <p className="text-[10px] font-semibold text-accent">
                        ▲ {pctGain}% uplift
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer and Edit trigger */}
                <div className="mt-4 flex items-center justify-between pt-2">
                  <span className="text-[11px] text-muted-foreground">
                    Attendance requirement: {cohort.attendance}% ({cohort.attendance >= settings.attendanceTarget ? "Met" : "Below target"})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit3 className="size-3.5" />}
                    onClick={() => setEditingId(editingId === cohort.id ? null : cohort.id)}
                    className="text-xs font-semibold"
                  >
                    {editingId === cohort.id ? "Close Editor" : "Enter / Edit Scores"}
                  </Button>
                </div>

                {/* Inline Score Entry Form */}
                {editingId === cohort.id && (
                  <form
                    action={handleSaveScores}
                    className="mt-4 rounded-xl border border-brand/30 bg-muted/30 p-4 animate-in fade-in"
                  >
                    <p className="text-xs font-bold text-foreground">
                      Record Assessment Scores: {cohort.name}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-2">
                      <label className="text-xs font-semibold">
                        Diagnostic Pre-Test Score (0–100)
                        <input
                          name="pre"
                          type="number"
                          min="0"
                          max="100"
                          required
                          defaultValue={cohort.pre}
                          className="field mt-1 text-xs"
                        />
                      </label>
                      <label className="text-xs font-semibold">
                        Practical Post-Test Score (0–100)
                        <input
                          name="post"
                          type="number"
                          min="0"
                          max="100"
                          required
                          defaultValue={cohort.post}
                          className="field mt-1 text-xs"
                        />
                      </label>
                    </div>

                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm">
                        Save to Neon Postgres
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}

          {filteredCohorts.length === 0 && (
            <div className="glass rounded-xl p-8 text-center">
              <Award className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-semibold text-foreground">No assessment records found</p>
              <p className="text-xs text-muted-foreground">Try clearing filters or search keywords.</p>
            </div>
          )}
        </div>

        {/* Sidebar Diagnostics: Rubrics & Certification Criteria */}
        <div className="space-y-5">
          {/* Curriculum Diagnostic Matrix */}
          <div className="glass rounded-xl p-5 shadow-xs">
            <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
              <Award className="size-4 text-brand" />
              Module Competency Rubric
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Pre vs. Post test mastery across curriculum domains
            </p>

            <div className="mt-4 space-y-3.5">
              {MODULE_RUBRICS.map((mod) => {
                const gain = mod.post - mod.pre;
                return (
                  <div key={mod.code} className="rounded-lg bg-card/50 p-2.5 border border-border/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {mod.code} · {mod.title}
                      </span>
                      <span className="font-display font-bold text-accent">+{gain} pts</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>Baseline: {mod.pre}%</span>
                      <span>→</span>
                      <span className="font-semibold text-foreground">Outcome: {mod.post}%</span>
                    </div>

                    <div className="mt-1.5 flex h-2 w-full gap-1 rounded-full bg-muted/60 overflow-hidden">
                      <div className="h-full bg-muted-foreground/50 rounded-l" style={{ width: `${mod.pre}%` }} />
                      <div className="h-full bg-accent rounded-r" style={{ width: `${gain}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certification Benchmark Standards */}
          <div className="glass rounded-xl p-5 shadow-xs">
            <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
              <GraduationCap className="size-4 text-accent" />
              Uncommon Certification Standards
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Requirements for educators to earn digital qualification
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 rounded-lg bg-card/40 p-2.5">
                <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Attendance Benchmark</p>
                  <p className="text-[11px] text-muted-foreground">
                    Minimum {settings.attendanceTarget}% physical hub lab presence required.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg bg-card/40 p-2.5">
                <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Post-Test Competency</p>
                  <p className="text-[11px] text-muted-foreground">
                    Score ≥{settings.scoreTarget}% on practical assessment (≥80% for Distinction).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg bg-card/40 p-2.5">
                <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Curriculum Completion</p>
                  <p className="text-[11px] text-muted-foreground">
                    At least {settings.completionTarget} of 8 practical hands-on modules successfully finished.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
