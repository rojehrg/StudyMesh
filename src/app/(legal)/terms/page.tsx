"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

export default function TermsOfServicePage() {
  const lastUpdated = "December 31, 2024";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5">
            <span className="font-bold text-xl text-violet-600">Mesh</span>
            <span className="font-bold text-xl text-gray-900">flow</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              Welcome to Meshflow. These Terms of Service (&quot;Terms&quot;) govern your access to and use of Meshflow&apos;s website, products, and services (&quot;Services&quot;). By accessing or using our Services, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-600">
              If you are using the Services on behalf of an organization, you are agreeing to these Terms for that organization and representing that you have the authority to bind that organization to these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Services</h2>
            <p className="text-gray-600 mb-4">
              Meshflow is a team collaboration platform that enables:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Creating and joining team pods (workspaces)</li>
              <li>Sharing availability schedules with team members</li>
              <li>Matching teammates based on skills and expertise</li>
              <li>Sending &quot;nudges&quot; to request or offer help</li>
              <li>Scheduling meetings with teammates</li>
              <li>Integrating with third-party services like Slack</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Registration</h2>
            <p className="text-gray-600 mb-4">
              To use Meshflow, you must create an account. When creating your account, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="text-gray-600 mt-4">
              You must be at least 16 years old to use Meshflow. By using our Services, you represent that you meet this requirement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-600 mb-4">You agree NOT to use Meshflow to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others, including intellectual property rights</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Send spam, unsolicited messages, or promotional content</li>
              <li>Impersonate another person or entity</li>
              <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
              <li>Upload malware, viruses, or other harmful code</li>
              <li>Interfere with or disrupt the integrity or performance of the Services</li>
              <li>Scrape, crawl, or collect data from our Services without permission</li>
              <li>Use the Services for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Content</h2>
            <p className="text-gray-600 mb-4">
              You retain ownership of content you submit to Meshflow (&quot;User Content&quot;), including your profile information, skills, availability, and messages. By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, display, and distribute your content solely for the purpose of providing the Services.
            </p>
            <p className="text-gray-600 mb-4">You represent that:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>You own or have the right to submit the User Content</li>
              <li>Your User Content does not violate the rights of any third party</li>
              <li>Your User Content complies with these Terms and applicable laws</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Organizations and Teams</h2>
            <p className="text-gray-600 mb-4">
              When you create or join an organization on Meshflow:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Organization administrators may have access to usage data and member information</li>
              <li>Your profile, skills, and availability will be visible to other organization members</li>
              <li>Organization owners may remove members or delete the organization</li>
              <li>Invite codes should be shared only with intended team members</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Third-Party Integrations</h2>
            <p className="text-gray-600 mb-4">
              Meshflow integrates with third-party services such as Slack. When you connect these services:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>You authorize us to access and use data from those services as described in our Privacy Policy</li>
              <li>Your use of third-party services is subject to their respective terms and privacy policies</li>
              <li>We are not responsible for the availability, accuracy, or content of third-party services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              Meshflow and its original content, features, and functionality are owned by Meshflow and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-gray-600">
              Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Privacy</h2>
            <p className="text-gray-600">
              Your privacy is important to us. Please review our <Link href="/privacy" className="text-violet-600 hover:text-violet-700 underline">Privacy Policy</Link>, which describes how we collect, use, and protect your personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-600 mb-4">
              You may stop using Meshflow at any time by deleting your account. We reserve the right to suspend or terminate your access to the Services at any time, with or without cause or notice, including for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Violations of these Terms</li>
              <li>Conduct that we believe is harmful to other users or our business</li>
              <li>Extended periods of inactivity</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Upon termination, your right to use the Services will immediately cease. Provisions that by their nature should survive termination will survive.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Disclaimers</h2>
            <p className="text-gray-600 mb-4 uppercase font-medium">
              THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Implied warranties of merchantability and fitness for a particular purpose</li>
              <li>Warranties that the Services will be uninterrupted, error-free, or secure</li>
              <li>Warranties regarding the accuracy or reliability of any information obtained through the Services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MESHFLOW SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Loss of profits, data, or goodwill</li>
              <li>Service interruption or computer damage</li>
              <li>Cost of substitute services</li>
              <li>Any damages arising from your use of or inability to use the Services</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Our total liability for any claims arising from these Terms or the Services shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Indemnification</h2>
            <p className="text-gray-600">
              You agree to indemnify, defend, and hold harmless Meshflow and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Services, your User Content, or your violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Modifications to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our website and updating the &quot;Last updated&quot; date. Your continued use of the Services after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Governing Law</h2>
            <p className="text-gray-600">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes arising from these Terms or the Services shall be resolved in the courts located in the United States.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. General Provisions</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Meshflow regarding the Services.</li>
              <li><strong>Severability:</strong> If any provision of these Terms is found unenforceable, the remaining provisions will continue in effect.</li>
              <li><strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms will not be considered a waiver.</li>
              <li><strong>Assignment:</strong> You may not assign your rights under these Terms without our consent. We may assign our rights without restriction.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <ul className="list-none text-gray-600 space-y-2">
              <li><strong>Email:</strong> legal@meshflow.app</li>
              <li><strong>Website:</strong> meshflow.app</li>
            </ul>
          </section>

          <section className="p-6 bg-violet-50 rounded-lg border border-violet-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
            <p className="text-gray-600">
              By using Meshflow, you agree to use it responsibly, respect other users, and understand that we provide the service &quot;as is.&quot; We work hard to make Meshflow useful and secure, but we can&apos;t guarantee perfection. If you have questions or concerns, please reach out — we&apos;re here to help.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors font-medium text-violet-600">Terms</Link>
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          </div>
          <div className="text-sm text-gray-400">
            © 2025 Meshflow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
