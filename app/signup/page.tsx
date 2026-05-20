"use client";

import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <header className="mb-8 text-center">
        <Link href="/" className="font-headline text-3xl font-bold tracking-tighter text-on-surface">
          UNesta
        </Link>
      </header>

      {/* Sign Up Card */}
      <main className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-[0_20px_40px_rgba(26,28,28,0.03)] p-8 flex flex-col gap-6 mb-24">
        {/* Heading Section */}
        <div className="text-center space-y-2">
          <h2 className="font-headline text-2xl font-bold text-on-surface">Join UNesta</h2>
          <p className="text-on-surface-variant font-body leading-relaxed text-sm">
            Join our curated collection of heritage stays in Udaipur.
          </p>
        </div>

        {/* Form Section */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
              Email Address
            </label>
            <input
              className="w-full bg-surface-container-high border-none rounded-2xl py-4 px-5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 outline-none"
              placeholder="Enter your email"
              type="email"
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
              Mobile Number
            </label>
            <div className="flex gap-2">
              <div className="bg-surface-container-high rounded-2xl py-4 px-4 text-on-surface font-medium flex items-center gap-1">
                <span>+91</span>
              </div>
              <input
                className="w-full bg-surface-container-high border-none rounded-2xl py-4 px-5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 outline-none"
                placeholder="Phone number"
                type="tel"
              />
            </div>
          </div>

          {/* OTP Verification */}
          <div className="space-y-1">
            <div className="flex justify-between items-end mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                OTP Verification
              </label>
              <button className="text-[11px] font-bold text-primary hover:underline" type="button">
                Resend OTP
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <input
                  key={i}
                  className="w-full aspect-square text-center bg-surface-container-high border-none rounded-xl text-lg font-bold text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 outline-none"
                  maxLength={1}
                  type="text"
                />
              ))}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1 relative">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
              Create Password
            </label>
            <div className="relative">
              <input
                className="w-full bg-surface-container-high border-none rounded-2xl py-4 px-5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 outline-none pr-12"
                placeholder="Min. 8 characters"
                type="password"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant" type="button">
                <span className="material-symbols-outlined text-xl">visibility</span>
              </button>
            </div>
          </div>

          {/* Primary Action */}
          <button
            className="w-full bg-primary text-on-primary py-4 rounded-full font-bold tracking-tight hover:opacity-90 active:scale-95 transition-all duration-300 mt-4 shadow-lg shadow-primary/20"
            type="submit"
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline">or continue with</span>
          <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
        </div>

        {/* Social Auth */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-3 bg-surface-container-high py-3 rounded-full hover:bg-surface-container transition-colors duration-300 active:scale-95">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
              mail
            </span>
            <span className="text-sm font-semibold text-on-surface">Google</span>
          </button>
          <button className="flex items-center justify-center gap-3 bg-surface-container-high py-3 rounded-full hover:bg-surface-container transition-colors duration-300 active:scale-95">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
              phone_iphone
            </span>
            <span className="text-sm font-semibold text-on-surface">Apple</span>
          </button>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-on-surface-variant">
            Already have an account?
            <Link href="/login" className="text-primary font-bold hover:underline ml-1">
              Log in
            </Link>
          </p>
        </div>
      </main>

      {/* Aesthetic Decorative Image (Top Right) */}
      <div className="fixed top-0 right-0 w-48 h-48 -mr-12 -mt-12 opacity-40 z-[-1] pointer-events-none">
        <img 
          className="w-full h-full object-cover rounded-full"
          alt="Decorative Pattern"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfVhG-A9Z4NE4O4VD3__E-K3Veue6SYqTog_sJd5ZJpUQ-qJFw-xewyI-7Hc3TY5GYs4XylBlCCRdZ6KnuC6TpccCjmkwKlKqDiJBdsvpyFDR2mn6VHQY5COUXkH9mgpW39_ReIZ6bBeAU9wtKw1RwmSC4lM3ExbOdj1KbYBLnR9Po1Rk4Fb0KNli9wumMPXq4Nz18JGjLKHzQllPF5tQoZYKAVd_jB5QhNXlMOUKOkY3X9496pECD_WnQJspLIR8ohGrR6uHgGz8" 
        />
      </div>
    </div>
  );
}
