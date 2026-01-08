"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import remoteWork from "../../../../public/animations/remote-work.json";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Check for existing session and redirect if logged in (non-blocking)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      // If no user, just stay on login page - don't sign out (that would destroy pending sessions)
      if (error || !user) {
        return;
      }

      supabase
        .from('profiles')
        .select('id, organization_id')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          if (!profile) {
            router.replace("/onboarding");
          } else if (!profile.organization_id) {
            router.replace("/org-setup");
          } else {
            router.replace("/dashboard");
          }
        });
    });
  }, [supabase, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, organization_id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!profile) {
          router.push("/onboarding");
        } else if (!profile.organization_id) {
          router.push("/org-setup");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
    } catch {
      setError("Failed to connect to Google. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        fontFamily: '"Source Serif 4", "Source Serif Pro", Georgia, "Times New Roman", serif',
      }}
    >
      {/* Left side - Login form */}
      <div className="flex-1 flex flex-col bg-coffee-paper">
        {/* Header */}
        <header className="h-16 px-6 md:px-12 flex items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src="/logo.svg" alt="" className="w-7 h-7" />
            <span className="text-xl font-semibold text-coffee-espresso">attunly</span>
          </Link>
        </header>

        {/* Form container */}
        <main className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-16">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-semibold text-coffee-espresso">
              Welcome back
            </h1>
            <p className="mt-2 text-coffee-cortado">
              Sign in to continue to your dashboard.
            </p>

            {error && (
              <div className="mt-6 p-4 rounded-lg bg-coffee-cream border border-coffee-steamed text-coffee-mocha text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-coffee-mocha mb-1.5">
                  Email
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-coffee-mocha">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm text-coffee-cortado hover:text-coffee-espresso transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your password"
                  className="w-full h-11 px-4 rounded-lg border border-coffee-foam bg-white text-coffee-espresso placeholder:text-coffee-latte focus:outline-none focus:ring-2 focus:ring-coffee-mocha focus:border-transparent disabled:opacity-50 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-coffee-espresso text-coffee-paper font-medium hover:bg-coffee-roast focus:outline-none focus:ring-2 focus:ring-coffee-mocha focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-coffee-foam" />
              <span className="text-sm text-coffee-latte">or</span>
              <div className="flex-1 h-px bg-coffee-foam" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-6 w-full h-11 rounded-lg border border-coffee-foam bg-white text-coffee-mocha font-medium hover:bg-coffee-cream focus:outline-none focus:ring-2 focus:ring-coffee-foam disabled:opacity-50 flex items-center justify-center gap-3 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <p className="mt-8 text-sm text-coffee-latte text-center">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-coffee-cortado hover:text-coffee-espresso transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </main>
      </div>

      {/* Right side - Animation with cream background */}
      <div className="hidden lg:flex flex-1 bg-coffee-cream items-center justify-center">
        <Lottie
          animationData={remoteWork}
          loop={true}
          style={{ width: 450, height: 400 }}
        />
      </div>
    </div>
  );
}
