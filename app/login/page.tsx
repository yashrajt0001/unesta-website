"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast";
import { ApiError } from "@/lib/api";

const RESEND_SECONDS = 30;

function isValidPhone(raw: string) {
  // Backend requires 10–15 chars. Accept digits with optional leading +.
  return /^\+?\d{10,15}$/.test(raw.trim());
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search?.get("next") || "/";

  const { sendOtp, verifyOtp, isAuthenticated, isLoading } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const otpInputRef = useRef<HTMLInputElement | null>(null);

  // If already authed, send them onward
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(next);
    }
  }, [isLoading, isAuthenticated, router, next]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (step === "otp") otpInputRef.current?.focus();
  }, [step]);

  const fullPhone = `${countryCode}${phone.replace(/\D/g, "")}`;

  async function handleSendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setPhoneError(null);

    if (!isValidPhone(fullPhone)) {
      setPhoneError("Enter a valid phone number with country code.");
      return;
    }

    setSubmitting(true);
    try {
      await sendOtp(fullPhone);
      toast.success(`OTP sent to ${fullPhone}`);
      setStep("otp");
      setOtp("");
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not send OTP. Try again.";
      setPhoneError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setOtpError(null);

    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Enter the 6-digit OTP.");
      return;
    }

    setSubmitting(true);
    try {
      const { isNewUser } = await verifyOtp(fullPhone, otp);
      toast.success(isNewUser ? "Welcome to UNesta!" : "Signed in.");
      router.replace(next);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not verify OTP.";
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* Simplified top bar */}
      <nav className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Link
            href="/"
            aria-label="Back to home"
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </Link>
          <span className="font-headline font-bold text-xl tracking-tighter">
            UNesta
          </span>
          <div className="w-6" />
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center pt-10 pb-24 px-4 sm:px-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-surface-container-lowest rounded-[2rem] shadow-float animate-scale-in">
          {/* Side image */}
          <div className="hidden lg:block relative min-h-[560px]">
            <img
              className="absolute inset-0 w-full h-full object-cover"
              alt="Udaipur Lake Palace at dusk"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfVhG-A9Z4NE4O4VD3__E-K3Veue6SYqTog_sJd5ZJpUQ-qJFw-xewyI-7Hc3TY5GYs4XylBlCCRdZ6KnuC6TpccCjmkwKlKqDiJBdsvpyFDR2mn6VHQY5COUXkH9mgpW39_ReIZ6bBeAU9wtKw1RwmSC4lM3ExbOdj1KbYBLnR9Po1Rk4Fb0KNli9wumMPXq4Nz18JGjLKHzQllPF5tQoZYKAVd_jB5QhNXlMOUKOkY3X9496pECD_WnQJspLIR8ohGrR6uHgGz8"
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
            <div className="absolute bottom-10 left-10 right-10 text-white">
              <p className="font-headline text-3xl font-light leading-tight tracking-tight">
                Discover the heart of the White City.
              </p>
            </div>
          </div>

          {/* Form column */}
          <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
            <header className="mb-8 text-center lg:text-left">
              <h1 className="font-headline text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
                {step === "phone" ? "Welcome to UNesta" : "Verify your number"}
              </h1>
              <p className="text-on-surface-variant text-base leading-relaxed">
                {step === "phone"
                  ? "Sign in or create your account with your phone number."
                  : `We sent a 6-digit code to ${fullPhone}.`}
              </p>
            </header>

            {step === "phone" ? (
              <form className="space-y-5" onSubmit={handleSendOtp} noValidate>
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1"
                  >
                    Mobile number
                  </label>
                  <div className="flex gap-2">
                    <select
                      aria-label="Country code"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-surface-container-high rounded-2xl py-4 px-3 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+61">+61</option>
                      <option value="+971">+971</option>
                    </select>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      autoFocus
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, "").slice(0, 15);
                        setPhone(cleaned);
                        if (phoneError) setPhoneError(null);
                      }}
                      aria-invalid={!!phoneError}
                      aria-describedby={phoneError ? "phone-error" : undefined}
                      className={`flex-1 bg-surface-container-high rounded-2xl py-4 px-5 text-on-surface placeholder:text-outline/60 outline-none focus:ring-2 focus:ring-primary/30 transition ${
                        phoneError ? "ring-2 ring-error/40" : ""
                      }`}
                    />
                  </div>
                  {phoneError && (
                    <p id="phone-error" className="text-xs text-error font-medium ml-1">
                      {phoneError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-8 bg-primary text-on-primary font-semibold text-base rounded-full press hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed shadow-glow-primary"
                >
                  {submitting ? "Sending OTP…" : "Continue"}
                </button>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleVerifyOtp} noValidate>
                <div className="space-y-2">
                  <label
                    htmlFor="otp"
                    className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1"
                  >
                    One-time password
                  </label>
                  <input
                    id="otp"
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      if (otpError) setOtpError(null);
                    }}
                    aria-invalid={!!otpError}
                    aria-describedby={otpError ? "otp-error" : undefined}
                    className={`w-full bg-surface-container-high rounded-2xl py-4 px-5 text-on-surface text-center text-2xl font-semibold tracking-[0.5em] outline-none focus:ring-2 focus:ring-primary/30 transition ${
                      otpError ? "ring-2 ring-error/40" : ""
                    }`}
                  />
                  {otpError && (
                    <p id="otp-error" className="text-xs text-error font-medium ml-1">
                      {otpError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || otp.length !== 6}
                  className="w-full py-4 px-8 bg-primary text-on-primary font-semibold text-base rounded-full press hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed shadow-glow-primary"
                >
                  {submitting ? "Verifying…" : "Verify & continue"}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setOtpError(null);
                    }}
                    className="text-on-surface-variant hover:text-on-surface font-medium"
                  >
                    ← Change number
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={resendIn > 0 || submitting}
                    className="text-primary font-semibold disabled:text-on-surface-variant/60 disabled:cursor-not-allowed"
                  >
                    {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                  </button>
                </div>
              </form>
            )}

            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-outline-variant/30" />
              </div>
              <span className="relative px-4 bg-surface-container-lowest text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">
                or continue with
              </span>
            </div>

            <button
              type="button"
              disabled
              title="Google sign-in coming soon"
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-surface-container-low rounded-2xl group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-on-surface-variant">
                mail
              </span>
              <span className="font-medium text-on-surface">
                Google (coming soon)
              </span>
            </button>

            <p className="mt-8 text-center text-sm text-on-surface-variant">
              New to UNesta? Signing in with a new number will create your
              account automatically.
            </p>
          </div>
        </div>
      </main>

      {/* Decorative blobs */}
      <div className="fixed top-1/4 -right-20 w-96 h-96 bg-secondary-container/20 rounded-full blur-[100px] -z-10" />
      <div className="fixed bottom-1/4 -left-20 w-64 h-64 bg-primary-container/10 rounded-full blur-[80px] -z-10" />
    </div>
  );
}
