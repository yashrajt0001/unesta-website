"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import UnestaLogo from "@/components/brand/Logo";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast";
import { ApiError, authApi } from "@/lib/api";

const RESEND_SECONDS = 30;

function isValidPhone(raw: string) {
  return /^\+?\d{10,15}$/.test(raw.trim());
}

function isValidEmail(raw: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search?.get("next") || "/";

  const { sendOtp, verifyOtp, isAuthenticated, isLoading, refreshUser } =
    useAuth();
  const toast = useToast();

  const [step, setStep] = useState<"phone" | "otp" | "details">("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState<{
    phone?: string;
    otp?: string;
    firstName?: string;
    email?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const fullPhone = `${countryCode}${phone.replace(/\D/g, "")}`;
  const otpValue = digits.join("");

  useEffect(() => {
    if (!isLoading && isAuthenticated && step === "phone") {
      router.replace(next);
    }
  }, [isLoading, isAuthenticated, step, router, next]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (step === "otp") otpRefs.current[0]?.focus();
  }, [step]);

  async function handleSendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setErrors({});
    if (!isValidPhone(fullPhone)) {
      setErrors({ phone: "Enter a valid phone number with country code." });
      return;
    }
    setSubmitting(true);
    try {
      await sendOtp(fullPhone);
      toast.success(`OTP sent to ${fullPhone}`);
      setStep("otp");
      setDigits(Array(6).fill(""));
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Could not send OTP.";
      setErrors({ phone: msg });
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setErrors({});
    if (!/^\d{6}$/.test(otpValue)) {
      setErrors({ otp: "Enter the 6-digit OTP." });
      return;
    }
    setSubmitting(true);
    try {
      const { isNewUser } = await verifyOtp(fullPhone, otpValue);
      if (isNewUser) {
        toast.success("Account created. Just a few more details.");
        setStep("details");
      } else {
        toast.success("Signed in.");
        router.replace(next);
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Could not verify OTP.";
      setErrors({ otp: msg });
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveDetails(e?: React.FormEvent) {
    e?.preventDefault();
    const nextErrors: typeof errors = {};
    if (!firstName.trim()) nextErrors.firstName = "First name is required.";
    if (email && !isValidEmail(email)) nextErrors.email = "Enter a valid email.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    try {
      await authApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
      });
      await refreshUser();
      toast.success("Welcome to UNesta!");
      router.replace(next);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not save your details.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDigitChange(idx: number, raw: string) {
    const c = raw.replace(/\D/g, "");
    if (!c) {
      setDigits((d) => d.map((v, i) => (i === idx ? "" : v)));
      return;
    }
    if (c.length > 1) {
      // Paste
      const arr = c.slice(0, 6 - idx).split("");
      setDigits((d) => {
        const out = [...d];
        arr.forEach((ch, k) => {
          if (idx + k < 6) out[idx + k] = ch;
        });
        return out;
      });
      const focusIdx = Math.min(idx + arr.length, 5);
      otpRefs.current[focusIdx]?.focus();
      return;
    }
    setDigits((d) => d.map((v, i) => (i === idx ? c : v)));
    if (idx < 5) otpRefs.current[idx + 1]?.focus();
  }

  function handleDigitKey(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowLeft" && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <nav className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Link
            href="/"
            aria-label="Back to home"
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </Link>
          <UnestaLogo className="text-[17px] text-on-surface" />
          <div className="w-6" />
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center pt-10 pb-16 px-4">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-[2rem] shadow-float p-8 space-y-6 animate-scale-in">
          <header className="text-center space-y-2">
            <h1 className="font-headline text-2xl font-semibold">Join UNesta</h1>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              {step === "phone" &&
                "Create an account with your phone number — no password needed."}
              {step === "otp" && `Enter the 6-digit code sent to ${fullPhone}.`}
              {step === "details" && "Tell us a little about yourself."}
            </p>
          </header>

          {step === "phone" && (
            <form className="space-y-4" onSubmit={handleSendOtp} noValidate>
              <div className="space-y-1">
                <label
                  htmlFor="signup-phone"
                  className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1"
                >
                  Mobile number
                </label>
                <div className="flex gap-2">
                  <select
                    aria-label="Country code"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-surface-container-high rounded-2xl py-4 px-3 font-medium outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+61">+61</option>
                    <option value="+971">+971</option>
                  </select>
                  <input
                    id="signup-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    autoFocus
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 15));
                      if (errors.phone) setErrors({});
                    }}
                    aria-invalid={!!errors.phone}
                    className={`flex-1 bg-surface-container-high rounded-2xl py-4 px-5 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-outline/60 ${
                      errors.phone ? "ring-2 ring-error/40" : ""
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-error font-medium ml-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-on-primary py-4 rounded-full font-bold tracking-tight press hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-glow-primary"
              >
                {submitting ? "Sending OTP…" : "Send OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form className="space-y-4" onSubmit={handleVerifyOtp} noValidate>
              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                    OTP verification
                  </label>
                  <button
                    className="text-[11px] font-bold text-primary hover:underline disabled:text-on-surface-variant/60 disabled:no-underline"
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={resendIn > 0 || submitting}
                  >
                    {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={i === 0 ? "one-time-code" : "off"}
                      maxLength={6}
                      value={d}
                      aria-label={`Digit ${i + 1}`}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleDigitKey(i, e)}
                      onFocus={(e) => e.target.select()}
                      className={`w-full aspect-square text-center bg-surface-container-high rounded-xl text-lg font-bold focus:ring-2 focus:ring-primary/30 outline-none transition ${
                        errors.otp ? "ring-2 ring-error/40" : ""
                      }`}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="text-xs text-error font-medium ml-1">
                    {errors.otp}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || otpValue.length !== 6}
                className="w-full bg-primary text-on-primary py-4 rounded-full font-bold tracking-tight press hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-glow-primary"
              >
                {submitting ? "Verifying…" : "Verify"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setDigits(Array(6).fill(""));
                  setErrors({});
                }}
                className="w-full text-on-surface-variant hover:text-on-surface text-sm font-medium"
              >
                ← Change number
              </button>
            </form>
          )}

          {step === "details" && (
            <form className="space-y-4" onSubmit={handleSaveDetails} noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="first-name"
                    className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1"
                  >
                    First name
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    autoComplete="given-name"
                    autoFocus
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (errors.firstName) setErrors((p) => ({ ...p, firstName: undefined }));
                    }}
                    maxLength={50}
                    aria-invalid={!!errors.firstName}
                    className={`w-full bg-surface-container-high rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-primary/30 ${
                      errors.firstName ? "ring-2 ring-error/40" : ""
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="last-name"
                    className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1"
                  >
                    Last name
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    maxLength={50}
                    className="w-full bg-surface-container-high rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              {errors.firstName && (
                <p className="text-xs text-error font-medium ml-1">
                  {errors.firstName}
                </p>
              )}

              <div className="space-y-1">
                <label
                  htmlFor="signup-email"
                  className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1"
                >
                  Email (optional)
                </label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  aria-invalid={!!errors.email}
                  className={`w-full bg-surface-container-high rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-primary/30 ${
                    errors.email ? "ring-2 ring-error/40" : ""
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-error font-medium ml-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-on-primary py-4 rounded-full font-bold tracking-tight press hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-glow-primary"
              >
                {submitting ? "Saving…" : "Finish setup"}
              </button>
              <button
                type="button"
                onClick={() => router.replace(next)}
                className="w-full text-on-surface-variant hover:text-on-surface text-sm font-medium"
              >
                Skip for now
              </button>
            </form>
          )}

          {step !== "details" && (
            <p className="text-center text-sm text-on-surface-variant pt-2">
              Already have an account?
              <Link
                href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                className="text-primary font-bold hover:underline ml-1"
              >
                Log in
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
