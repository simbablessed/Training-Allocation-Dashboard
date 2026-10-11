import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarPlus,
  X,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Printer,
  Download,
  Edit3,
  Trash2,
  LayoutGrid,
  Columns,
  List,
  Laptop,
  Wifi,
  SunMedium,
  Check,
  Building2,
  Users,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

import { PageHeading } from "@/components/PageHeading";
import { StatusPill, TierPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import {
  type Session,
  type Tier,
  type SessionStatus,
  LAB_CENTERS,
  modules as curriculumModules,
} from "@/data/mis";
import { useTraining } from "@/lib/training-store";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Lab Schedule & Conflict Checks | TutorTrack" },
      {
        name: "description",
        content:
          "Weekly computer lab timetable for educator workshops with automatic detection of booking collisions.",
      },
      { property: "og:title", content: "Lab Schedule & Conflict Checks | TutorTrack" },
      {
        property: "og:description",
        content:
          "Weekly lab timetable for educator workshops with automatic booking-collision detection across Kuwadzana, Chitungwiza and Warren Park.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SchedulePage,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
type Day = (typeof DAYS)[number];

const TIME_BLOCKS = [
  { label: "Morning Session", range: "08:00 – 10:30", defaultTime: "08:30" },
  { label: "Mid-Day Session", range: "10:30 – 12:30", defaultTime: "11:00" },
  { label: "Afternoon Session", range: "13:30 – 15:30", defaultTime: "13:30" },
  { label: "Late Afternoon Clinic", range: "15:30 – 17:00", defaultTime: "15:30" },
];

const FACILITATORS = [
  { name: "Anesu Muchirewesi", role: "Teacher Training Manager", initials: "AM" },
  { name: "Simba", role: "Teacher Training Coordinator", initials: "SM" },
  { name: "Diana Dumbu", role: "Teacher Training Coordinator", initials: "DD" },
];

const LAB_SPECS: Record<
  string,
  {
    seats: number;
    hardware: string;
    connectivity: string;
    power: string;
    coordinator: string;
  }
> = {
  "Kuwadzana Hub Lab": {
    seats: 30,
    hardware: "30 Dell OptiPlex PCs + Epson Projector",
    connectivity: "Fiber + Local Ka-Lite Offline LMS",
    power: "Grid + Generator Backup",
    coordinator: "Anesu Muchirewesi",
  },
  "Chitungwiza Hub Lab": {
    seats: 35,
    hardware: "35 HP All-in-One PCs + Interactive Display",
    connectivity: "4G LTE Gateway + Local Synology NAS",
    power: "Grid + Solar Hybrid Inverter",
    coordinator: "Diana Dumbu",
  },
  "Warren Park Hub Lab": {
    seats: 28,
    hardware: "28 Lenovo ThinkCentre PCs + Smart TV",
    connectivity: "High-speed Starlink + Raspberry Pi LMS",
    power: "5kVA Solar System & Lithium Battery",
    coordinator: "Simba",
  },
};

type ViewMode = "matrix" | "columns" | "table";

function SchedulePage() {
  const {
    sessions: bookings,
    createSession,
    updateSession,
    deleteSession,
    changeSessionStatus,
  } = useTraining();

  // Filters & View State
  const [selectedCenter, setSelectedCenter] = useState<string>("All centers");
  const [selectedFacilitator, setSelectedFacilitator] = useState<string>("All facilitators");
  const [selectedTier, setSelectedTier] = useState<string>("All tiers");
  const [selectedStatus, setSelectedStatus] = useState<string>("All statuses");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("matrix");
  const [showLabSpecs, setShowLabSpecs] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  // Pre-filled slot for "+ Book slot" click
  const [presetSlot, setPresetSlot] = useState<{ day: Day; time: string; center?: string } | null>(
    null
  );

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return bookings.filter((s) => {
      if (selectedCenter !== "All centers" && s.center !== selectedCenter) return false;
      if (selectedFacilitator !== "All facilitators" && s.facilitator !== selectedFacilitator)
        return false;
      if (selectedTier !== "All tiers" && s.tier !== selectedTier) return false;
      if (selectedStatus !== "All statuses") {
        if (selectedStatus === "Conflicts Only" && s.status !== "Conflict") return false;
        if (selectedStatus !== "Conflicts Only" && s.status !== selectedStatus) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchModule = s.module.toLowerCase().includes(q);
        const matchFacilitator = s.facilitator.toLowerCase().includes(q);
        const matchCenter = s.center.toLowerCase().includes(q);
        if (!matchTitle && !matchModule && !matchFacilitator && !matchCenter) return false;
      }
      return true;
    });
  }, [
    bookings,
    selectedCenter,
    selectedFacilitator,
    selectedTier,
    selectedStatus,
    searchQuery,
  ]);

  // Collisions & Metrics
  const allConflicts = useMemo(() => bookings.filter((s) => s.status === "Conflict"), [bookings]);
  const visibleConflicts = useMemo(
    () => filteredSessions.filter((s) => s.status === "Conflict"),
    [filteredSessions]
  );
  const confirmedCount = useMemo(
    () => bookings.filter((s) => s.status === "Confirmed").length,
    [bookings]
  );
  const pendingCount = useMemo(
    () => bookings.filter((s) => s.status === "Pending").length,
    [bookings]
  );
  const totalSeats = useMemo(
    () => Object.values(LAB_SPECS).reduce((sum, lab) => sum + lab.seats, 0),
    []
  );

  // Helper: check collision in memory
  function checkCollision(day: string, time: string, center: string, ignoreId?: string) {
    const existing = bookings.find(
      (s) => s.id !== ignoreId && s.day === day && s.time === time && s.center === center
    );
    if (existing) {
      return `Double-booking: ${existing.title} (${existing.facilitator}) is already scheduled in ${center} at ${time}.`;
    }
    return null;
  }

  // Export Timetable to CSV
  function handleExportCsv() {
    const headers = ["Day", "Time", "Center", "Module", "Session Title", "Tier", "Facilitator", "Status", "Notes"];
    const rows = filteredSessions.map((s) => [
      `"${s.day}"`,
      `"${s.time}"`,
      `"${s.center}"`,
      `"${s.module}"`,
      `"${s.title.replace(/"/g, '""')}"`,
      `"${s.tier}"`,
      `"${s.facilitator}"`,
      `"${s.status}"`,
      `"${(s.note || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `uncommon-lab-schedule-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Quick Conflict Resolution
  async function handleResolveConflict(session: Session) {
    await changeSessionStatus(
      session.id,
      "Confirmed",
      "Conflict resolved by timetable coordinator"
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Action Toolbar */}
      <PageHeading
        eyebrow="Operations & Allocation"
        title="Lab Schedule & Timetable"
        meta="Term 3 2026 · Computer lab booking matrix across Kuwadzana, Chitungwiza & Warren Park"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Laptop className="size-3.5" />}
              onClick={() => setShowLabSpecs((prev) => !prev)}
            >
              {showLabSpecs ? "Hide Lab Specs" : "Lab Specs"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="size-3.5" />}
              onClick={handleExportCsv}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="size-3.5" />}
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button
              icon={<CalendarPlus className="size-4" />}
              onClick={() => {
                setPresetSlot(null);
                setShowCreateModal(true);
              }}
            >
              Book New Session
            </Button>
          </div>
        }
      />

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <div className="glass rounded-xl p-3.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Bookings
            </span>
            <Clock className="size-4 text-brand" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-foreground">
              {bookings.length}
            </span>
            <span className="text-xs font-medium text-muted-foreground">sessions this week</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="text-accent font-semibold">{confirmedCount} confirmed</span>
            <span>·</span>
            <span>{pendingCount} pending</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Active Hub Labs
            </span>
            <Building2 className="size-4 text-accent" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-foreground">3</span>
            <span className="text-xs font-medium text-muted-foreground">centers operational</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {totalSeats} student & teacher workstations
          </div>
        </div>

        <div className="glass rounded-xl p-3.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Confirmation Rate
            </span>
            <CheckCircle2 className="size-4 text-accent" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-accent">
              {bookings.length > 0 ? Math.round((confirmedCount / bookings.length) * 100) : 100}%
            </span>
            <span className="text-xs font-medium text-muted-foreground">schedule readiness</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            Facilitators allocated & verified
          </div>
        </div>

        <div
          onClick={() => {
            if (allConflicts.length > 0) {
              setSelectedStatus((prev) =>
                prev === "Conflicts Only" ? "All statuses" : "Conflicts Only"
              );
            }
          }}
          className={`glass rounded-xl p-3.5 transition-all ${
            allConflicts.length > 0
              ? "cursor-pointer border-amber/40 bg-amber/5 hover:border-amber/60"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Booking Collisions
            </span>
            <AlertTriangle
              className={`size-4 ${allConflicts.length > 0 ? "text-amber animate-pulse" : "text-muted-foreground"}`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`font-display text-2xl font-black ${
                allConflicts.length > 0 ? "text-amber" : "text-foreground"
              }`}
            >
              {allConflicts.length}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {allConflicts.length === 1 ? "collision flagged" : "collisions flagged"}
            </span>
          </div>
          <div className="mt-1 text-[11px]">
            {allConflicts.length > 0 ? (
              <span className="font-medium text-amber underline underline-offset-2">
                Click to filter conflicts
              </span>
            ) : (
              <span className="text-accent font-medium">Timetable 100% collision-free</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Collapsible Lab Specifications & Infrastructure Card */}
      {showLabSpecs && (
        <div className="glass rounded-2xl border border-brand/20 bg-brand/5 p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Laptop className="size-4 text-brand" />
              <h3 className="font-display text-sm font-bold text-foreground">
                Lab Center Infrastructure & Facilities
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">
              Equipment specs for workshop planning
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {Object.entries(LAB_SPECS).map(([centerName, specs]) => (
              <div key={centerName} className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-sm font-bold text-foreground">
                    {centerName.replace(" Hub Lab", "")}
                  </h4>
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-bold text-brand">
                    {specs.seats} PCs
                  </span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Laptop className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                    <span className="text-foreground/90">{specs.hardware}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wifi className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                    <span>{specs.connectivity}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <SunMedium className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                    <span>{specs.power}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                    <span>Lead: <strong className="text-foreground">{specs.coordinator}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Active Conflict Resolution Banner */}
      {visibleConflicts.length > 0 && (
        <div className="rounded-2xl border border-amber/40 bg-amber/10 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="size-5 text-amber shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-amber">
                  {visibleConflicts.length} Timetable Booking Collision{visibleConflicts.length > 1 ? "s" : ""}
                </h3>
                <p className="text-xs text-foreground/80 mt-0.5">
                  Overlapping educator workshops or clashes with primary school computer periods.
                </p>
              </div>
            </div>
            {selectedStatus === "Conflicts Only" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStatus("All statuses")}
                className="text-xs"
              >
                Clear conflict filter
              </Button>
            )}
          </div>

          <div className="mt-3 divide-y divide-amber/20 rounded-xl border border-amber/30 bg-card/60">
            {visibleConflicts.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">
                      {c.day} at {c.time}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="font-semibold text-brand">{c.center}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-foreground font-medium">{c.module}: {c.title}</span>
                  </div>
                  <p className="text-destructive font-medium">
                    {c.note || "Double-booked with another session or school schedule"}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    Facilitator: {c.facilitator} ({c.tier})
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs text-accent hover:border-accent"
                    icon={<Check className="size-3" />}
                    onClick={() => handleResolveConflict(c)}
                  >
                    Mark Resolved
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    icon={<Edit3 className="size-3" />}
                    onClick={() => setEditingSession(c)}
                  >
                    Reschedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Center Selector Tabs & Filter Bar */}
      <div className="glass rounded-2xl p-4 space-y-3.5">
        {/* Lab Center Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {["All centers", ...LAB_CENTERS].map((c) => {
              const isSelected = selectedCenter === c;
              const count =
                c === "All centers"
                  ? bookings.length
                  : bookings.filter((b) => b.center === c).length;

              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCenter(c)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-brand text-brand-foreground shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <MapPin className="size-3" />
                  <span>{c === "All centers" ? "All Centers" : c.replace(" Hub Lab", "")}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isSelected
                        ? "bg-brand-foreground/20 text-brand-foreground"
                        : "bg-background/80 text-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
            <button
              type="button"
              title="Timetable Matrix View"
              onClick={() => setViewMode("matrix")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === "matrix"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Matrix</span>
            </button>
            <button
              type="button"
              title="Weekly Columns View"
              onClick={() => setViewMode("columns")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === "columns"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Columns className="size-3.5" />
              <span className="hidden sm:inline">Columns</span>
            </button>
            <button
              type="button"
              title="Agenda List View"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === "table"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Bar: Facilitator, Tier, Status, and Search */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search title, module or center..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field pl-8.5 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Facilitator Select */}
          <div>
            <select
              aria-label="Filter by facilitator"
              value={selectedFacilitator}
              onChange={(e) => setSelectedFacilitator(e.target.value)}
              className="field text-xs font-medium"
            >
              <option value="All facilitators">All Facilitators</option>
              {FACILITATORS.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name} ({f.role.includes("Manager") ? "Manager" : "Coordinator"})
                </option>
              ))}
            </select>
          </div>

          {/* Tier Select */}
          <div>
            <select
              aria-label="Filter by school band"
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="field text-xs font-medium"
            >
              <option value="All tiers">All School Bands</option>
              <option value="Infants">Infants (ECD–Gr2)</option>
              <option value="Middle Junior">Middle Junior (Gr3–Gr4)</option>
              <option value="Upper Junior">Upper Junior (Gr5–Gr7)</option>
            </select>
          </div>

          {/* Status Select */}
          <div>
            <select
              aria-label="Filter by session status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="field text-xs font-medium"
            >
              <option value="All statuses">All Booking Statuses</option>
              <option value="Confirmed">Confirmed Only</option>
              <option value="Pending">Pending Only</option>
              <option value="Conflicts Only">Booking Conflicts Only</option>
            </select>
          </div>
        </div>

        {/* Results summary pill */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            Showing <strong className="text-foreground">{filteredSessions.length}</strong> of {bookings.length} scheduled sessions
          </span>
          {(selectedCenter !== "All centers" ||
            selectedFacilitator !== "All facilitators" ||
            selectedTier !== "All tiers" ||
            selectedStatus !== "All statuses" ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCenter("All centers");
                setSelectedFacilitator("All facilitators");
                setSelectedTier("All tiers");
                setSelectedStatus("All statuses");
                setSearchQuery("");
              }}
              className="text-brand font-semibold hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* 6. MAIN SCHEDULE VIEW CONTAINER */}

      {/* VIEW 1: WEEKLY TIMETABLE MATRIX */}
      {viewMode === "matrix" && (
        <div className="glass overflow-hidden rounded-2xl border border-border">
          <div className="overflow-x-auto">
            <div className="min-w-[920px]">
              {/* Matrix Header Row: Days */}
              <div className="grid grid-cols-6 border-b border-border bg-muted/40 text-center text-xs font-bold text-foreground">
                <div className="p-3 text-left pl-4 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Time Window
                </div>
                {DAYS.map((day) => {
                  const count = filteredSessions.filter((s) => s.day === day).length;
                  return (
                    <div key={day} className="p-3 border-l border-border/60">
                      <span className="font-display text-sm">{day}</span>
                      <span className="block text-[11px] font-normal text-muted-foreground">
                        {count} session{count === 1 ? "" : "s"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Matrix Rows: Time Blocks */}
              <div className="divide-y divide-border/60">
                {TIME_BLOCKS.map((block) => (
                  <div key={block.label} className="grid grid-cols-6 items-stretch">
                    {/* Time Window Column */}
                    <div className="bg-muted/20 p-3.5 pl-4 text-left border-r border-border/60">
                      <p className="font-display text-xs font-bold text-foreground leading-tight">
                        {block.label}
                      </p>
                      <p className="text-[11px] font-medium text-brand mt-1 flex items-center gap-1">
                        <Clock className="size-3" />
                        <span>{block.range}</span>
                      </p>
                    </div>

                    {/* Day Cells */}
                    {DAYS.map((day) => {
                      // Find sessions in this time block (rough match based on hour)
                      const cellSessions = filteredSessions.filter((s) => {
                        if (s.day !== day) return false;
                        const [hour] = s.time.split(":").map(Number);
                        if (block.label.includes("Morning") && !block.label.includes("Mid")) {
                          return hour >= 7 && hour < 10;
                        }
                        if (block.label.includes("Mid-Day")) {
                          return hour >= 10 && hour < 13;
                        }
                        if (block.label.includes("Afternoon") && !block.label.includes("Late")) {
                          return hour >= 13 && hour < 15.5;
                        }
                        return hour >= 15.5;
                      });

                      return (
                        <div
                          key={day}
                          className="group relative border-l border-border/60 p-2.5 transition-colors hover:bg-muted/15 flex flex-col justify-start min-h-[140px]"
                        >
                          {cellSessions.length > 0 ? (
                            <div className="space-y-2">
                              {cellSessions.map((s) => (
                                <SessionCard
                                  key={s.id}
                                  session={s}
                                  compact
                                  onEdit={() => setEditingSession(s)}
                                  onDelete={() => setDeletingSessionId(s.id)}
                                  onStatusChange={(status) => changeSessionStatus(s.id, status)}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setPresetSlot({
                                    day,
                                    time: block.defaultTime,
                                    center: selectedCenter !== "All centers" ? selectedCenter : undefined,
                                  });
                                  setShowCreateModal(true);
                                }}
                                className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border/80 px-3 py-3 text-[11px] font-medium text-muted-foreground opacity-60 transition-all hover:border-brand/60 hover:bg-brand/5 hover:text-brand hover:opacity-100"
                              >
                                <CalendarPlus className="size-3.5" />
                                <span>+ Book {block.defaultTime}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: WEEKLY COLUMNS (BOARD) VIEW */}
      {viewMode === "columns" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {DAYS.map((day) => {
            const daySessions = filteredSessions.filter((s) => s.day === day);
            return (
              <div key={day} className="glass flex flex-col rounded-2xl p-4 shadow-2xs">
                {/* Day Header */}
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">{day}</h3>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {daySessions.length} workshop{daySessions.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg"
                    title={`Add session on ${day}`}
                    onClick={() => {
                      setPresetSlot({ day, time: "09:00" });
                      setShowCreateModal(true);
                    }}
                  >
                    <CalendarPlus className="size-4 text-brand" />
                  </Button>
                </div>

                {/* Day Cards */}
                <div className="mt-3 flex-1 space-y-3">
                  {daySessions.length === 0 ? (
                    <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-4 text-center">
                      <p className="text-xs text-muted-foreground font-medium">No workshops booked</p>
                      <button
                        type="button"
                        onClick={() => {
                          setPresetSlot({ day, time: "09:00" });
                          setShowCreateModal(true);
                        }}
                        className="mt-2 text-[11px] font-semibold text-brand hover:underline"
                      >
                        + Book {day} slot
                      </button>
                    </div>
                  ) : (
                    daySessions.map((s) => (
                      <SessionCard
                        key={s.id}
                        session={s}
                        onEdit={() => setEditingSession(s)}
                        onDelete={() => setDeletingSessionId(s.id)}
                        onStatusChange={(status) => changeSessionStatus(s.id, status)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: AGENDAS & DETAILED TABLE VIEW */}
      {viewMode === "table" && (
        <div className="glass overflow-hidden rounded-2xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 pl-4">Day & Time</th>
                  <th className="p-3.5">Lab Center</th>
                  <th className="p-3.5">Module & Workshop Title</th>
                  <th className="p-3.5">School Band</th>
                  <th className="p-3.5">Facilitator</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No scheduled sessions match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((s) => (
                    <tr
                      key={s.id}
                      className={`transition-colors hover:bg-muted/20 ${
                        s.status === "Conflict" ? "bg-amber/5" : ""
                      }`}
                    >
                      <td className="p-3.5 pl-4 font-semibold text-foreground">
                        <span className="font-display font-bold text-brand">{s.day}</span>
                        <span className="block text-[11px] text-muted-foreground">{s.time}</span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <MapPin className="size-3 text-muted-foreground" />
                          <span>{s.center}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-foreground">
                          <span className="rounded-md bg-brand/10 px-1.5 py-0.5 text-[11px] font-bold text-brand mr-1.5">
                            {s.module}
                          </span>
                          {s.title}
                        </div>
                        {s.note && (
                          <p className="mt-0.5 text-[11px] text-destructive font-medium">
                            {s.note}
                          </p>
                        )}
                      </td>

                      <td className="p-3.5">
                        <TierPill tier={s.tier} />
                      </td>

                      <td className="p-3.5 font-medium text-foreground">
                        {s.facilitator}
                      </td>

                      <td className="p-3.5">
                        <select
                          aria-label={`Status for ${s.title}`}
                          value={s.status}
                          onChange={(e) =>
                            changeSessionStatus(s.id, e.target.value as SessionStatus)
                          }
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Pending">Pending</option>
                          <option value="Conflict">Conflict</option>
                        </select>
                      </td>

                      <td className="p-3.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            title="Edit workshop details"
                            onClick={() => setEditingSession(s)}
                          >
                            <Edit3 className="size-3.5 text-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:bg-destructive/10"
                            title="Remove session"
                            onClick={() => setDeletingSessionId(s.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. CREATE NEW SESSION MODAL */}
      {showCreateModal && (
        <SessionFormModal
          title="Schedule New Lab Session"
          subtitle="Timetable allocation for teacher workshops across Uncommon hubs"
          initialData={
            presetSlot
              ? {
                  day: presetSlot.day,
                  time: presetSlot.time,
                  center: presetSlot.center || LAB_CENTERS[0],
                }
              : undefined
          }
          onClose={() => {
            setShowCreateModal(false);
            setPresetSlot(null);
          }}
          onSave={async (data) => {
            await createSession(data);
            setShowCreateModal(false);
            setPresetSlot(null);
          }}
          checkCollision={checkCollision}
        />
      )}

      {/* 8. EDIT SESSION MODAL */}
      {editingSession && (
        <SessionFormModal
          title="Edit Lab Session"
          subtitle={`Updating booking for ${editingSession.module} · ${editingSession.title}`}
          initialData={editingSession}
          onClose={() => setEditingSession(null)}
          onSave={async (data) => {
            await updateSession(editingSession.id, data);
            setEditingSession(null);
          }}
          checkCollision={(day, time, center) =>
            checkCollision(day, time, center, editingSession.id)
          }
        />
      )}

      {/* 9. DELETE CONFIRMATION MODAL */}
      {deletingSessionId && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Cancel Booking?
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This session will be permanently removed from the timetable and Neon database.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingSessionId(null)}
              >
                Keep Session
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  await deleteSession(deletingSessionId);
                  setDeletingSessionId(null);
                }}
              >
                Yes, Delete Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SESSION CARD COMPONENT (Used in Matrix & Columns View)
// -------------------------------------------------------------
function SessionCard({
  session,
  compact = false,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  session: Session;
  compact?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: SessionStatus) => void;
}) {
  const isConflict = session.status === "Conflict";

  return (
    <div
      className={`group relative rounded-xl border p-3 transition-all ${
        isConflict
          ? "border-amber/50 bg-amber/10 shadow-2xs hover:border-amber/80"
          : "border-border/80 bg-card hover:border-brand/40 hover:shadow-xs"
      }`}
    >
      {/* Top row: Time and Status */}
      <div className="flex items-center justify-between gap-1.5">
        <span className="font-display text-xs font-bold text-foreground flex items-center gap-1">
          <Clock className="size-3 text-muted-foreground" />
          <span>{session.time}</span>
        </span>
        <StatusPill status={session.status} />
      </div>

      {/* Module badge & Title */}
      <div className="mt-2">
        <p className="font-display text-xs font-bold leading-snug text-foreground">
          <span className="rounded bg-brand/10 px-1.5 py-0.2 text-[10px] font-extrabold text-brand mr-1">
            {session.module}
          </span>
          {session.title}
        </p>
        <p className="mt-1 text-[11px] font-medium text-muted-foreground flex items-center gap-1">
          <MapPin className="size-3 text-accent shrink-0" />
          <span className="truncate">{session.center.replace(" Hub Lab", "")}</span>
        </p>
      </div>

      {/* Facilitator & Band */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-1 border-t border-border/50 pt-2 text-[11px]">
        <span className="font-medium text-foreground truncate max-w-[130px]" title={session.facilitator}>
          {session.facilitator}
        </span>
        <TierPill tier={session.tier} />
      </div>

      {/* Conflict banner note if present */}
      {isConflict && session.note && (
        <div className="mt-2 rounded-lg bg-amber/20 p-1.5 text-[10px] font-semibold text-amber flex items-start gap-1">
          <AlertTriangle className="size-3 shrink-0 mt-0.5" />
          <span>{session.note}</span>
        </div>
      )}

      {/* Hover action toolbar */}
      <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-2 text-xs">
        <select
          aria-label={`Status for ${session.title}`}
          value={session.status}
          onChange={(e) => onStatusChange(e.target.value as SessionStatus)}
          className="rounded-md border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground"
        >
          <option value="Confirmed">Confirmed</option>
          <option value="Pending">Pending</option>
          <option value="Conflict">Conflict</option>
        </select>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            title="Edit session"
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Edit3 className="size-3" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Remove session"
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// REUSABLE SESSION CREATE / EDIT MODAL FORM
// -------------------------------------------------------------
function SessionFormModal({
  title,
  subtitle,
  initialData,
  onClose,
  onSave,
  checkCollision,
}: {
  title: string;
  subtitle: string;
  initialData?: Partial<Session>;
  onClose: () => void;
  onSave: (data: {
    day: string;
    time: string;
    center: string;
    module: string;
    title: string;
    tier: Tier;
    facilitator: string;
    status?: SessionStatus;
    note?: string;
  }) => Promise<void>;
  checkCollision: (day: string, time: string, center: string) => string | null;
}) {
  const [day, setDay] = useState<string>(initialData?.day || "Mon");
  const [time, setTime] = useState<string>(initialData?.time || "09:00");
  const [center, setCenter] = useState<string>(initialData?.center || LAB_CENTERS[0]);
  const [moduleCode, setModuleCode] = useState<string>(initialData?.module || "M1");
  const [sessionTitle, setSessionTitle] = useState<string>(initialData?.title || "");
  const [tier, setTier] = useState<Tier>(initialData?.tier || "Infants");
  const [facilitator, setFacilitator] = useState<string>(
    initialData?.facilitator || FACILITATORS[0].name
  );
  const [note, setNote] = useState<string>(initialData?.note || "");
  const [saving, setSaving] = useState(false);

  // If module changes and user hasn't typed custom title, auto-fill standard title
  function handleModuleChange(code: string) {
    setModuleCode(code);
    const mod = curriculumModules.find((m) => m.code === code);
    if (mod && (!sessionTitle || curriculumModules.some((m) => m.name === sessionTitle))) {
      setSessionTitle(mod.name);
    }
  }

  // Live collision check
  const collisionWarning = checkCollision(day, time, center);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        day,
        time,
        center,
        module: moduleCode,
        title: sessionTitle || `Module ${moduleCode} Workshop`,
        tier,
        facilitator,
        status: collisionWarning ? "Conflict" : initialData?.status || "Pending",
        note: collisionWarning || note,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl my-8"
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close"
            icon={<X className="size-4" />}
            onClick={onClose}
          />
        </div>

        {/* Live Collision Warning Banner */}
        {collisionWarning && (
          <div className="mt-4 rounded-xl border border-amber/40 bg-amber/10 p-3 text-xs text-amber flex items-start gap-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Collision Warning:</strong> {collisionWarning}
              <p className="mt-0.5 text-[11px] text-foreground/80">
                You can still save; this booking will be flagged for coordinator review.
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3.5">
          {/* Day */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">Day of Week</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="field text-xs font-medium"
              required
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">Start Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="field text-xs font-medium"
              required
            />
          </div>

          {/* Lab Center */}
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-semibold text-foreground">Computer Lab Hub</label>
            <select
              value={center}
              onChange={(e) => setCenter(e.target.value)}
              className="field text-xs font-medium"
              required
            >
              {LAB_CENTERS.map((c) => (
                <option key={c} value={c}>
                  {c} ({LAB_SPECS[c]?.seats || 30} PCs)
                </option>
              ))}
            </select>
          </div>

          {/* Module Selector */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">Curriculum Module</label>
            <select
              value={moduleCode}
              onChange={(e) => handleModuleChange(e.target.value)}
              className="field text-xs font-medium"
              required
            >
              {curriculumModules.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.code} — {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* School Band / Tier */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">Teacher Band</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as Tier)}
              className="field text-xs font-medium"
              required
            >
              <option value="Infants">Infants (ECD–Gr2)</option>
              <option value="Middle Junior">Middle Junior (Gr3–Gr4)</option>
              <option value="Upper Junior">Upper Junior (Gr5–Gr7)</option>
            </select>
          </div>

          {/* Session Title */}
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-semibold text-foreground">Workshop Topic / Title</label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. Creating Digital Learning Aids"
              className="field text-xs font-medium"
              required
            />
          </div>

          {/* Facilitator */}
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-semibold text-foreground">Trainer Facilitator</label>
            <select
              value={facilitator}
              onChange={(e) => setFacilitator(e.target.value)}
              className="field text-xs font-medium"
              required
            >
              {FACILITATORS.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name} ({f.role})
                </option>
              ))}
            </select>
          </div>

          {/* Notes / Collision Explanation */}
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Coordination Notes (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Dual projector required, Grade 3 parallel session"
              className="field text-xs font-medium"
            />
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Saving to Timetable..." : "Confirm & Save Booking"}
          </Button>
        </div>
      </form>
    </div>
  );
}
