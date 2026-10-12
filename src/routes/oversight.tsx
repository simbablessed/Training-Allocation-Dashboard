import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ShieldCheck,
  TrendingUp,
  Building2,
  Users,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Laptop,
  Wifi,
  SunMedium,
  Download,
  Calendar,
  ArrowUpRight,
  BarChart3,
  MessageSquare,
  Send,
  Printer,
  ChevronRight,
  BookOpen,
  UserCheck,
  Zap,
  Activity,
  CalendarDays,
  Star,
  MapPin,
} from "lucide-react";

import { PageHeading } from "@/components/PageHeading";
import { StatusPill, TierPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { LAB_CENTERS, modules as curriculumModules } from "@/data/mis";
import { useTraining } from "@/lib/training-store";
import { useAppAuth } from "@/lib/clerk/provider";

export const Route = createFileRoute("/oversight")({
  head: () => ({
    meta: [
      { title: "Teacher Training Manager Oversight | TutorTrack" },
      {
        name: "description",
        content:
          "Executive oversight dashboard for the Teacher Training Manager: lab performance, facilitator audits, curriculum progression and quality indicators.",
      },
      { property: "og:title", content: "Teacher Training Manager Oversight | TutorTrack" },
      {
        property: "og:description",
        content:
          "Executive performance dashboard across Kuwadzana, Chitungwiza and Warren Park hubs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ManagerOversightPage,
});

type TabType = "labs" | "facilitators" | "overall";

interface LabPerformanceData {
  center: string;
  shortName: string;
  totalEducators: number;
  classesCount: number;
  avgAttendance: number;
  avgPre: number;
  avgPost: number;
  uplift: number;
  seats: number;
  capacityUtilization: number;
  sessionsScheduled: number;
  leadCoordinator: string;
  powerSource: string;
  networkStatus: string;
  hardwareStatus: string;
  activeIssues: string[];
}

interface FacilitatorAuditData {
  name: string;
  role: string;
  initials: string;
  specialization: string;
  primaryHub: string;
  commendation: string;
  assignedClasses: number;
  totalEducators: number;
  teachingHours: number;
  satisfactionRating: number;
  satisfactionPct: number;
  sessionsCount: number;
  avgAttendance: number;
  avgPostScore: number;
  avgPreScore: number;
  netUplift: number;
  syllabusPace: string;
  punctualityRate: number;
  deliveryCompliance: number;
  labsCompleted: string;
  mentorshipClinics: number;
  portfolioSubmissionRate: number;
  recentDeliveries: Array<{
    day: string;
    time: string;
    module: string;
    title: string;
    center: string;
    status: string;
  }>;
}

const DEFAULT_DIRECTIVES = [
  {
    id: "dir-1",
    author: "Anesu Muchirewesi (Manager)",
    recipient: "Diana Dumbu (Coordinator)",
    date: "10 Oct 2026",
    topic: "Infants Class D Attendance Follow-up",
    content:
      "Chitungwiza Infants Class D dipped to 86% attendance. Please coordinate with headmasters to ensure afternoon release for teachers on Wednesdays.",
    status: "Acknowledged",
  },
  {
    id: "dir-2",
    author: "Anesu Muchirewesi (Manager)",
    recipient: "Simba (Resident Facilitator)",
    date: "09 Oct 2026",
    topic: "Kuwadzana Scratch Programming Practical",
    content:
      "Verify offline Scratch 3.0 installers on all 30 Dell stations at Kuwadzana Hub Lab ahead of Tuesday's M7 session.",
    status: "Completed",
  },
];

function ManagerOversightPage() {
  const { cohorts, sessions, settings, labAudits } = useTraining();
  const { userName, userRole } = useAppAuth();

  const [activeTab, setActiveTab] = useState<TabType>("labs");
  const [directives, setDirectives] = useState(DEFAULT_DIRECTIVES);
  const [newDirectiveRecipient, setNewDirectiveRecipient] = useState("Diana Dumbu");
  const [newDirectiveTopic, setNewDirectiveTopic] = useState("");
  const [newDirectiveText, setNewDirectiveText] = useState("");

  // 1. Compute Lab Centers Performance
  const labData: LabPerformanceData[] = useMemo(() => {
    return LAB_CENTERS.map((center) => {
      const centerCohorts = cohorts.filter((c) => c.center === center);
      const centerSessions = sessions.filter((s) => s.center === center);
      const audit = labAudits.find((a) => a.center === center);
      const count = centerCohorts.length;

      const totalEducators = centerCohorts.reduce((sum, c) => sum + c.educators, 0);
      const avgAttendance = count
        ? Math.round(centerCohorts.reduce((sum, c) => sum + c.attendance, 0) / count)
        : 0;
      const avgPre = count
        ? Math.round(centerCohorts.reduce((sum, c) => sum + c.pre, 0) / count)
        : 0;
      const avgPost = count
        ? Math.round(centerCohorts.reduce((sum, c) => sum + c.post, 0) / count)
        : 0;

      const seats = audit?.initialLaptops ?? (
        center === "Kuwadzana Hub Lab"
          ? 30
          : center === "Chitungwiza Hub Lab"
            ? 35
            : 28
      );

      const capacityUtilization = Math.min(
        100,
        Math.round((totalEducators / (seats * 2)) * 100)
      );

      const leadCoordinator =
        center === "Kuwadzana Hub Lab"
          ? "Simba"
          : center === "Chitungwiza Hub Lab"
            ? "Diana Dumbu"
            : "Anesu Muchirewesi (Manager Dual-Role)";

      const powerSource = audit
        ? `${audit.solarSystemType} (${audit.batteryHealthPct}% Battery)`
        : center === "Kuwadzana Hub Lab"
          ? "ZESA Grid + Auto Generator"
          : center === "Chitungwiza Hub Lab"
            ? "Hybrid Inverter + Solar Backup"
            : "5kVA Solar + Lithium Battery Pack";

      const networkStatus =
        center === "Kuwadzana Hub Lab"
          ? "Dedicated Fiber (50 Mbps)"
          : center === "Chitungwiza Hub Lab"
            ? "High-speed 4G LTE Router"
            : "Starlink Satellite Terminal";

      const hardwareStatus = audit
        ? `${audit.functionalLaptops}/${audit.initialLaptops} Laptops Active (${audit.faultyLaptops} repair)`
        : center === "Kuwadzana Hub Lab"
          ? "28/30 Laptops Ready"
          : center === "Chitungwiza Hub Lab"
            ? "34/35 Laptops Ready"
            : "27/28 Laptops Ready";

      const activeIssues =
        center === "Chitungwiza Hub Lab"
          ? ["Double-booking flagged on Monday (resolved)"]
          : center === "Kuwadzana Hub Lab"
            ? ["Primary school computer period overlap on Thursday"]
            : ["All systems operational"];

      return {
        center,
        shortName: center.replace(" Hub Lab", ""),
        totalEducators,
        classesCount: count,
        avgAttendance,
        avgPre,
        avgPost,
        uplift: avgPost - avgPre,
        seats,
        capacityUtilization,
        sessionsScheduled: centerSessions.length,
        leadCoordinator,
        powerSource,
        networkStatus,
        hardwareStatus,
        activeIssues,
      };
    });
  }, [cohorts, sessions]);

  // 2. Compute Facilitator Audits & Delivery Records with rich differentiated metrics
  const facilitatorData: FacilitatorAuditData[] = useMemo(() => {
    const facilitators = [
      {
        name: "Diana Dumbu",
        role: "Resident Facilitator",
        initials: "DD",
        specialization: "Infants (ECD–Gr2) · M1 ICT Tools & M2 Learning Aids",
        primaryHub: "Chitungwiza Hub Lab",
        commendation: "Top Educator Satisfaction (4.96/5)",
        teachingHours: 48,
        satisfactionRating: 4.96,
        satisfactionPct: 99.2,
        punctualityRate: 98.5,
        deliveryCompliance: 96,
        labsCompleted: "24 / 26 labs (92%)",
        mentorshipClinics: 38,
        portfolioSubmissionRate: 91,
      },
      {
        name: "Simba",
        role: "Resident Facilitator",
        initials: "SM",
        specialization: "Middle Junior (Gr3–Gr4) · M6 STEAM & M7 Scratch Logic",
        primaryHub: "Kuwadzana Hub Lab",
        commendation: "Hands-on Coding & Scratch Mentor",
        teachingHours: 44,
        satisfactionRating: 4.86,
        satisfactionPct: 97.1,
        punctualityRate: 96.0,
        deliveryCompliance: 94,
        labsCompleted: "22 / 24 labs (91%)",
        mentorshipClinics: 42,
        portfolioSubmissionRate: 88,
      },
      {
        name: "Anesu Muchirewesi",
        role: "Teacher Training Manager (Warren Park Facilitator)",
        initials: "AM",
        specialization: "Upper Junior (Gr5–Gr7) · M4 Ethics & M8 Offline Networks",
        primaryHub: "Warren Park Hub Lab",
        commendation: "Manager Dual-Role & Quality Auditor",
        teachingHours: 38,
        satisfactionRating: 4.92,
        satisfactionPct: 98.4,
        punctualityRate: 100,
        deliveryCompliance: 98,
        labsCompleted: "16 / 16 labs (100%)",
        mentorshipClinics: 18,
        portfolioSubmissionRate: 94,
      },
    ];

    return facilitators.map((f) => {
      const fCohorts = cohorts.filter((c) => c.facilitator === f.name);
      const fSessions = sessions.filter((s) => s.facilitator === f.name);
      const count = fCohorts.length;

      const totalEducators = fCohorts.reduce((sum, c) => sum + c.educators, 0);
      const avgAttendance = count
        ? Math.round(fCohorts.reduce((sum, c) => sum + c.attendance, 0) / count)
        : 0;
      const avgPreScore = count
        ? Math.round(fCohorts.reduce((sum, c) => sum + c.pre, 0) / count)
        : 0;
      const avgPostScore = count
        ? Math.round(fCohorts.reduce((sum, c) => sum + c.post, 0) / count)
        : 0;

      const netUplift = avgPostScore - avgPreScore;
      const avgModules = count
        ? Math.round((fCohorts.reduce((sum, c) => sum + c.modulesDone, 0) / count) * 10) / 10
        : 0;

      return {
        ...f,
        assignedClasses: count,
        totalEducators,
        sessionsCount: fSessions.length,
        avgAttendance,
        avgPostScore,
        avgPreScore,
        netUplift,
        syllabusPace: `${avgModules} / 8 Modules`,
        recentDeliveries: fSessions.map((s) => ({
          day: s.day,
          time: s.time,
          module: s.module,
          title: s.title,
          center: s.center,
          status: s.status,
        })),
      };
    });
  }, [cohorts, sessions]);

  // 3. Macro Programme Metrics
  const totalEnrolled = useMemo(
    () => cohorts.reduce((sum, c) => sum + c.educators, 0),
    [cohorts]
  );
  const macroAttendance = useMemo(() => {
    return cohorts.length
      ? Math.round(cohorts.reduce((sum, c) => sum + c.attendance, 0) / cohorts.length)
      : 0;
  }, [cohorts]);
  const macroUplift = useMemo(() => {
    if (!cohorts.length) return 0;
    const pre = cohorts.reduce((sum, c) => sum + c.pre, 0) / cohorts.length;
    const post = cohorts.reduce((sum, c) => sum + c.post, 0) / cohorts.length;
    return Math.round((post - pre) * 10) / 10;
  }, [cohorts]);
  const certificationReadyCount = useMemo(() => {
    return cohorts.filter(
      (c) => c.attendance >= settings.attendanceTarget && c.post >= settings.scoreTarget
    ).length;
  }, [cohorts, settings]);

  // Handle posting a manager directive
  function handleAddDirective(e: React.FormEvent) {
    e.preventDefault();
    if (!newDirectiveTopic.trim() || !newDirectiveText.trim()) return;

    const newEntry = {
      id: `dir-${Date.now()}`,
      author: `${userName || "Anesu Muchirewesi"} (Manager)`,
      recipient: `${newDirectiveRecipient} (Coordinator)`,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      topic: newDirectiveTopic.trim(),
      content: newDirectiveText.trim(),
      status: "Pending Action",
    };

    setDirectives([newEntry, ...directives]);
    setNewDirectiveTopic("");
    setNewDirectiveText("");
  }

  // Export CSV of the Manager Audit Report
  function handleExportManagerAudit() {
    const rows = [
      ["TEACHER TRAINING MANAGER OVERSIGHT AUDIT", `Term 3 2026 - Generated ${new Date().toLocaleDateString()}`],
      [],
      ["LAB PERFORMANCE SUMMARY"],
      ["Lab Center", "Assigned Classes", "Enrolled Educators", "Avg Attendance", "Baseline Pre-Test", "Post-Test", "Competency Uplift", "Lead Coordinator"],
      ...labData.map((l) => [
        `"${l.center}"`,
        l.classesCount,
        l.totalEducators,
        `${l.avgAttendance}%`,
        `${l.avgPre} pts`,
        `${l.avgPost} pts`,
        `+${l.uplift} pts`,
        `"${l.leadCoordinator}"`,
      ]),
      [],
      ["FACILITATOR ACTIVITY & QUALITY SCORECARD"],
      ["Facilitator", "Role", "Specialization Domain", "Primary Hub Base", "Teaching Hours", "Supervised Classes", "Total Educators", "Teacher Rating", "Punctuality", "Attendance Rate", "Post-Test Avg", "Verified Labs", "Mentorship Clinics", "Commendation"],
      ...facilitatorData.map((f) => [
        `"${f.name}"`,
        `"${f.role}"`,
        `"${f.specialization}"`,
        `"${f.primaryHub}"`,
        `${f.teachingHours} hrs`,
        f.assignedClasses,
        f.totalEducators,
        `${f.satisfactionRating} / 5.0 (${f.satisfactionPct}%)`,
        `${f.punctualityRate}%`,
        `${f.avgAttendance}%`,
        `${f.avgPostScore} pts`,
        `"${f.labsCompleted}"`,
        `${f.mentorshipClinics} sessions`,
        `"${f.commendation}"`,
      ]),
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `manager-oversight-audit-term3-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeading
        eyebrow="Executive Leadership & Quality M&E"
        title="Training Manager Oversight"
        meta="Term 3 2026 · Operations, lab throughput, trainer audits & quality compliance"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="size-3.5" />}
              onClick={handleExportManagerAudit}
            >
              Export Audit CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="size-3.5" />}
              onClick={() => window.print()}
            >
              Print Summary
            </Button>
            <Button asChild size="sm" icon={<CalendarDays className="size-3.5" />}>
              <Link to="/schedule">Open Live Timetable</Link>
            </Button>
          </div>
        }
      />

      {/* 2. Executive KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:gap-4">
        <div className="glass rounded-xl p-3.5 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Network Educators
            </span>
            <Users className="size-4 text-brand" />
          </div>
          <p className="mt-2 font-display text-2xl font-black text-foreground">
            {totalEnrolled}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-accent">
            across {cohorts.length} teacher classes
          </p>
        </div>

        <div className="glass rounded-xl p-3.5 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Network Attendance
            </span>
            <Activity className="size-4 text-accent" />
          </div>
          <p className="mt-2 font-display text-2xl font-black text-foreground">
            {macroAttendance}%
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            Target: ≥{settings.attendanceTarget}% ({macroAttendance >= settings.attendanceTarget ? "Compliant" : "Needs Review"})
          </p>
        </div>

        <div className="glass rounded-xl p-3.5 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Avg Competency Gain
            </span>
            <TrendingUp className="size-4 text-accent" />
          </div>
          <p className="mt-2 font-display text-2xl font-black text-accent">
            +{macroUplift} pts
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            +74% net skill improvement
          </p>
        </div>

        <div className="glass rounded-xl p-3.5 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Certification Readiness
            </span>
            <Award className="size-4 text-brand" />
          </div>
          <p className="mt-2 font-display text-2xl font-black text-foreground">
            {certificationReadyCount} / {cohorts.length}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-brand">
            {Math.round((certificationReadyCount / (cohorts.length || 1)) * 100)}% on track for certs
          </p>
        </div>

        <div className="glass rounded-xl p-3.5 transition-all col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Manager Role
            </span>
            <ShieldCheck className="size-4 text-brand" />
          </div>
          <p className="mt-2 font-display text-base font-bold text-foreground truncate">
            {userName || "Anesu Muchirewesi"}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            Teacher Training Manager
          </p>
        </div>
      </div>

      {/* 3. Tab Switcher Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("labs")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "labs"
              ? "bg-brand text-brand-foreground shadow-xs"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Building2 className="size-3.5" />
          <span>Hub Labs Performance</span>
          <span className="rounded-full bg-brand-foreground/20 px-1.5 py-0.2 text-[10px]">
            3 Labs
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("facilitators")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "facilitators"
              ? "bg-brand text-brand-foreground shadow-xs"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <UserCheck className="size-3.5" />
          <span>Facilitator Activity & Audits</span>
          <span className="rounded-full bg-brand-foreground/20 px-1.5 py-0.2 text-[10px]">
            3 Staff
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("overall")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "overall"
              ? "bg-brand text-brand-foreground shadow-xs"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <BarChart3 className="size-3.5" />
          <span>Overall Quality & Directives</span>
          <span className="rounded-full bg-brand-foreground/20 px-1.5 py-0.2 text-[10px]">
            M&E
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: HUB LABS PERFORMANCE                               */}
      {/* ========================================================= */}
      {activeTab === "labs" && (
        <div className="space-y-5">
          {/* Detailed Lab Center Cards */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {labData.map((lab) => (
              <div
                key={lab.center}
                className="glass flex flex-col justify-between rounded-2xl border border-border p-5 shadow-2xs"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground">
                        {lab.shortName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Hub Lead: <strong className="text-foreground">{lab.leadCoordinator}</strong>
                      </p>
                    </div>
                    <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">
                      {lab.seats} PC Seats
                    </span>
                  </div>

                  {/* Quantitative Metrics */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border border-border/80 bg-background p-2.5">
                      <span className="text-[11px] text-muted-foreground block">
                        Educator Enrolment
                      </span>
                      <p className="mt-1 font-display text-lg font-bold text-foreground">
                        {lab.totalEducators}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {lab.classesCount} active classes
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/80 bg-background p-2.5">
                      <span className="text-[11px] text-muted-foreground block">
                        Attendance Rate
                      </span>
                      <p className="mt-1 font-display text-lg font-bold text-accent">
                        {lab.avgAttendance}%
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        Target: ≥{settings.attendanceTarget}%
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/80 bg-background p-2.5">
                      <span className="text-[11px] text-muted-foreground block">
                        Post-Test Average
                      </span>
                      <p className="mt-1 font-display text-lg font-bold text-foreground">
                        {lab.avgPost} <span className="text-xs text-muted-foreground">/100</span>
                      </p>
                      <span className="text-[10px] text-accent font-semibold">
                        ▲ +{lab.uplift} pts vs pre-test
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/80 bg-background p-2.5">
                      <span className="text-[11px] text-muted-foreground block">
                        Lab Utilization
                      </span>
                      <p className="mt-1 font-display text-lg font-bold text-brand">
                        {lab.capacityUtilization}%
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {lab.sessionsScheduled} sessions/week
                      </span>
                    </div>
                  </div>

                  {/* Infrastructure Health Checklist */}
                  <div className="mt-4 space-y-2 rounded-xl border border-border/80 bg-muted/25 p-3 text-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Facility & Systems Readiness
                    </p>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <SunMedium className="size-3.5 text-amber" />
                        Power Stability
                      </span>
                      <span className="font-semibold text-foreground text-[11px] truncate max-w-[170px]">
                        {lab.powerSource}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Wifi className="size-3.5 text-accent" />
                        Connectivity
                      </span>
                      <span className="font-semibold text-foreground text-[11px] truncate max-w-[170px]">
                        {lab.networkStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Laptop className="size-3.5 text-brand" />
                        Workstations
                      </span>
                      <span className="font-semibold text-foreground text-[11px]">
                        {lab.hardwareStatus}
                      </span>
                    </div>
                  </div>

                  {/* Operational Notes / Issues */}
                  <div className="mt-3 text-xs">
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      Operational Status:
                    </p>
                    <ul className="mt-1 space-y-1">
                      {lab.activeIssues.map((issue, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-1.5 text-[11px] text-foreground font-medium"
                        >
                          <CheckCircle2 className="size-3 text-accent shrink-0" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 border-t border-border/60 pt-3">
                  <Button asChild variant="outline" size="sm" className="w-full text-xs">
                    <Link to="/schedule">View {lab.shortName} Timetable →</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Comparative Matrix Table */}
          <div className="glass overflow-hidden rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h3 className="font-display text-sm font-bold text-foreground">
                  Cross-Lab Benchmark Comparison
                </h3>
                <p className="text-xs text-muted-foreground">
                  Side-by-side performance indicators across all host centers
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                Term 3 2026 Live Register
              </span>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3 pl-4">Lab Center</th>
                    <th className="p-3">Lead Coordinator</th>
                    <th className="p-3">Classes</th>
                    <th className="p-3">Educators</th>
                    <th className="p-3">Attendance</th>
                    <th className="p-3">Baseline Pre</th>
                    <th className="p-3">Post-Test</th>
                    <th className="p-3">Net Uplift</th>
                    <th className="p-3">Capacity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {labData.map((lab) => (
                    <tr key={lab.center} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 pl-4 font-bold text-foreground">{lab.center}</td>
                      <td className="p-3 font-medium text-foreground">{lab.leadCoordinator}</td>
                      <td className="p-3 font-semibold">{lab.classesCount} classes</td>
                      <td className="p-3">{lab.totalEducators} educators</td>
                      <td className="p-3 font-bold text-accent">{lab.avgAttendance}%</td>
                      <td className="p-3 text-muted-foreground">{lab.avgPre} pts</td>
                      <td className="p-3 font-bold text-foreground">{lab.avgPost} pts</td>
                      <td className="p-3 font-bold text-accent">+{lab.uplift} pts</td>
                      <td className="p-3">
                        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
                          {lab.capacityUtilization}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: FACILITATOR ACTIVITY & AUDITS                      */}
      {/* ========================================================= */}
      {activeTab === "facilitators" && (
        <div className="space-y-5">
          {/* Facilitator Scorecards */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {facilitatorData.map((f) => (
              <div
                key={f.name}
                className="glass flex flex-col justify-between rounded-2xl border border-border p-5 shadow-2xs"
              >
                <div>
                  {/* Facilitator Header */}
                  <div className="flex items-start justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-11 place-items-center rounded-xl bg-brand/10 font-display text-sm font-bold text-brand">
                        {f.initials}
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-foreground">
                          {f.name}
                        </h3>
                        <p className="text-xs text-brand font-medium">{f.role}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand text-right">
                      {f.commendation}
                    </span>
                  </div>

                  {/* Specialization & Primary Hub Base */}
                  <div className="mt-2.5 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="size-3 text-accent shrink-0" />
                      <span>Base: <strong className="text-foreground">{f.primaryHub}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <BookOpen className="size-3 text-brand shrink-0" />
                      <span className="truncate">{f.specialization}</span>
                    </div>
                  </div>

                  {/* Quantitative Performance Grid */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2.5 text-xs">
                    <div className="rounded-xl border border-border/80 bg-background p-2.5">
                      <span className="text-[11px] text-muted-foreground block">
                        Supervised Classes
                      </span>
                      <p className="mt-1 font-display text-base font-bold text-foreground">
                        {f.assignedClasses} classes
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {f.totalEducators} educators
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/80 bg-background p-2.5">
                      <span className="text-[11px] text-muted-foreground block">
                        Teaching Hours
                      </span>
                      <p className="mt-1 font-display text-base font-bold text-brand">
                        {f.teachingHours} hrs
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {f.sessionsCount} sessions/week
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/80 bg-background p-2.5">
                      <span className="text-[11px] text-muted-foreground block">
                        Cohort Attendance
                      </span>
                      <p className="mt-1 font-display text-base font-bold text-accent">
                        {f.avgAttendance}%
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        Punctuality: {f.punctualityRate}%
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/80 bg-background p-2.5">
                      <span className="text-[11px] text-muted-foreground block">
                        Post-Test Average
                      </span>
                      <p className="mt-1 font-display text-base font-bold text-foreground">
                        {f.avgPostScore} pts
                      </p>
                      <span className="text-[10px] text-accent font-semibold">
                        ▲ +{f.netUplift} pts gain
                      </span>
                    </div>
                  </div>

                  {/* Quality & Practitioner Indicators */}
                  <div className="mt-3 space-y-2 rounded-xl border border-border/80 bg-muted/20 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Star className="size-3.5 text-amber fill-amber" />
                        Teacher Feedback Rating
                      </span>
                      <span className="font-bold text-foreground">
                        {f.satisfactionRating} / 5.0 <span className="text-[10px] font-normal text-muted-foreground">({f.satisfactionPct}%)</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Laptop className="size-3.5 text-brand" />
                        Practical Labs Verified
                      </span>
                      <span className="font-semibold text-foreground text-[11px]">
                        {f.labsCompleted}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Users className="size-3.5 text-accent" />
                        1-on-1 Mentorship Clinics
                      </span>
                      <span className="font-semibold text-foreground text-[11px]">
                        {f.mentorshipClinics} coaching sessions
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-accent" />
                        Portfolio Submission Rate
                      </span>
                      <span className="font-semibold text-accent text-[11px]">
                        {f.portfolioSubmissionRate}% completed
                      </span>
                    </div>
                  </div>

                  {/* Recent Delivery Audit Log */}
                  <div className="mt-3.5 space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Scheduled Delivery Log
                    </p>
                    <div className="space-y-1.5 rounded-xl border border-border/70 bg-muted/20 p-2.5">
                      {f.recentDeliveries.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No sessions scheduled.</p>
                      ) : (
                        f.recentDeliveries.map((s, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-[11px] border-b border-border/40 pb-1 last:border-0 last:pb-0"
                          >
                            <div className="truncate pr-2">
                              <span className="font-bold text-brand mr-1">{s.day} {s.time}</span>
                              <span className="font-semibold text-foreground">{s.module}: {s.title}</span>
                              <span className="text-muted-foreground block truncate text-[10px]">
                                {s.center.replace(" Hub Lab", "")}
                              </span>
                            </div>
                            <StatusPill status={s.status as any} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Manager Action */}
                <div className="mt-4 border-t border-border/60 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setActiveTab("overall");
                      setNewDirectiveRecipient(f.name);
                    }}
                  >
                    Send Direct Note to {f.name.split(" ")[0]} →
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Facilitator Comparative Audit Table */}
          <div className="glass overflow-hidden rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h3 className="font-display text-sm font-bold text-foreground">
                  Trainer Performance Benchmarks & Quality Audit
                </h3>
                <p className="text-xs text-muted-foreground">
                  Cross-facilitator audit comparison across teaching hours, educator ratings, and mentorship outputs
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                Term 3 2026 Audit Register
              </span>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3 pl-4">Facilitator</th>
                    <th className="p-3">Primary Hub</th>
                    <th className="p-3">Classes</th>
                    <th className="p-3">Teaching Hours</th>
                    <th className="p-3">Teacher Rating</th>
                    <th className="p-3">Punctuality</th>
                    <th className="p-3">Mentorships</th>
                    <th className="p-3">Verified Labs</th>
                    <th className="p-3">Cohort Attendance</th>
                    <th className="p-3">Post-Test Avg</th>
                    <th className="p-3">Commendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {facilitatorData.map((f) => (
                    <tr key={f.name} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 pl-4 font-bold text-foreground">
                        {f.name}
                        <span className="block text-[11px] font-normal text-brand">{f.role}</span>
                      </td>
                      <td className="p-3 font-medium text-foreground">{f.primaryHub.replace(" Hub Lab", "")}</td>
                      <td className="p-3">{f.assignedClasses} ({f.totalEducators} teachers)</td>
                      <td className="p-3 font-bold text-brand">{f.teachingHours} hrs</td>
                      <td className="p-3 font-bold text-amber">
                        ⭐ {f.satisfactionRating} <span className="text-[10px] text-muted-foreground">({f.satisfactionPct}%)</span>
                      </td>
                      <td className="p-3">{f.punctualityRate}%</td>
                      <td className="p-3 font-semibold">{f.mentorshipClinics} sessions</td>
                      <td className="p-3 text-muted-foreground">{f.labsCompleted}</td>
                      <td className="p-3 font-bold text-accent">{f.avgAttendance}%</td>
                      <td className="p-3 font-bold text-foreground">
                        {f.avgPostScore} pts <span className="text-[10px] text-accent font-semibold">(+{f.netUplift})</span>
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                          {f.commendation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: OVERALL PROGRAMME QUALITY & DIRECTIVES            */}
      {/* ========================================================= */}
      {activeTab === "overall" && (
        <div className="space-y-5">
          {/* Top row: Curriculum Mastery & At-Risk Alerts */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Curriculum Modules Mastery Heatmap */}
            <div className="glass rounded-2xl border border-border p-5 lg:col-span-2 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    National Curriculum Module Progress (M1–M8)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Completion rate and teacher mastery across all 8 modules
                  </p>
                </div>
                <span className="text-xs font-semibold text-brand">
                  Term 3 Syllabus
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {curriculumModules.map((m) => (
                  <div
                    key={m.code}
                    className="rounded-xl border border-border/80 bg-background p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        <strong className="text-brand mr-1.5">{m.code}</strong> {m.name}
                      </span>
                      <span className="font-bold text-accent">{m.completion}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-accent transition-[width] duration-500"
                        style={{ width: `${m.completion}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality & At-Risk Alerts */}
            <div className="glass rounded-2xl border border-border p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                  <AlertTriangle className="size-4 text-amber" />
                  <h3 className="font-display text-sm font-bold text-foreground">
                    At-Risk & Compliance Alerts
                  </h3>
                </div>

                <div className="mt-3 space-y-2.5 text-xs">
                  <div className="rounded-xl border border-amber/30 bg-amber/10 p-3">
                    <p className="font-bold text-amber">Infants Class D (Chitungwiza)</p>
                    <p className="mt-0.5 text-foreground/80 text-[11px]">
                      Attendance at 86%, just above the 85% threshold. Recommended for coordinator check-in.
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber/30 bg-amber/10 p-3">
                    <p className="font-bold text-amber">Middle Junior Class E (Warren Park)</p>
                    <p className="mt-0.5 text-foreground/80 text-[11px]">
                      Attendance at 84% (below 85% target). Needs coordinator attendance intervention.
                    </p>
                  </div>

                  <div className="rounded-xl border border-accent/30 bg-accent/10 p-3">
                    <p className="font-bold text-accent">Upper Junior Class C (Warren Park)</p>
                    <p className="mt-0.5 text-foreground/80 text-[11px]">
                      High distinction rate: 82 pts avg post-test score with 92% assessment completion.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60">
                <Button asChild variant="outline" size="sm" className="w-full text-xs">
                  <Link to="/assessments">Inspect Full Assessment Rubrics →</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Manager Directives & Coordination Broadcast Section */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Directives Feed */}
            <div className="glass rounded-2xl border border-border p-5 lg:col-span-2 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-brand" />
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Manager Directives & Coordination Log
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  Official manager instructions to coordinators
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {directives.map((dir) => (
                  <div
                    key={dir.id}
                    className="rounded-xl border border-border bg-background p-3.5 text-xs shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{dir.topic}</span>
                        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                          To: {dir.recipient}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{dir.date}</span>
                    </div>

                    <p className="mt-2 text-foreground/90 leading-relaxed">{dir.content}</p>

                    <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[11px]">
                      <span className="text-muted-foreground">Logged by: {dir.author}</span>
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 font-semibold text-accent">
                        {dir.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compose New Directive Form */}
            <div className="glass rounded-2xl border border-border p-5 shadow-2xs">
              <h3 className="font-display text-sm font-bold text-foreground border-b border-border/60 pb-3">
                Issue Manager Directive
              </h3>

              <form onSubmit={handleAddDirective} className="mt-3 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Recipient Coordinator
                  </label>
                  <select
                    value={newDirectiveRecipient}
                    onChange={(e) => setNewDirectiveRecipient(e.target.value)}
                    className="field text-xs font-medium"
                  >
                    <option value="Diana Dumbu">Diana Dumbu (Coordinator)</option>
                    <option value="Simba">Simba (Coordinator)</option>
                    <option value="All Coordinators">All Coordinators</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Directive Topic / Subject
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Attendance remediation, lab setup"
                    value={newDirectiveTopic}
                    onChange={(e) => setNewDirectiveTopic(e.target.value)}
                    className="field text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Directive Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide actionable guidance or requirements..."
                    value={newDirectiveText}
                    onChange={(e) => setNewDirectiveText(e.target.value)}
                    className="field text-xs resize-none"
                  />
                </div>

                <Button type="submit" size="sm" className="w-full text-xs" icon={<Send className="size-3.5" />}>
                  Dispatch Directive
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
