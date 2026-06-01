"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useToast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/Skeleton";

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function ProfilePage() {
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  const { user, refreshUser, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setEmail(user.email ?? "");
  }, [user]);

  if (authLoading || !isAuthenticated) {
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </section>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!firstName.trim()) nextErrors.firstName = "First name is required.";
    if (email && !isValidEmail(email)) nextErrors.email = "Enter a valid email.";
    if (bio.length > 500) nextErrors.bio = "Bio must be under 500 characters.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await authApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      await refreshUser();
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not save profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    toast.info("Signed out.");
    router.push("/");
  }

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <header className="animate-fade-up">
        <h1 className="text-2xl sm:text-3xl font-headline font-semibold tracking-tight">
          Your profile
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Update the details we use across UNesta.
        </p>
      </header>

      <form onSubmit={handleSave} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="First name"
            value={firstName}
            onChange={setFirstName}
            error={errors.firstName}
            maxLength={50}
            required
          />
          <Field
            label="Last name"
            value={lastName}
            onChange={setLastName}
            maxLength={50}
          />
        </div>
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
        />
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-1 block">
            Bio (optional)
          </span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={3}
            className={`w-full px-5 py-3.5 bg-surface-container-high rounded-2xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/30 outline-none resize-none ${
              errors.bio ? "ring-2 ring-error/40" : ""
            }`}
            placeholder="Tell hosts a little about yourself."
          />
          <div className="flex justify-between mt-1 ml-1 text-xs text-on-surface-variant">
            <span>{errors.bio}</span>
            <span>{bio.length}/500</span>
          </div>
        </label>
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-primary text-on-primary font-semibold rounded-full shadow-glow-primary press disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      <div className="border-t border-outline-variant/30 pt-6 space-y-3">
        <h2 className="font-semibold">Account</h2>
        <p className="text-sm text-on-surface-variant">
          Signed in with{" "}
          <span className="font-bold text-on-surface">
            {user?.phone || user?.email}
          </span>
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/trips"
            className="px-4 py-2 text-sm font-semibold rounded-full bg-surface-container-low hover:bg-surface-container transition-colors"
          >
            My trips
          </Link>
          <Link
            href="/wishlists"
            className="px-4 py-2 text-sm font-semibold rounded-full bg-surface-container-low hover:bg-surface-container transition-colors"
          >
            Wishlists
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold rounded-full border border-outline-variant/40 text-error hover:bg-error-container/30 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-1 block">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        aria-invalid={!!error}
        className={`w-full px-5 py-3.5 bg-surface-container-high rounded-2xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/30 outline-none transition ${
          error ? "ring-2 ring-error/40" : ""
        }`}
      />
      {error && <p className="text-xs text-error font-medium mt-1 ml-1">{error}</p>}
    </label>
  );
}
