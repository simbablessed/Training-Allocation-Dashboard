import { useState } from "react";
import { useSignIn } from "@clerk/clerk-react";
import {
  ShieldCheck,
  ArrowRight,
  Loader2,
  KeyRound,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { useAppAuth } from "@/lib/clerk/provider";
import { TEST_ACCOUNTS } from "@/lib/clerk/client";
import { createSignInTicketFn } from "@/lib/functions";

export function SignInGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAppAuth();
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();

  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [manualPassword, setManualPassword] = useState("");
  const [error, setError] = useState("");

  // 2FA / Second Factor states
  const [showSecondFactor, setShowSecondFactor] = useState(false);
  const [secondFactorCode, setSecondFactorCode] = useState("");
  const [secondFactorStrategy, setSecondFactorStrategy] = useState<string>("email_code");
  const [verifyingCode, setVerifyingCode] = useState(false);

  // Authenticate using single-use Clerk ticket (bypasses OTP/2FA) with standard fallback
  async function handleAuthenticate(email: string, password: string = "Uncomm0n@26") {
    if (!signInLoaded || !signIn) return;
    setLoadingEmail(email);
    setError("");
    setShowSecondFactor(false);

    try {
      // 1. Primary path: Server-assisted Clerk Ticket authentication
      // Bypasses 2FA / OTP prompts completely and signs in directly
      try {
        const { token } = await createSignInTicketFn({
          data: { email: email.trim(), password: password.trim() },
        });

        if (token) {
          const ticketResult = await signIn.create({
            strategy: "ticket",
            ticket: token,
          });

          if (ticketResult.status === "complete") {
            await setActive({ session: ticketResult.createdSessionId });
            window.location.href = "/";
            return;
          }
        }
      } catch (ticketErr: any) {
        console.warn("Direct ticket sign-in notice:", ticketErr?.message);
        // If password explicitly failed validation on server, display clear message
        if (ticketErr?.message?.toLowerCase().includes("invalid")) {
          setError("Incorrect email or password. Please verify your credentials.");
          return;
        }
      }

      // 2. Fallback path: Standard client signIn.create
      const result = await signIn.create({
        identifier: email.trim(),
        password: password.trim(),
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/";
        return;
      }

      // 3. Gracefully handle second factor if Clerk demands it
      if (result.status === "needs_second_factor") {
        const supported = result.supportedSecondFactors || [];
        const emailCodeFactor = supported.find((f: any) => f.strategy === "email_code");
        const totpFactor = supported.find((f: any) => f.strategy === "totp");

        if (emailCodeFactor) {
          setSecondFactorStrategy("email_code");
          try {
            await result.prepareSecondFactor({ strategy: "email_code" });
          } catch (prepErr) {
            console.warn("prepareSecondFactor notice:", prepErr);
          }
          setShowSecondFactor(true);
          return;
        } else if (totpFactor) {
          setSecondFactorStrategy("totp");
          setShowSecondFactor(true);
          return;
        } else if (supported.length > 0) {
          setSecondFactorStrategy(supported[0].strategy);
          setShowSecondFactor(true);
          return;
        }
      }

      setError(`Authentication status: ${result.status}. Please try again.`);
    } catch (err: any) {
      console.error("Sign-in error:", err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Could not sign in with provided credentials.";
      setError(msg);
    } finally {
      setLoadingEmail(null);
    }
  }

  // Handle second factor OTP verification
  async function handleVerifySecondFactor(e: React.FormEvent) {
    e.preventDefault();
    if (!signInLoaded || !signIn) return;
    setVerifyingCode(true);
    setError("");

    try {
      const res = await signIn.attemptSecondFactor({
        strategy: secondFactorStrategy as any,
        code: secondFactorCode.trim(),
      });

      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        window.location.href = "/";
      } else {
        setError(`Verification status: ${res.status}`);
      }
    } catch (err: any) {
      console.error("Second factor error:", err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Invalid 6-digit verification code. Please check and try again.";
      setError(msg);
    } finally {
      setVerifyingCode(false);
    }
  }

  // Prevent white screen on refresh/loading: always show branded splash screen
  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="grid size-12 place-items-center rounded-xl bg-brand text-brand-foreground font-display font-extrabold text-xl shadow-xs animate-pulse">
            u.
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin text-brand" />
            <span>Loading TutorTrack workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, render portal content
  if (isSignedIn) {
    return <>{children}</>;
  }

  // Signed out view: non-scrollable, styled to match TutorTrack UI with subtle ambient breathing visuals
  return (
    <div className="relative flex h-screen max-h-[100dvh] w-full flex-col justify-between overflow-hidden bg-background text-foreground selection:bg-brand/15 selection:text-brand">
      {/* Ambient background visuals: subtle breathing orbs & dot pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(var(--ink) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Primary breathing orb (Brand purple/blue glow) - top center behind the login card */}
        <div
          className="animate-orb-1 absolute -top-[22%] left-1/2 size-[580px] rounded-full blur-[105px] sm:size-[700px]"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--brand) 34%, transparent) 0%, color-mix(in oklab, var(--brand) 10%, transparent) 48%, transparent 70%)",
          }}
        />

        {/* Secondary breathing orb (Accent green/teal glow) - bottom right */}
        <div
          className="animate-orb-2 absolute -bottom-[16%] -right-[8%] size-[480px] rounded-full blur-[95px] sm:size-[560px]"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--accent) 28%, transparent) 0%, color-mix(in oklab, var(--accent) 8%, transparent) 52%, transparent 70%)",
          }}
        />

        {/* Tertiary breathing orb (Warm amber glow) - bottom left */}
        <div
          className="animate-orb-3 absolute -bottom-[18%] -left-[10%] size-[420px] rounded-full blur-[90px] sm:size-[500px]"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--amber) 22%, transparent) 0%, color-mix(in oklab, var(--amber) 6%, transparent) 48%, transparent 68%)",
          }}
        />
      </div>

      {/* Top minimal header */}
      <header className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/85 backdrop-blur-md px-4 md:px-8">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground font-display font-extrabold text-base shadow-xs">
            u.
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <p className="font-display text-[16px] font-extrabold leading-none text-primary">uncommon</p>
            <span className="hidden text-[11px] font-semibold text-muted-foreground sm:inline">
              Training Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            <ShieldCheck className="size-3 text-brand" />
            <span className="hidden sm:inline">Educator MIS ·</span> Term 3 2026
          </span>
        </div>
      </header>

      {/* Centered Login View - strictly non-scrollable */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-2 min-h-0">
        <div className="w-full max-w-[430px]">
          {/* Glass Card */}
          <div className="glass rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xl">
            {/* Header */}
            <div className="mb-4 text-center">
              <div className="mx-auto mb-2 grid size-10 place-items-center rounded-xl bg-brand text-brand-foreground shadow-xs">
                <span className="font-display text-lg font-black leading-none">u.</span>
              </div>
              <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
                Sign in to TutorTrack
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Educator ICT Allocation & M&E Portal
              </p>
            </div>

            {error && (
              <div className="mb-3 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive flex items-start gap-2">
                <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                <span className="min-w-0">{error}</span>
              </div>
            )}

            {/* 1. Two-Factor Verification Form */}
            {showSecondFactor ? (
              <form onSubmit={handleVerifySecondFactor} className="space-y-3">
                <div className="rounded-xl border border-brand/20 bg-brand/5 p-3 text-center">
                  <p className="text-xs font-semibold text-foreground">
                    Verification Code Required
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {secondFactorStrategy === "email_code"
                      ? "A 6-digit code has been sent to your email address."
                      : "Enter the 6-digit code from your authenticator app."}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    6-digit code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={secondFactorCode}
                    onChange={(e) => setSecondFactorCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="field text-center text-lg tracking-widest font-mono font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifyingCode || secondFactorCode.length < 6}
                  className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-display font-semibold text-xs py-2.5 rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
                >
                  {verifyingCode ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Verifying code...</span>
                    </>
                  ) : (
                    <span>Complete Sign In</span>
                  )}
                </button>

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSecondFactor(false);
                      setSecondFactorCode("");
                    }}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            ) : !showManualForm ? (
              /* 2. Quick Staff Sign-In Options (No OTP) */
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Quick Staff Sign-In (No OTP)
                  </span>
                  <span className="text-[10px] text-accent font-medium flex items-center gap-1">
                    <UserCheck className="size-3" />
                    Instant Access
                  </span>
                </div>

                {TEST_ACCOUNTS.map((acc) => {
                  const isLoading = loadingEmail === acc.email;
                  const initials = acc.name
                    .split(/\s+/)
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("");

                  return (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={Boolean(loadingEmail)}
                      onClick={() => handleAuthenticate(acc.email, acc.password)}
                      className="group flex w-full items-center justify-between rounded-xl border border-border bg-background p-2.5 text-left transition-all hover:border-brand/50 hover:bg-brand/5 active:scale-[0.99] disabled:opacity-60"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/10 font-display text-xs font-bold text-brand group-hover:bg-brand group-hover:text-brand-foreground transition-colors">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-foreground">
                            {acc.name}
                          </p>
                          <p className="truncate text-[11px] text-brand font-medium">
                            {acc.role}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center pr-1 text-muted-foreground group-hover:text-brand transition-colors">
                        {isLoading ? (
                          <Loader2 className="size-4 animate-spin text-brand" />
                        ) : (
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        )}
                      </div>
                    </button>
                  );
                })}

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(true)}
                    className="text-[11px] font-semibold text-brand hover:underline inline-flex items-center gap-1"
                  >
                    <KeyRound className="size-3" />
                    <span>Sign in with other email & password</span>
                  </button>
                </div>
              </div>
            ) : (
              /* 3. Manual Email & Password Form */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAuthenticate(manualEmail, manualPassword);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="name@uncommon.org"
                    className="field"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    placeholder="Enter password"
                    className="field"
                  />
                </div>

                <button
                  type="submit"
                  disabled={Boolean(loadingEmail)}
                  className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-display font-semibold text-xs py-2.5 rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
                >
                  {loadingEmail ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign in</span>
                  )}
                </button>

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                  >
                    ← Back to Quick Sign-In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Minimal bottom footer */}
      <footer className="relative z-10 flex h-9 shrink-0 items-center justify-center border-t border-border/60 bg-card/60 backdrop-blur-xs px-4 text-[10px] text-muted-foreground">
        <span>Protected training portal for accredited Uncommon facilitators and educators.</span>
      </footer>
    </div>
  );
}
