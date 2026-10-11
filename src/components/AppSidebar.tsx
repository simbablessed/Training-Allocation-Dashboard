import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Settings,
  UsersRound,
  ShieldCheck,
} from "lucide-react";

const sections = [
  {
    label: "Executive Oversight",
    links: [
      { to: "/oversight", label: "Manager oversight", icon: ShieldCheck },
    ],
  },
  {
    label: "Training",
    links: [
      { to: "/schedule", label: "Lab schedule", icon: CalendarDays },
      { to: "/cohorts", label: "Teacher classes", icon: UsersRound },
    ],
  },
  {
    label: "Quality & M&E",
    links: [
      { to: "/assessments", label: "Assessment results", icon: ClipboardCheck },
      { to: "/reports", label: "M&E reports", icon: BarChart3 },
    ],
  },
] as const;

const navClass =
  "flex min-w-0 items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand";

export function AppSidebar() {
  return (
    <>
    <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-64 shrink-0 self-start overflow-y-auto border-r border-border bg-card md:flex md:flex-col">
      <nav aria-label="Primary navigation" className="flex-1 px-3 py-4">
        <Link
          to="/"
          activeOptions={{ exact: true }}
          className={navClass}
          activeProps={{ className: "bg-secondary text-primary" }}
        >
          <LayoutDashboard className="size-4 shrink-0" />
          <span className="truncate">Dashboard</span>
        </Link>

        {sections.map((section) => (
          <section key={section.label} className="mt-6">
            <div className="mb-2 flex items-center justify-between px-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {section.label}
              </p>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              {section.links.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} to={item.to} className={navClass} activeProps={{ className: "bg-secondary text-primary" }}>
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-1 flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-muted-foreground">
          <GraduationCap className="size-4 shrink-0" />
          <span>Educator Training MIS</span>
        </div>
        <Link to="/settings" className={navClass} activeProps={{ className: "bg-secondary text-primary" }}>
          <Settings className="size-4 shrink-0" />
          <span>Programme settings</span>
        </Link>
      </div>
    </aside>
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
      {[
        { to: "/", label: "Overview", icon: LayoutDashboard },
        { to: "/schedule", label: "Schedule", icon: CalendarDays },
        { to: "/cohorts", label: "Classes", icon: UsersRound },
        { to: "/assessments", label: "Results", icon: ClipboardCheck },
        { to: "/reports", label: "Reports", icon: BarChart3 },
      ].map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="flex min-w-0 flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[10px] font-semibold text-muted-foreground hover:bg-brand/10 hover:text-brand"
            activeProps={{ className: "text-primary" }}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
    </>
  );
}