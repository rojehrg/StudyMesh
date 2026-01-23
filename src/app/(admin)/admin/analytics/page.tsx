"use client";

import { TrendingUp, ArrowRightMd } from "react-coolicons";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-gray-500">View detailed product analytics in PostHog.</p>
      </div>

      {/* PostHog Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-coffee-cream flex items-center justify-center mx-auto">
          <TrendingUp className="w-8 h-8 text-coffee-cortado" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">PostHog Analytics</h2>
        <p className="mt-2 text-gray-500 max-w-md mx-auto">
          Product analytics, session recordings, and feature flags are managed in PostHog.
          Click below to access your dashboard.
        </p>
        <a
          href="https://us.posthog.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-coffee-mocha text-white rounded-lg font-medium hover:bg-coffee-espresso transition-colors"
        >
          Open PostHog Dashboard
          <ArrowRightMd className="w-4 h-4" />
        </a>
      </div>

      {/* Key Metrics Info */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Tracked Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900">User Lifecycle</h4>
            <ul className="mt-2 text-sm text-gray-500 space-y-1">
              <li>user_signed_up</li>
              <li>user_logged_in</li>
              <li>user_logged_out</li>
              <li>onboarding_completed</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900">Core Actions</h4>
            <ul className="mt-2 text-sm text-gray-500 space-y-1">
              <li>pod_created</li>
              <li>nudge_sent</li>
              <li>find_help_searched</li>
              <li>meeting_scheduled</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900">Billing</h4>
            <ul className="mt-2 text-sm text-gray-500 space-y-1">
              <li>subscription_started</li>
              <li>subscription_upgraded</li>
              <li>subscription_cancelled</li>
              <li>upgrade_prompt_clicked</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900">Integrations</h4>
            <ul className="mt-2 text-sm text-gray-500 space-y-1">
              <li>slack_connected</li>
              <li>zoom_connected</li>
              <li>availability_updated</li>
              <li>profile_updated</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
