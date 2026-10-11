import { Link, useNavigate } from "@tanstack/react-router";
import { useClerk } from "@clerk/clerk-react";
import { Bell, Database, LogOut, RefreshCw, Search, Settings, UserRound, X, Cloud, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTraining } from "@/lib/training-store";
import { useAppAuth } from "@/lib/clerk/provider";

const nav = [
  { to: "/", label: "Overview" },
  { to: "/oversight", label: "Oversight" },
  { to: "/schedule", label: "Schedule" },
  { to: "/cohorts", label: "Classes" },
  { to: "/assessments", label: "Assessments" },
  { to: "/reports", label: "M&E Reports" },
] as const;

export function AppHeader() {
  const { settings, sessions, cohorts, isNeonConnected, isSyncing, refreshFromDatabase } = useTraining();
  const { userEmail, userName, userRole, userPhoto } = useAppAuth();
  const { signOut } = useClerk();
  const [panel, setPanel] = useState<"search" | "notifications" | "profile" | null>(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const displayName = userName || settings.name;
  const displayRole = userRole || settings.role;
  const avatarUrl = userPhoto || settings.photo;

  const conflicts = sessions.filter((s) => s.status === "Conflict");
  const atRisk = cohorts.filter((c) => c.attendance < settings.attendanceTarget || c.post < settings.scoreTarget);
  const results = [
    ...cohorts.filter((c) => `${c.name} ${c.center}`.toLowerCase().includes(query.toLowerCase())).map((c) => ({ label: `${c.name} (Class)`, detail: `${c.center} · Attendance ${c.attendance}%`, to: "/cohorts" as const })),
    ...cohorts.filter((c) => `${c.name} ${c.center}`.toLowerCase().includes(query.toLowerCase())).map((c) => ({ label: `${c.name} (Assessments)`, detail: `Pre: ${c.pre} → Post: ${c.post}`, to: "/assessments" as const })),
    ...sessions.filter((s) => `${s.title} ${s.center} ${s.module}`.toLowerCase().includes(query.toLowerCase())).map((s) => ({ label: s.title, detail: `${s.day} · ${s.center}`, to: "/schedule" as const })),
  ].slice(0, 8);

  const initials = displayName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  function toggle(next: typeof panel) {
    setPanel((current) => (current === next ? null : next));
  }

  return (
    <header className="sticky top-0 z-50 grid h-[72px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border bg-card px-4 md:flex md:justify-between md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-brand">
            <span className="font-display text-lg font-extrabold text-brand-foreground">u.</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-display text-[17px] font-extrabold leading-none text-primary">uncommon</p>
              <span className="hidden text-[12px] font-semibold text-muted-foreground sm:inline">Training Portal</span>
            </div>
          </div>
        </Link>

        {/* Live Stack Indicators */}
        <div className="hidden items-center gap-1.5 pl-3 lg:flex">
          <button
            type="button"
            onClick={() => refreshFromDatabase()}
            title="Data connected to Neon Postgres. Click to sync."
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
              isNeonConnected
                ? "border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
                : "border-amber/30 bg-amber/10 text-amber hover:bg-amber/20"
            }`}
          >
            <Database className="size-3" />
            <span>Neon</span>
            {isSyncing ? (
              <RefreshCw className="size-2.5 animate-spin" />
            ) : (
              <span className="size-1.5 rounded-full bg-accent" />
            )}
          </button>
          <span
            title="Cloudflare R2 Bucket 'docflow' configured for avatars and reports"
            className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand"
          >
            <Cloud className="size-3" />
            <span>R2</span>
          </span>
        </div>
      </div>

      <nav className="hidden items-center gap-2 text-[13px] font-medium">
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="shrink-0 rounded-full px-3.5 py-1.5 text-ink/55 transition-colors hover:bg-brand/10 hover:text-brand"
            activeProps={{ className: "bg-brand/15 text-brand hover:text-brand" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="icon" aria-label="Search" title="Search" onClick={() => toggle("search")} icon={<Search />} />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          title="Notifications"
          className="relative"
          onClick={() => toggle("notifications")}
          icon={
            <>
              <Bell />
              {conflicts.length + atRisk.length > 0 && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-amber" />}
            </>
          }
        />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open profile"
          title={`Signed in as ${displayName}`}
          className="overflow-hidden rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          onClick={() => toggle("profile")}
          icon={
            avatarUrl ? (
              <img src={avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-xs font-semibold">{initials}</span>
            )
          }
        />
      </div>

      {panel && (
        <div className="absolute right-3 top-[64px] z-50 w-[min(380px,calc(100vw-24px))] rounded-xl border border-border bg-card p-4 shadow-xl md:right-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold">
              {panel === "search" ? "Search training" : panel === "notifications" ? "Needs attention" : "Account & Stack"}
            </h2>
            <Button variant="ghost" size="icon" aria-label="Close panel" icon={<X />} onClick={() => setPanel(null)} />
          </div>

          {panel === "search" && (
            <>
              <input
                autoFocus
                aria-label="Search classes and sessions"
                className="field mt-2"
                placeholder="Class, module or centre"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="mt-2 max-h-72 overflow-y-auto">
                {query.trim() &&
                  results.map((result, index) => (
                    <Button
                      key={`${result.to}-${index}`}
                      variant="ghost"
                      className="h-auto w-full justify-start py-2 text-left"
                      onClick={() => {
                        navigate({ to: result.to });
                        setPanel(null);
                      }}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{result.label}</span>
                        <span className="block truncate text-xs text-muted-foreground">{result.detail}</span>
                      </span>
                    </Button>
                  ))}
                {query.trim() && !results.length && <p className="py-3 text-sm text-muted-foreground">No matches found.</p>}
                {!query.trim() && <p className="py-3 text-sm text-muted-foreground">Search classes and scheduled workshops.</p>}
              </div>
            </>
          )}

          {panel === "notifications" && (
            <div className="mt-2 max-h-72 space-y-1 overflow-y-auto">
              {conflicts.map((s) => (
                <Button
                  key={s.id}
                  variant="ghost"
                  className="h-auto w-full justify-start whitespace-normal py-2 text-left text-xs"
                  onClick={() => {
                    navigate({ to: "/schedule" });
                    setPanel(null);
                  }}
                >
                  <span>
                    <span className="block font-semibold text-amber">Lab conflict · {s.day} {s.time}</span>
                    {s.title} at {s.center}
                  </span>
                </Button>
              ))}
              {atRisk.map((c) => (
                <Button
                  key={c.id}
                  variant="ghost"
                  className="h-auto w-full justify-start whitespace-normal py-2 text-left text-xs"
                  onClick={() => {
                    navigate({ to: "/cohorts" });
                    setPanel(null);
                  }}
                >
                  <span>
                    <span className="block font-semibold text-amber">Below target · {c.name}</span>
                    Attendance {c.attendance}% · post-test {c.post}
                  </span>
                </Button>
              ))}
              {!conflicts.length && !atRisk.length && <p className="py-3 text-sm text-muted-foreground">All targets are on track.</p>}
            </div>
          )}

          {panel === "profile" && (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-border/80 bg-muted/40 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-primary font-display font-bold text-primary-foreground">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="size-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{userEmail || "Signed in with Clerk"}</p>
                    <span className="mt-0.5 inline-block rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                      {displayRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stack status summary */}
              <div className="rounded-xl border border-border/70 p-2.5 text-xs text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Database className="size-3.5 text-accent" />
                    Database
                  </span>
                  <span className="font-semibold text-foreground">Neon Serverless</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Cloud className="size-3.5 text-brand" />
                    Storage
                  </span>
                  <span className="font-semibold text-foreground">Cloudflare R2 (docflow)</span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <Button
                  variant="outline"
                  className="w-full justify-start text-xs font-semibold text-brand border-brand/30 hover:bg-brand/10"
                  icon={<ShieldCheck className="size-3.5 text-brand" />}
                  onClick={() => {
                    navigate({ to: "/oversight" });
                    setPanel(null);
                  }}
                >
                  Manager oversight cockpit
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs"
                  icon={<UserRound className="size-3.5" />}
                  onClick={() => {
                    navigate({ to: "/settings" });
                    setPanel(null);
                  }}
                >
                  Edit profile & targets
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs"
                  icon={<Settings className="size-3.5" />}
                  onClick={() => {
                    navigate({ to: "/settings" });
                    setPanel(null);
                  }}
                >
                  Programme settings
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start text-xs"
                  icon={<LogOut className="size-3.5" />}
                  onClick={async () => {
                    setPanel(null);
                    try {
                      await signOut();
                    } catch (e) {
                      console.warn("SignOut:", e);
                    }
                    window.location.href = "/";
                  }}
                >
                  Sign out
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
