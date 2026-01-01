"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CircleNotch, CheckCircle, ArrowLeft } from "@phosphor-icons/react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import startupMeeting from "../../../../public/animations/startup-meeting.json";

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="flex min-h-screen">
        {/* Left side - Success message */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Logo */}
          <div className="h-16 px-8 flex items-center">
            <Link href="/" className="flex items-center gap-0.5 hover:opacity-90 transition-opacity">
              <img src="/icon.svg" alt="Attunly" className="w-7 h-7" /><span className="font-bold text-xl"><span className="text-gray-900">Attun</span>
              <span className="text-violet-600">ly</span></span>
            </Link>
          </div>

          {/* Success content */}
          <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-24">
            <div className="w-full max-w-md text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" weight="duotone" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Check your email</h1>
              <p className="mt-4 text-lg text-gray-600">
                We sent a password reset link to <span className="font-medium text-gray-900">{email}</span>
              </p>
              <p className="mt-2 text-gray-500">Click the link in your email to reset your password.</p>
              <Link
                href="/login"
                className="mt-8 inline-flex w-full h-11 items-center justify-center rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
              >
                Back to Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Right side - Animation with lavender background */}
        <div className="hidden md:flex flex-1 bg-violet-100 items-center justify-center">
          <Lottie
            animationData={startupMeeting}
            loop={true}
            style={{ width: 400, height: 350 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Logo */}
        <div className="h-16 px-8 flex items-center">
          <Link href="/" className="flex items-center gap-0.5 hover:opacity-90 transition-opacity">
            <img src="/icon.svg" alt="Attunly" className="w-7 h-7" /><span className="font-bold text-xl"><span className="text-gray-900">Attun</span>
            <span className="text-violet-600">ly</span></span>
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-24">
          <div className="w-full max-w-md">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8"
            >
              <ArrowLeft className="w-4 h-4" weight="duotone" />
              Back to login
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Reset your password
              <span className="inline-block">🔑</span>
            </h1>
            <p className="mt-3 text-gray-500 text-lg">Enter your email and we&apos;ll send you a reset link.</p>

            {error && (
              <div className="mt-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {loading && <CircleNotch className="h-4 w-4 animate-spin" weight="duotone" />}
                Send reset link
              </button>
            </form>

            <p className="mt-8 text-sm text-gray-500">
              Remember your password?{" "}
              <Link href="/login" className="font-medium text-violet-600 hover:text-violet-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Animation with lavender background */}
      <div className="hidden md:flex flex-1 bg-violet-100 items-center justify-center">
        <Lottie
          animationData={startupMeeting}
          loop={true}
          style={{ width: 400, height: 350 }}
        />
      </div>
    </div>
  );
}
