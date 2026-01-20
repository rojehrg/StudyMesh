'use client';

import { useState } from 'react';
import Link from 'next/link';

const companySizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1,000 employees' },
  { value: '1000+', label: '1,000+ employees' },
];

const roles = [
  { value: 'Founder', label: 'Founder / CEO' },
  { value: 'Product', label: 'Product' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Customer Support', label: 'Customer Support' },
  { value: 'Other', label: 'Other' },
];

export default function BetaPage() {
  const [email, setEmail] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [role, setRole] = useState('');
  const [blocker, setBlocker] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/beta-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, companySize, role, blocker }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setMessage(data.message);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-dvh bg-coffee-paper flex flex-col"
      style={{ fontFamily: '"Source Serif 4", "Source Serif Pro", Georgia, serif' }}
    >
      {/* Simple header */}
      <header className="px-4 md:px-12 lg:px-24 py-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="Attunly" className="w-6 h-6" />
          <span className="text-lg font-semibold text-coffee-espresso">attunly</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {isSuccess ? (
            // Success state
            <div className="text-center">
              <div className="w-16 h-16 bg-coffee-cream rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-coffee-espresso" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-coffee-espresso mb-3 text-balance">
                {message}
              </h1>
              <p className="text-coffee-cortado mb-8 text-pretty">
                We'll reach out when it's your turn to join.
              </p>
              <Link
                href="/"
                className="inline-flex items-center text-coffee-mocha hover:text-coffee-espresso transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to home
              </Link>
            </div>
          ) : (
            // Form state
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-semibold text-coffee-espresso mb-3 text-balance">
                  Join the private beta
                </h1>
                <p className="text-coffee-cortado text-pretty">
                  Be the first to help your team find the right expert, instantly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-coffee-mocha mb-1.5">
                    Work email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-lg border border-coffee-foam bg-white text-coffee-espresso placeholder:text-coffee-latte focus:outline-none focus:ring-2 focus:ring-coffee-mocha focus:border-transparent transition-all"
                  />
                </div>

                {/* Company Size */}
                <div>
                  <label htmlFor="companySize" className="block text-sm font-medium text-coffee-mocha mb-1.5">
                    Company size
                  </label>
                  <select
                    id="companySize"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-coffee-foam bg-white text-coffee-espresso focus:outline-none focus:ring-2 focus:ring-coffee-mocha focus:border-transparent transition-all appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235c4a3a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                  >
                    <option value="" disabled>Select company size</option>
                    {companySizes.map((size) => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-coffee-mocha mb-1.5">
                    Your role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-coffee-foam bg-white text-coffee-espresso focus:outline-none focus:ring-2 focus:ring-coffee-mocha focus:border-transparent transition-all appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235c4a3a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                  >
                    <option value="" disabled>Select your role</option>
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Blocker (optional) */}
                <div>
                  <label htmlFor="blocker" className="block text-sm font-medium text-coffee-mocha mb-1.5">
                    What usually blocks getting help on your team?
                    <span className="text-coffee-latte font-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    id="blocker"
                    value={blocker}
                    onChange={(e) => setBlocker(e.target.value)}
                    rows={3}
                    placeholder="e.g., I don't know who to ask, people are too busy..."
                    className="w-full px-4 py-3 rounded-lg border border-coffee-foam bg-white text-coffee-espresso placeholder:text-coffee-latte focus:outline-none focus:ring-2 focus:ring-coffee-mocha focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div className="text-coffee-roast text-sm bg-coffee-cream border border-coffee-foam px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3.5 rounded-lg bg-coffee-espresso text-coffee-paper font-medium hover:bg-coffee-roast transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    'Request access'
                  )}
                </button>

                {/* Consent text */}
                <p className="text-xs text-coffee-latte text-center">
                  By joining, you agree we can email you about beta access.
                </p>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
