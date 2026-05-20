"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col">
      {/* TopAppBar - Simplified for Login */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-surface/70 backdrop-blur-xl">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Link 
            href="/"
            className="text-primary hover:opacity-80 transition-opacity active:scale-95"
          >
            <span className="material-symbols-outlined">close</span>
          </Link>
          <span className="font-headline font-bold text-xl text-on-surface tracking-tighter">UNesta</span>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center pt-24 pb-32 px-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden bg-surface-container-lowest rounded-xl shadow-[0_60px_100px_rgba(26,28,28,0.04)]">
          {/* Side Image (Visual Anchor) */}
          <div className="hidden lg:block relative min-h-[600px]">
            <img 
              className="absolute inset-0 w-full h-full object-cover"
              alt="Udaipur Lake Palace"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfVhG-A9Z4NE4O4VD3__E-K3Veue6SYqTog_sJd5ZJpUQ-qJFw-xewyI-7Hc3TY5GYs4XylBlCCRdZ6KnuC6TpccCjmkwKlKqDiJBdsvpyFDR2mn6VHQY5COUXkH9mgpW39_ReIZ6bBeAU9wtKw1RwmSC4lM3ExbOdj1KbYBLnR9Po1Rk4Fb0KNli9wumMPXq4Nz18JGjLKHzQllPF5tQoZYKAVd_jB5QhNXlMOUKOkY3X9496pECD_WnQJspLIR8ohGrR6uHgGz8" 
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
            <div className="absolute bottom-12 left-12 right-12 text-on-primary">
              <p className="font-headline text-3xl font-light leading-tight tracking-tight">
                Discover the heart of the White City.
              </p>
            </div>
          </div>

          {/* Login Canvas */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="mb-10 text-center lg:text-left">
              <h1 className="font-headline text-4xl font-bold text-on-surface tracking-tight mb-3">Welcome Back</h1>
              <p className="text-on-surface-variant text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                Sign in to continue your journey through Udaipur.
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="block text-sm font-label uppercase tracking-widest text-on-surface-variant ml-1">
                  Email Address
                </label>
                <input
                  className="w-full px-5 py-4 bg-surface-container-high border-none rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-on-surface-variant/40 outline-none"
                  placeholder="curator@unesta.com"
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-sm font-label uppercase tracking-widest text-on-surface-variant">
                    Password
                  </label>
                  <a href="#" className="text-sm font-medium text-primary hover:opacity-80 transition-opacity">
                    Forgot Password?
                  </a>
                </div>
                <input
                  className="w-full px-5 py-4 bg-surface-container-high border-none rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-on-surface-variant/40 outline-none"
                  placeholder="••••••••"
                  type="password"
                />
              </div>

              <button
                className="w-full py-4 px-8 bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-semibold text-lg rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10"
                type="submit"
              >
                Sign In
              </button>
            </form>

            <div className="relative my-10 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-outline-variant/30"></div>
              </div>
              <span className="relative px-4 bg-surface-container-lowest text-sm font-label uppercase tracking-widest text-on-surface-variant/60">
                or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 px-6 py-4 bg-surface-container-low hover:bg-surface-container transition-colors rounded-2xl group">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                  mail
                </span>
                <span className="font-medium text-on-surface">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 px-6 py-4 bg-surface-container-low hover:bg-surface-container transition-colors rounded-2xl group">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                  phone_iphone
                </span>
                <span className="font-medium text-on-surface">Apple</span>
              </button>
            </div>

            <div className="mt-12 text-center">
              <p className="text-on-surface-variant">
                New to UNesta?
                <Link 
                  href="/signup" 
                  className="ml-1 font-bold text-primary hover:underline decoration-primary/30 underline-offset-4 transition-all"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Desktop Background Element (Asymmetric Detail) */}
      <div className="fixed top-1/4 -right-20 w-96 h-96 bg-secondary-container/20 rounded-full blur-[100px] -z-10"></div>
      <div className="fixed bottom-1/4 -left-20 w-64 h-64 bg-primary-container/10 rounded-full blur-[80px] -z-10"></div>
    </div>
  );
}
