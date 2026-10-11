import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { PageHeading } from "@/components/PageHeading";
import { Button } from "@/components/ui/button";
import { reports, tiers } from "@/data/mis";
import { getKpis, useTraining } from "@/lib/training-store";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "M&E Reports & Exports | TutorTrack" },
      {
        name: "description",
        content:
          "Monitoring and evaluation scorecards, class progress matrices and audit-ready report exports.",
      },
      { property: "og:title", content: "M&E Reports & Exports | TutorTrack" },
      {
        property: "og:description",
        content: "M&E scorecards, class progress matrices and audit-ready report exports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

const toneClass = { accent: "text-accent", amber: "text-amber", brand: "text-brand" } as const;

function ReportsPage() {
  const { cohorts, sessions, settings, uploadReportToR2 } = useTraining();
  const kpis = getKpis(cohorts, sessions, settings);
  const avgPre = kpis.pre;
  const avgPost = kpis.post;
  const [archivedMsg, setArchivedMsg] = useState("");

  async function downloadReport(type: "cohorts" | "sessions" | "scores", name: string, reportTitle?: string) {
    const rows = type === "sessions" ? [
      ["Day", "Time", "Module", "Workshop", "Centre", "Tier", "Facilitator", "Status"],
      ...sessions.map((s) => [s.day, s.time, s.module, s.title, s.center, s.tier, s.facilitator, s.status]),
    ] : type === "scores" ? [
      ["Indicator", "Actual", "Target"],
      ["Average attendance", kpis.attendance, settings.attendanceTarget],
      ["Average post-test", kpis.post, settings.scoreTarget],
      ["Classes meeting attendance target", kpis.meetingAttendance, kpis.total],
      ["Classes meeting post-test target", kpis.meetingScore, kpis.total],
      ["Classes meeting completion target", kpis.meetingCompletion, kpis.total],
      ["Active lab conflicts", kpis.conflicts, 0],
    ] : [
      ["Class", "Tier", "Hub Lab", "Educators", "Attendance", "Pre score", "Post score", "Modules completed"],
      ...cohorts.map((c) => [c.name, c.tier, c.center, c.educators, c.attendance, c.pre, c.post, c.modulesDone]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");

    // Upload to Cloudflare R2 & record in Neon
    try {
      const title = reportTitle || `${name.toUpperCase()} Report`;
      await uploadReportToR2(name, title, "Term 3 2026", type === "scores" ? "Scorecard" : "Export", csv);
      setArchivedMsg(`Saved & archived to Cloudflare R2 (${name})`);
      setTimeout(() => setArchivedMsg(""), 3500);
    } catch (e) {
      console.warn("Could not archive to R2:", e);
    }

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `tutortrack-${name}.csv`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <>
      <PageHeading
        eyebrow="Monitoring & Evaluation"
        title="M&E Reports"
        meta="Grant-aligned indicator summaries · Term 3 2026"
        action={
          <div className="flex gap-2"><Button variant="outline" icon={<Download className="size-4" />} onClick={() => downloadReport("cohorts", "class-progress", "Class Progress Matrix")}>Export CSV</Button><Button icon={<FileText className="size-4" />} onClick={() => window.print()}>Print PDF</Button></div>
        }
      />

      {archivedMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-xs font-semibold text-accent animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{archivedMsg}</span>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-lg p-5 lg:col-span-2">
          <h2 className="font-display text-[15px] font-semibold">Generated reports</h2>
          <p className="text-[12px] text-ink/45">Download current training records by report type</p>
          <div className="mt-4 divide-y divide-ink/10">
            {reports.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{r.name}</p>
                  <p className="truncate text-[12px] text-ink/45">
                    {r.type} · {r.period} · live data
                  </p>
                </div>
                <Button variant="outline" size="sm" icon={<Download className="size-3.5" />} onClick={() => downloadReport(r.id === "r3" ? "sessions" : r.id === "r1" || r.id === "r4" ? "scores" : "cohorts", r.id)}>Download</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-lg p-5">
          <h2 className="font-display text-[15px] font-semibold">Weekly scorecard</h2>
          <p className="text-[12px] text-ink/45">Performance against institutional targets</p>
          <div className="mt-4 space-y-3">
            {[
              { label: `Attendance ≥ ${settings.attendanceTarget}%`, value: `${kpis.meetingAttendance} / ${kpis.total}`, tone: "accent" },
              { label: `Post-score ≥ ${settings.scoreTarget}`, value: `${kpis.meetingScore} / ${kpis.total}`, tone: "amber" },
              { label: `Modules ≥ ${settings.completionTarget}`, value: `${kpis.meetingCompletion} / ${kpis.total}`, tone: "brand" },
              { label: "Lab conflicts", value: String(kpis.conflicts), tone: "amber" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-xl bg-card/40 px-3 py-2.5">
                <span className="text-[12px] font-medium">{row.label}</span>
                <span className={`font-display text-sm font-semibold ${toneClass[row.tone as keyof typeof toneClass]}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-lg p-5">
          <h2 className="font-display text-[15px] font-semibold">Competency uplift</h2>
          <p className="text-[12px] text-ink/45">Average diagnostic pre vs post score</p>
          <div className="mt-5 flex items-end gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-ink/45">Pre-test</p>
              <p className="font-display text-3xl font-semibold text-ink/60">{avgPre}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-ink/45">Post-test</p>
              <p className="font-display text-3xl font-semibold text-accent">{avgPost}</p>
            </div>
            <div className="pb-1">
              <p className="text-[11px] font-medium text-accent">▲ {avgPost - avgPre} points</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-lg p-5 lg:col-span-2">
          <h2 className="font-display text-[15px] font-semibold">Class progress matrix</h2>
          <p className="text-[12px] text-ink/45">Tier coverage across host Hub Labs</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[12px]">
              <thead className="text-[11px] uppercase tracking-wider text-ink/45">
                <tr>
                  <th className="pb-2 font-medium">Tier</th>
                  <th className="pb-2 font-medium">Educators</th>
                  <th className="pb-2 font-medium">Facilitators</th>
                  <th className="pb-2 font-medium">Centres</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {tiers.map((t) => (
                  <tr key={t.tier}>
                    <td className="py-2.5 font-semibold">
                      {t.tier} · {t.range}
                    </td>
                    <td className="py-2.5 text-ink/60">{t.educators}</td>
                    <td className="py-2.5 text-ink/60">{t.facilitators}</td>
                    <td className="py-2.5 text-ink/60">{t.centers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
