"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div
        className="min-h-screen bg-coffee-paper flex flex-col"
        style={{
          fontFamily: '"Source Serif 4", "Source Serif Pro", Georgia, "Times New Roman", serif',
        }}
      >
        {/* Header */}
        <header className="h-16 px-6 md:px-12 flex items-center border-b border-coffee-foam">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Image src="/logo.svg" alt="Attunly logo" width={28} height={28} />
            <span className="text-xl font-semibold text-coffee-espresso">attunly</span>
          </Link>
        </header>

        {/* Success content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-coffee-cream rounded-full flex items-center justify-center mx-auto mb-6 border border-coffee-foam">
              <svg className="w-8 h-8 text-coffee-mocha" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-coffee-espresso">Check your email</h1>
            <p className="mt-4 text-coffee-cortado">
              We sent a password reset link to <span className="font-medium text-coffee-espresso">{email}</span>
            </p>
            <p className="mt-2 text-coffee-latte text-sm">Click the link in your email to reset your password.</p>
            <Link
              href="/login"
              className="mt-8 inline-flex w-full h-11 items-center justify-center rounded-lg bg-coffee-espresso text-coffee-paper font-medium hover:bg-coffee-roast transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-coffee-paper flex flex-col"
      style={{
        fontFamily: '"Source Serif 4", "Source Serif Pro", Georgia, "Times New Roman", serif',
      }}
    >
      {/* Header */}
      <header className="h-16 px-6 md:px-12 flex items-center border-b border-coffee-foam">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Image src="/logo.svg" alt="Attunly logo" width={28} height={28} />
          <span className="text-xl font-semibold text-coffee-espresso">attunly</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm text-coffee-cortado hover:text-coffee-espresso mb-8 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to sign in
          </Link>

          <h1 className="text-3xl font-semibold text-coffee-espresso">
            Reset your password
          </h1>
          <p className="mt-2 text-coffee-cortado">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {error && (
            <div className="mt-6 p-4 rounded-lg bg-coffee-cream border border-coffee-steamed text-coffee-mocha text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-coffee-mocha mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-lg border border-coffee-foam bg-white text-coffee-espresso placeholder:text-coffee-latte focus:outline-none focus:ring-2 focus:ring-coffee-mocha focus:border-transparent disabled:opacity-50 font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-coffee-espresso text-coffee-paper font-medium hover:bg-coffee-roast focus:outline-none focus:ring-2 focus:ring-coffee-mocha focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="mt-8 text-sm text-coffee-latte text-center">
            Remember your password?{" "}
            <Link href="/login" className="font-medium text-coffee-cortado hover:text-coffee-espresso transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
