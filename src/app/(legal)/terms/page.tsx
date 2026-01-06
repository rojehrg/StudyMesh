"use client";

import Link from "next/link";

export default function TermsOfServicePage() {
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
        <h1 className="text-4xl font-semibold text-coffee-espresso mb-4">Terms of Service</h1>
        <p className="text-coffee-latte mb-12">Last updated: {lastUpdated}</p>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">1. Acceptance of Terms</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              Welcome to Attunly. These Terms of Service (&quot;Terms&quot;) govern your access to and use of Attunly&apos;s website, products, and services (&quot;Services&quot;). By accessing or using our Services, you agree to be bound by these Terms.
            </p>
            <p className="text-coffee-cortado leading-relaxed">
              If you are using the Services on behalf of an organization, you are agreeing to these Terms for that organization and representing that you have the authority to bind that organization to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">2. Description of Services</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              Attunly is a Slack command that helps you ask for help without overthinking. The service enables:
            </p>
            <ul className="list-disc pl-6 text-coffee-cortado space-y-2 leading-relaxed">
              <li>Drafting low-pressure help request messages</li>
              <li>Sending direct messages to teammates via Slack</li>
              <li>Integrating with your Slack workspace</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">3. Account Registration</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              To use Attunly, you must connect via Slack OAuth. When creating your account, you agree to:
            </p>
            <ul className="list-disc pl-6 text-coffee-cortado space-y-2 leading-relaxed">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="text-coffee-cortado mt-4 leading-relaxed">
              You must be at least 16 years old to use Attunly. By using our Services, you represent that you meet this requirement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">4. Acceptable Use</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">You agree NOT to use Attunly to:</p>
            <ul className="list-disc pl-6 text-coffee-cortado space-y-2 leading-relaxed">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others, including intellectual property rights</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Send spam, unsolicited messages, or promotional content</li>
              <li>Impersonate another person or entity</li>
              <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
              <li>Upload malware, viruses, or other harmful code</li>
              <li>Interfere with or disrupt the integrity or performance of the Services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">5. User Content</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              You retain ownership of content you submit to Attunly (&quot;User Content&quot;), including your profile information and messages. By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, display, and distribute your content solely for the purpose of providing the Services.
            </p>
            <p className="text-coffee-cortado mb-4 leading-relaxed">You represent that:</p>
            <ul className="list-disc pl-6 text-coffee-cortado space-y-2 leading-relaxed">
              <li>You own or have the right to submit the User Content</li>
              <li>Your User Content does not violate the rights of any third party</li>
              <li>Your User Content complies with these Terms and applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">6. Third-Party Integrations</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              Attunly integrates with Slack. When you connect these services:
            </p>
            <ul className="list-disc pl-6 text-coffee-cortado space-y-2 leading-relaxed">
              <li>You authorize us to access and use data from those services as described in our Privacy Policy</li>
              <li>Your use of third-party services is subject to their respective terms and privacy policies</li>
              <li>We are not responsible for the availability, accuracy, or content of third-party services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">7. Intellectual Property</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              Attunly and its original content, features, and functionality are owned by Attunly and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-coffee-cortado leading-relaxed">
              Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">8. Privacy</h2>
            <p className="text-coffee-cortado leading-relaxed">
              Your privacy is important to us. Please review our <Link href="/privacy" className="text-coffee-espresso hover:text-coffee-roast underline">Privacy Policy</Link>, which describes how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">9. Termination</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              You may stop using Attunly at any time by disconnecting from your Slack workspace. We reserve the right to suspend or terminate your access to the Services at any time, with or without cause or notice, including for:
            </p>
            <ul className="list-disc pl-6 text-coffee-cortado space-y-2 leading-relaxed">
              <li>Violations of these Terms</li>
              <li>Conduct that we believe is harmful to other users or our business</li>
              <li>Extended periods of inactivity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">10. Disclaimers</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed uppercase text-sm tracking-wide">
              THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">11. Limitation of Liability</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ATTUNLY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
            </p>
            <p className="text-coffee-cortado leading-relaxed">
              Our total liability for any claims arising from these Terms or the Services shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">12. Modifications to Terms</h2>
            <p className="text-coffee-cortado leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our website and updating the &quot;Last updated&quot; date. Your continued use of the Services after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">13. Governing Law</h2>
            <p className="text-coffee-cortado leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-coffee-espresso mb-4">14. Contact Us</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <p className="text-coffee-cortado leading-relaxed">
              <strong className="text-coffee-espresso">Email:</strong> support@attunly.com
            </p>
          </section>

          <section className="p-6 bg-coffee-cream rounded-lg border border-coffee-foam">
            <h2 className="text-xl font-semibold text-coffee-espresso mb-4">Summary</h2>
            <p className="text-coffee-cortado leading-relaxed">
              By using Attunly, you agree to use it responsibly, respect other users, and understand that we provide the service &quot;as is.&quot; We work hard to make Attunly useful and secure, but we can&apos;t guarantee perfection. If you have questions or concerns, please reach out — we&apos;re here to help.
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
            <Link href="/privacy" className="hover:text-coffee-paper transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-coffee-paper">
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
