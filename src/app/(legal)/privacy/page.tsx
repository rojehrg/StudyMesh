"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 6, 2025";

  return (
    <div
      className="min-h-screen bg-coffee-paper"
      style={{
        fontFamily: '"Source Serif 4", "Source Serif Pro", Georgia, "Times New Roman", serif',
      }}
    >
      {/* Header */}
      <header className="border-b border-coffee-foam bg-[#fffcf9]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-6 h-6" />
            <span className="font-semibold text-xl text-coffee-espresso">attunly</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-coffee-cortado hover:text-coffee-espresso transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-semibold text-coffee-espresso mb-4">Privacy Policy</h1>
        <p className="text-coffee-latte mb-12">Last updated: {lastUpdated}</p>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">1. Introduction</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              Attunly (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Slack command for asking for help.
            </p>
            <p className="text-coffee-cortado leading-relaxed">
              Please read this privacy policy carefully. By using Attunly, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-medium text-coffee-espresso mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-coffee-cortado mb-6 space-y-2 leading-relaxed">
              <li><strong className="text-coffee-espresso">Account Information:</strong> Name, email address, profile picture (from Slack)</li>
              <li><strong className="text-coffee-espresso">Organization Information:</strong> Slack workspace name and ID</li>
              <li><strong className="text-coffee-espresso">Message Content:</strong> The help requests you draft using /attunly</li>
            </ul>

            <h3 className="text-xl font-medium text-coffee-espresso mb-3">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 text-coffee-cortado mb-6 space-y-2 leading-relaxed">
              <li><strong className="text-coffee-espresso">Usage Data:</strong> Command usage frequency, features used</li>
              <li><strong className="text-coffee-espresso">Log Data:</strong> IP address, access times, error logs</li>
            </ul>

            <h3 className="text-xl font-medium text-coffee-espresso mb-3">2.3 Information from Slack</h3>
            <ul className="list-disc pl-6 text-coffee-cortado space-y-2 leading-relaxed">
              <li><strong className="text-coffee-espresso">Slack OAuth:</strong> We receive your Slack user ID, email, name, and profile picture</li>
              <li><strong className="text-coffee-espresso">Workspace Info:</strong> Team ID and workspace name for organization matching</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">3. How We Use Your Information</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-coffee-cortado space-y-2 leading-relaxed">
              <li>Provide, maintain, and improve Attunly</li>
              <li>Create and manage your account</li>
              <li>Draft and send help request messages via Slack DM</li>
              <li>Send service-related communications</li>
              <li>Respond to your requests and support inquiries</li>
              <li>Analyze usage patterns to improve our service</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">4. Information Sharing</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">We share your information in the following circumstances:</p>

            <h3 className="text-xl font-medium text-coffee-espresso mb-3">4.1 With Your Recipients</h3>
            <p className="text-coffee-cortado mb-6 leading-relaxed">
              When you send a help request, the message is delivered to your chosen recipient via Slack DM. Only you and the recipient can see the message.
            </p>

            <h3 className="text-xl font-medium text-coffee-espresso mb-3">4.2 Service Providers</h3>
            <p className="text-coffee-cortado mb-4 leading-relaxed">We use third-party services that process data on our behalf:</p>
            <ul className="list-disc pl-6 text-coffee-cortado mb-6 space-y-2 leading-relaxed">
              <li><strong className="text-coffee-espresso">Supabase:</strong> Database and authentication services</li>
              <li><strong className="text-coffee-espresso">Vercel:</strong> Hosting and deployment</li>
              <li><strong className="text-coffee-espresso">Groq:</strong> AI message drafting (Llama 3.1)</li>
              <li><strong className="text-coffee-espresso">Slack:</strong> Message delivery</li>
            </ul>

            <h3 className="text-xl font-medium text-coffee-espresso mb-3">4.3 Legal Requirements</h3>
            <p className="text-coffee-cortado leading-relaxed">
              We may disclose your information if required by law, court order, or government request, or to protect our rights, safety, or property.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">5. Data Security</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information, including:
            </p>
            <ul className="list-disc pl-6 text-coffee-cortado space-y-2 leading-relaxed">
              <li>Encryption of data in transit (HTTPS/TLS)</li>
              <li>Encryption of data at rest</li>
              <li>Encryption of OAuth tokens (AES-256-GCM)</li>
              <li>Secure authentication via Slack OAuth</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">6. Data Retention</h2>
            <p className="text-coffee-cortado leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide you services. Message content is not stored after delivery. You can request deletion of your account and associated data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">7. Your Rights</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 text-coffee-cortado space-y-2 leading-relaxed">
              <li><strong className="text-coffee-espresso">Access:</strong> Request a copy of your personal data</li>
              <li><strong className="text-coffee-espresso">Correction:</strong> Update or correct inaccurate information</li>
              <li><strong className="text-coffee-espresso">Deletion:</strong> Request deletion of your personal data</li>
              <li><strong className="text-coffee-espresso">Portability:</strong> Receive your data in a portable format</li>
              <li><strong className="text-coffee-espresso">Restrict Processing:</strong> Limit how we use your data</li>
            </ul>
            <p className="text-coffee-cortado mt-4 leading-relaxed">
              To exercise these rights, please contact us using the information below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">8. Cookies and Tracking</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              We use essential cookies to maintain your session and remember your preferences. These are necessary for the service to function properly. We do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">9. International Data Transfers</h2>
            <p className="text-coffee-cortado leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-coffee-cortado leading-relaxed">
              Attunly is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If we become aware that we have collected data from a child under 16, we will take steps to delete that information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">11. Changes to This Policy</h2>
            <p className="text-coffee-cortado leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of Attunly after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">12. Contact Us</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <p className="text-coffee-cortado leading-relaxed">
              <strong className="text-coffee-espresso">Email:</strong> support@attunly.com
            </p>
          </section>

          <section className="p-6 bg-coffee-cream rounded-lg border border-coffee-foam">
            <h2 className="text-xl font-semibold text-coffee-espresso mb-4">For California Residents (CCPA)</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              Under the California Consumer Privacy Act (CCPA), California residents have additional rights including:
            </p>
            <ul className="list-disc pl-6 text-coffee-cortado space-y-2 leading-relaxed">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt-out of the sale of personal information</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>
            <p className="text-coffee-cortado mt-4 leading-relaxed">
              <strong className="text-coffee-espresso">We do not sell your personal information.</strong>
            </p>
          </section>

          <section className="p-6 bg-coffee-cream rounded-lg border border-coffee-foam">
            <h2 className="text-xl font-semibold text-coffee-espresso mb-4">For EU/EEA Residents (GDPR)</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              Under the General Data Protection Regulation (GDPR), you have rights including access, rectification, erasure, and data portability. Our legal basis for processing your data includes:
            </p>
            <ul className="list-disc pl-6 text-coffee-cortado space-y-2 leading-relaxed">
              <li><strong className="text-coffee-espresso">Contract:</strong> Processing necessary to provide our services to you</li>
              <li><strong className="text-coffee-espresso">Legitimate Interests:</strong> Improving our service and preventing fraud</li>
              <li><strong className="text-coffee-espresso">Consent:</strong> Where you have given explicit consent</li>
            </ul>
            <p className="text-coffee-cortado mt-4 leading-relaxed">
              You may lodge a complaint with your local supervisory authority if you believe your rights have been violated.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 bg-coffee-espresso text-coffee-latte">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-6 h-6 invert" />
            <span className="text-xl font-semibold text-coffee-paper">attunly</span>
          </a>
          <div className="flex gap-8 text-sm">
            <Link href="/privacy" className="text-coffee-paper">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-coffee-paper transition-colors">
              Terms
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
