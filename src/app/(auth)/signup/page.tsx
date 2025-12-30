"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const [step, setStep] = useState<"initial" | "email" | "success">("initial");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError("Failed to connect to Google. Please try again.");
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.session) {
        router.push('/onboarding');
        return;
      }

      setStep("success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (step === "success") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
          <p className="text-slate-500 mb-1">
            We sent a confirmation link to
          </p>
          <p className="font-medium text-slate-900 mb-4">{email}</p>
          <p className="text-sm text-slate-400 mb-6">
            Click the link in your email to activate your account.
          </p>
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">Back to Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Email form step
  if (step === "email") {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden">
          {/* Left side - Form */}
          <div className="p-8 lg:p-12">
            <div className="max-w-sm mx-auto">
              <button
                onClick={() => setStep("initial")}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
                <p className="text-slate-500 mt-2">Enter your email to get started</p>
              </div>

              {error && (
                <div className="mb-4 text-sm p-3 rounded-lg bg-red-50 text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="h-11 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create account
                </Button>
              </form>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="hidden lg:flex bg-gradient-to-br from-accent/5 via-accent/10 to-primary/10 items-center justify-center p-12">
            <div className="relative w-full max-w-md">
              <Image
                src="/images/supportive-business-team.png"
                alt="Supportive team"
                width={500}
                height={500}
                className="w-full h-auto"
                priority
              />
              <div className="mt-6 text-center">
                <h3 className="text-lg font-semibold text-slate-800">Join a supportive team</h3>
                <p className="text-slate-600 mt-1">Help and get help from your colleagues</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial step - Google-first
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden">
        {/* Left side - Form */}
        <div className="p-8 lg:p-12">
          <div className="max-w-sm mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Get started</h1>
              <p className="text-slate-500 mt-2">Create your account in seconds</p>
            </div>

            {error && (
              <div className="mb-4 text-sm p-3 rounded-lg bg-red-50 text-red-600 border border-red-100">
                {error}
              </div>
            )}

            {/* Google Button - Primary */}
            <Button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#fff"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#fff"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#fff"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#fff"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-white text-slate-400">
                  or
                </span>
              </div>
            </div>

            {/* Email option */}
            <Button
              variant="outline"
              onClick={() => setStep("email")}
              disabled={loading}
              className="w-full h-11 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
            >
              Continue with Email
            </Button>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Right side - Illustration */}
        <div className="hidden lg:flex bg-gradient-to-br from-accent/5 via-accent/10 to-primary/10 items-center justify-center p-12">
          <div className="relative w-full max-w-md">
            <Image
              src="/images/supportive-business-team.png"
              alt="Supportive team"
              width={500}
              height={500}
              className="w-full h-auto"
              priority
            />
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold text-slate-800">Join a supportive team</h3>
              <p className="text-slate-600 mt-1">Help and get help from your colleagues</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
