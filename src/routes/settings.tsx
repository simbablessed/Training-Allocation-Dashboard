import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Check, Cloud, Database, KeyRound, Loader2, RotateCcw, Save, ShieldCheck, X } from "lucide-react";
import { PageHeading } from "@/components/PageHeading";
import { Button } from "@/components/ui/button";
import { useTraining } from "@/lib/training-store";
import { useAppAuth } from "@/lib/clerk/provider";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Programme Settings | TutorTrack" },
      { name: "description", content: "Manage your profile picture and educator training KPI targets." },
      { property: "og:title", content: "Programme Settings | TutorTrack" },
      { property: "og:description", content: "Manage your profile picture and educator training KPI targets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const {
    settings,
    updateProgrammeSettings,
    uploadAvatarToR2,
    reset,
    isNeonConnected,
    isSyncing,
  } = useTraining();
  const { userEmail, userName, userRole } = useAppAuth();

  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function save(form: FormData) {
    const name = String(form.get("name")).trim();
    const role = String(form.get("role")).trim();
    const attendanceTarget = Number(form.get("attendanceTarget"));
    const scoreTarget = Number(form.get("scoreTarget"));
    const completionTarget = Number(form.get("completionTarget"));

    await updateProgrammeSettings({
      name,
      role,
      attendanceTarget,
      scoreTarget,
      completionTarget,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  }

  async function upload(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5_000_000) {
      setError("Choose an image under 5 MB.");
      return;
    }
    setError("");
    setUploading(true);

    try {
      await uploadAvatarToR2(file);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError("Failed to upload image to Cloudflare R2.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  const currentName = settings.name || userName || "Anesu Muchirewesi";
  const currentRole = settings.role || userRole || "Program Manager";

  return (
    <>
      <PageHeading
        eyebrow="Your workspace"
        title="Programme Settings"
        meta="Profile, targets & live cloud infrastructure"
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        {/* Main form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save(new FormData(e.currentTarget));
          }}
          className="glass rounded-xl p-5 sm:p-7 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Profile</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground">
              <span className={`size-2 rounded-full ${isNeonConnected ? "bg-accent" : "bg-amber"}`} />
              {isNeonConnected ? "Syncs to Neon" : "Offline mode"}
            </span>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-primary font-display text-xl font-bold text-primary-foreground shadow-xs">
              {uploading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : settings.photo ? (
                <img src={settings.photo} alt="Profile" className="size-full object-cover" />
              ) : (
                currentName
                  .split(/\s+/)
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => upload(e.target.files?.[0])}
                aria-label="Upload to Cloudflare R2"
              />
              <Button
                type="button"
                variant="outline"
                icon={<Camera className="size-4" />}
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? "Uploading to R2..." : "Upload photo to R2"}
              </Button>
              {settings.photo && (
                <Button
                  type="button"
                  variant="ghost"
                  icon={<X className="size-4" />}
                  onClick={() => updateProgrammeSettings({ photo: "" })}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
          {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Display name
              <input
                className="field mt-1.5"
                name="name"
                required
                defaultValue={currentName}
              />
            </label>
            <label className="text-sm font-semibold">
              Role
              <input
                className="field mt-1.5"
                name="role"
                required
                defaultValue={currentRole}
              />
            </label>
          </div>

          <h2 className="mt-8 font-display text-lg font-bold">M&E KPI Targets</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Targets configured here calibrate the dashboard status indicators, scorecard checks, and attendance alerts.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-semibold">
              Attendance %
              <input
                className="field mt-1.5"
                name="attendanceTarget"
                type="number"
                min="0"
                max="100"
                required
                defaultValue={settings.attendanceTarget}
              />
            </label>
            <label className="text-sm font-semibold">
              Post-test score
              <input
                className="field mt-1.5"
                name="scoreTarget"
                type="number"
                min="0"
                max="100"
                required
                defaultValue={settings.scoreTarget}
              />
            </label>
            <label className="text-sm font-semibold">
              Modules completed
              <input
                className="field mt-1.5"
                name="completionTarget"
                type="number"
                min="1"
                max="8"
                required
                defaultValue={settings.completionTarget}
              />
            </label>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button type="submit" disabled={isSyncing} icon={<Save className="size-4" />}>
              {isSyncing ? "Saving to Neon..." : "Save changes"}
            </Button>
            {saved && (
              <span role="status" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                <Check className="size-4" />
                Saved to Neon Postgres
              </span>
            )}
          </div>
        </form>

        {/* Stack info sidebar */}
        <div className="space-y-5">
          {/* Live Stack details */}
          <div className="glass rounded-xl p-5 shadow-xs">
            <h2 className="font-display text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="size-4 text-brand" />
              Connected Stack
            </h2>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-lg border border-border/70 bg-card/60 p-3">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Database className="size-3.5 text-accent" />
                    Neon Database
                  </span>
                  <span className="text-[10px] text-accent font-medium">LIVE</span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground truncate">
                  ep-spring-dream-ay6u3xt3
                </p>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/60 p-3">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Cloud className="size-3.5 text-brand" />
                    Cloudflare R2
                  </span>
                  <span className="text-[10px] text-brand font-medium">docflow</span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground truncate">
                  pub-d67807aaa37145a192f11b648bf83316.r2.dev
                </p>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/60 p-3">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="size-3.5 text-amber" />
                    Clerk Account
                  </span>
                  <span className="text-[10px] text-amber font-medium">AUTHENTICATED</span>
                </div>
                <p className="mt-1 text-[11px] text-foreground font-medium truncate">
                  {userEmail || "Signed in"}
                </p>
              </div>
            </div>
          </div>

          {/* Data & Sync card */}
          <div className="glass rounded-xl p-5 shadow-xs">
            <h2 className="font-display text-sm font-bold">Data & Sync</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Records are synced live with your Neon Postgres database and Cloudflare R2 bucket.
            </p>

            <div className="mt-4 pt-2 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                icon={<RotateCcw className="size-3.5" />}
                className="w-full text-xs"
                onClick={() => {
                  if (window.confirm("Reload latest live data from Neon database?")) {
                    reset();
                    window.location.reload();
                  }
                }}
              >
                Reload from database
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
