"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

export default function PrivacyPolicyPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Meshflow (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our team collaboration and skill-matching platform.
            </p>
            <p className="text-gray-600">
              Please read this privacy policy carefully. By using Meshflow, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, password, profile picture</li>
              <li><strong>Profile Information:</strong> Department, job title, bio, timezone, skills and expertise</li>
              <li><strong>Organization Information:</strong> Company/team name, invite codes</li>
              <li><strong>Availability Data:</strong> Your weekly availability schedule</li>
              <li><strong>Communication Data:</strong> Messages, nudges, and meeting invitations sent through the platform</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>Usage Data:</strong> Features used, pages visited, actions taken</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
              <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">2.3 Information from Third Parties</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Google OAuth:</strong> If you sign in with Google, we receive your name, email, and profile picture</li>
              <li><strong>Slack Integration:</strong> If connected, we receive your Slack user ID and workspace information to send notifications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide, maintain, and improve Meshflow</li>
              <li>Create and manage your account</li>
              <li>Match you with teammates based on skills and availability</li>
              <li>Send nudge notifications and meeting invitations</li>
              <li>Display your availability to team members in your organization</li>
              <li>Send service-related communications (account verification, security alerts)</li>
              <li>Respond to your requests and support inquiries</li>
              <li>Analyze usage patterns to improve our service</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-600 mb-4">We share your information in the following circumstances:</p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Within Your Organization</h3>
            <p className="text-gray-600 mb-4">
              Your profile information, skills, and availability are visible to other members of your organization on Meshflow. This is essential for the team collaboration features to work.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Service Providers</h3>
            <p className="text-gray-600 mb-4">We use third-party services that process data on our behalf:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>Supabase:</strong> Database and authentication services</li>
              <li><strong>Vercel:</strong> Hosting and deployment</li>
              <li><strong>Slack:</strong> Notification delivery (if you connect your Slack account)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">4.3 Legal Requirements</h3>
            <p className="text-gray-600">
              We may disclose your information if required by law, court order, or government request, or to protect our rights, safety, or property.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Encryption of data in transit (HTTPS/TLS)</li>
              <li>Encryption of data at rest</li>
              <li>Secure authentication via Supabase Auth</li>
              <li>Regular security audits and updates</li>
              <li>Access controls limiting who can view your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-600">
              We retain your personal information for as long as your account is active or as needed to provide you services. You can request deletion of your account and associated data at any time by contacting us. We may retain certain information as required by law or for legitimate business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-600 mb-4">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
            </ul>
            <p className="text-gray-600 mt-4">
              To exercise these rights, please contact us using the information below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-600 mb-4">
              We use essential cookies to maintain your session and remember your preferences. These are necessary for the service to function properly. We do not use advertising or tracking cookies.
            </p>
            <p className="text-gray-600">
              You can configure your browser to refuse cookies, but this may affect your ability to use Meshflow.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-600">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-gray-600">
              Meshflow is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If we become aware that we have collected data from a child under 16, we will take steps to delete that information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of Meshflow after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul className="list-none text-gray-600 space-y-2">
              <li><strong>Email:</strong> privacy@meshflow.app</li>
              <li><strong>Website:</strong> meshflow.app</li>
            </ul>
          </section>

          <section className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">For California Residents (CCPA)</h2>
            <p className="text-gray-600 mb-4">
              Under the California Consumer Privacy Act (CCPA), California residents have additional rights including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt-out of the sale of personal information</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>
            <p className="text-gray-600 mt-4">
              <strong>We do not sell your personal information.</strong>
            </p>
          </section>

          <section className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">For EU/EEA Residents (GDPR)</h2>
            <p className="text-gray-600 mb-4">
              Under the General Data Protection Regulation (GDPR), you have rights including access, rectification, erasure, and data portability. Our legal basis for processing your data includes:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Contract:</strong> Processing necessary to provide our services to you</li>
              <li><strong>Legitimate Interests:</strong> Improving our service and preventing fraud</li>
              <li><strong>Consent:</strong> Where you have given explicit consent</li>
            </ul>
            <p className="text-gray-600 mt-4">
              You may lodge a complaint with your local supervisory authority if you believe your rights have been violated.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors font-medium text-violet-600">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
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
