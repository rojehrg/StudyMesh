"use client";

import Link from "next/link";

export default function SecurityPage() {
  const lastUpdated = "January 2025";

  return (
    <div
      className="min-h-screen bg-coffee-paper"
      style={{
        fontFamily: '"Source Serif 4", "Source Serif Pro", Georgia, "Times New Roman", serif',
      }}
    >
      {/* Header */}
      <header className="border-b border-coffee-foam bg-[#fffcf9]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-6 h-6" />
            <span className="font-semibold text-xl text-coffee-espresso">attunly</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-coffee-cortado hover:text-coffee-espresso transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-semibold text-coffee-espresso mb-4">Security</h1>
        <p className="text-lg text-coffee-cortado mb-12 max-w-[60ch]">
          Attunly is built with enterprise security in mind. Here is how we protect your data.
        </p>

        <div className="space-y-8">
          {/* Data Security */}
          <section className="p-6 bg-coffee-cream rounded-xl border border-coffee-foam">
            <h2 className="text-xl font-semibold text-coffee-espresso mb-4">Data Security</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1 bg-coffee-espresso rounded-full flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-coffee-espresso mb-1">Encryption in Transit</h3>
                  <p className="text-coffee-cortado text-sm leading-relaxed">
                    All data transmitted between your browser and our servers is encrypted using TLS 1.3. API communications with Slack and other integrations are also encrypted.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1 bg-coffee-espresso rounded-full flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-coffee-espresso mb-1">Encryption at Rest</h3>
                  <p className="text-coffee-cortado text-sm leading-relaxed">
                    Data stored in our PostgreSQL database (hosted on Supabase) is encrypted at rest using AES-256.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1 bg-coffee-espresso rounded-full flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-coffee-espresso mb-1">Secure Token Storage</h3>
                  <p className="text-coffee-cortado text-sm leading-relaxed">
                    OAuth tokens for Slack and other integrations are encrypted using AES-256-GCM before storage. Tokens are never logged or exposed in plain text.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section className="p-6 bg-coffee-cream rounded-xl border border-coffee-foam">
            <h2 className="text-xl font-semibold text-coffee-espresso mb-4">Authentication</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1 bg-coffee-espresso rounded-full flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-coffee-espresso mb-1">Supabase Auth</h3>
                  <p className="text-coffee-cortado text-sm leading-relaxed">
                    User authentication is handled by Supabase Auth, which provides secure session management with HTTP-only cookies and CSRF protection.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1 bg-coffee-espresso rounded-full flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-coffee-espresso mb-1">OAuth Integrations</h3>
                  <p className="text-coffee-cortado text-sm leading-relaxed">
                    We support secure OAuth 2.0 flows for Slack, Google, and Zoom. We request only the minimum permissions required for each integration.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Access Control */}
          <section className="p-6 bg-coffee-cream rounded-xl border border-coffee-foam">
            <h2 className="text-xl font-semibold text-coffee-espresso mb-4">Access Control</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1 bg-coffee-espresso rounded-full flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-coffee-espresso mb-1">Role-Based Permissions</h3>
                  <p className="text-coffee-cortado text-sm leading-relaxed">
                    Attunly implements role-based access control (RBAC) with three permission levels: Owner, Admin, and Member. Permissions are enforced server-side on every request.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1 bg-coffee-espresso rounded-full flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-coffee-espresso mb-1">Audit Logging</h3>
                  <p className="text-coffee-cortado text-sm leading-relaxed">
                    Administrative actions are logged with timestamps, user IDs, and action details. Audit logs are retained and available for compliance review.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section className="p-6 bg-coffee-cream rounded-xl border border-coffee-foam">
            <h2 className="text-xl font-semibold text-coffee-espresso mb-4">Privacy</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1 bg-coffee-espresso rounded-full flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-coffee-espresso mb-1">GDPR Compliance</h3>
                  <p className="text-coffee-cortado text-sm leading-relaxed">
                    Users can export their data or request complete deletion at any time. Data deletion requests are processed within 30 days.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1 bg-coffee-espresso rounded-full flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-coffee-espresso mb-1">Data Minimization</h3>
                  <p className="text-coffee-cortado text-sm leading-relaxed">
                    We collect only the data necessary to provide our services. Message content is not stored after delivery.
                  </p>
                </div>
              </div>
              <p className="text-coffee-cortado text-sm mt-4">
                Read our full{" "}
                <Link href="/privacy" className="text-coffee-espresso underline hover:text-coffee-roast">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </section>

          {/* Infrastructure */}
          <section className="p-6 bg-coffee-cream rounded-xl border border-coffee-foam">
            <h2 className="text-xl font-semibold text-coffee-espresso mb-4">Infrastructure</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-coffee-paper rounded-lg border border-coffee-foam">
                <h3 className="font-medium text-coffee-espresso mb-2">Vercel</h3>
                <p className="text-coffee-cortado text-sm leading-relaxed">
                  Application hosting with automatic DDoS protection, edge caching, and SOC2 Type II compliance.
                </p>
              </div>
              <div className="p-4 bg-coffee-paper rounded-lg border border-coffee-foam">
                <h3 className="font-medium text-coffee-espresso mb-2">Supabase</h3>
                <p className="text-coffee-cortado text-sm leading-relaxed">
                  Database and authentication infrastructure. SOC2 Type II compliant with regular security audits.
                </p>
              </div>
            </div>
          </section>

          {/* Compliance Roadmap */}
          <section className="p-6 bg-coffee-paper rounded-xl border border-coffee-foam">
            <h2 className="text-xl font-semibold text-coffee-espresso mb-4">Compliance Roadmap</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-24 text-sm font-medium text-coffee-espresso">Current</div>
                <div className="flex-1">
                  <p className="text-coffee-cortado text-sm leading-relaxed">
                    SOC2-compliant infrastructure partners (Vercel, Supabase). GDPR-compliant data handling. Encrypted data in transit and at rest.
                  </p>
                </div>
              </div>
              <div className="border-t border-coffee-foam" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-24 text-sm font-medium text-coffee-espresso">Q2 2026</div>
                <div className="flex-1">
                  <p className="text-coffee-cortado text-sm leading-relaxed">
                    Begin SOC2 Type II audit process.
                  </p>
                </div>
              </div>
              <div className="border-t border-coffee-foam" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-24 text-sm font-medium text-coffee-espresso">Q4 2026</div>
                <div className="flex-1">
                  <p className="text-coffee-cortado text-sm leading-relaxed">
                    SOC2 Type II certification (planned).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Questions */}
          <section className="p-6 bg-coffee-espresso rounded-xl text-coffee-paper">
            <h2 className="text-xl font-semibold mb-2">Questions?</h2>
            <p className="text-coffee-steamed mb-4 text-sm leading-relaxed">
              For security inquiries, vendor questionnaires, or to request additional documentation, contact our team.
            </p>
            <a
              href="mailto:support@attunly.com"
              className="inline-block px-5 py-2.5 bg-coffee-paper text-coffee-espresso rounded-lg font-medium text-sm hover:bg-coffee-cream transition-colors"
            >
              support@attunly.com
            </a>
          </section>
        </div>

        <p className="text-coffee-latte text-sm mt-12">Last updated: {lastUpdated}</p>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 bg-coffee-espresso text-coffee-latte">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-6 h-6 invert" />
            <span className="text-xl font-semibold text-coffee-paper">attunly</span>
          </a>
          <div className="flex gap-8 text-sm">
            <Link href="/privacy" className="hover:text-coffee-paper transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-coffee-paper transition-colors">
              Terms
            </Link>
            <Link href="/security" className="text-coffee-paper">
              Security
            </Link>
            <Link href="/support" className="hover:text-coffee-paper transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
