'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Lottie from 'lottie-react';
import freelancerChatting from '../../public/lottie/freelancer-chatting.json';

const Section = ({
  children,
  className = '',
  darker = false,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  darker?: boolean;
  id?: string;
}) => (
  <section
    id={id}
    className={`
      px-4 md:px-12 lg:px-24 py-16 md:py-32
      ${darker ? 'bg-coffee-cream' : 'bg-coffee-paper'}
      ${className}
    `}
  >
    <div className="max-w-2xl mx-auto">{children}</div>
  </section>
);

const Button = ({
  children,
  primary = false,
  href = '#',
  className = '',
}: {
  children: React.ReactNode;
  primary?: boolean;
  href?: string;
  className?: string;
}) => (
  <Link
    href={href}
    className={`
      inline-flex items-center justify-center
      px-6 py-3.5 rounded-lg
      text-base font-medium
      transition-all duration-200 ease-out
      ${
        primary
          ? 'bg-coffee-espresso text-coffee-paper hover:bg-coffee-roast'
          : 'text-coffee-cortado hover:text-coffee-espresso'
      }
      ${className}
    `}
  >
    {children}
  </Link>
);

const SlackIcon = ({ className = 'w-5 h-5 mr-2' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
  </svg>
);

// Request flow animation component
const RequestFlowAnimation = () => {
  const scenarios = [
    {
      owner: 'Sarah',
      ownerInitials: 'SM',
      outcome: 'Send updated API spec',
      deadline: 'today at 5pm',
    },
    {
      owner: 'Marcus',
      ownerInitials: 'MR',
      outcome: 'Review the PR',
      deadline: 'tomorrow morning',
    },
    {
      owner: 'Dana',
      ownerInitials: 'DW',
      outcome: 'Share design feedback',
      deadline: 'end of day',
    },
  ];

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [step, setStep] = useState(0); // 0: request, 1: started, 2: done

  const currentScenario = scenarios[scenarioIndex];

  useEffect(() => {
    const timings = [2500, 1500, 2000]; // Time to show each step

    const timeout = setTimeout(() => {
      if (step < 2) {
        setStep(step + 1);
      } else {
        setStep(0);
        setScenarioIndex((prev) => (prev + 1) % scenarios.length);
      }
    }, timings[step]);

    return () => clearTimeout(timeout);
  }, [step, scenarioIndex, scenarios.length]);

  return (
    <div className="mt-8 lg:mt-0">
      <div className="bg-white rounded-xl shadow-md border border-coffee-foam/50 overflow-hidden lg:max-w-md lg:ml-auto font-sans">
        {/* Slack header */}
        <div className="bg-[#3F0F40] px-3 lg:px-4 py-2.5 lg:py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full bg-[#EC6A5F]"></div>
            <div className="w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full bg-[#F4BF50]"></div>
            <div className="w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full bg-[#61C454]"></div>
          </div>
          <span className="text-white/90 text-sm ml-2 lg:ml-3 font-medium">Attunly</span>
        </div>

        {/* Content */}
        <div className="p-3 lg:p-4 bg-white">
          <div className="flex items-start gap-2.5 lg:gap-3">
            <div className="w-8 lg:w-9 h-8 lg:h-9 rounded-lg bg-coffee-espresso flex items-center justify-center flex-shrink-0">
              <img src="/logo.svg" alt="Attunly" className="w-4 lg:w-5 h-4 lg:h-5 invert" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-coffee-espresso text-sm lg:text-[15px]">Attunly</span>
                <span className="text-[10px] lg:text-[11px] text-coffee-latte bg-coffee-foam px-1.5 py-0.5 rounded font-medium">APP</span>
              </div>

              {/* Request card */}
              <div className="p-3 bg-coffee-cream rounded-lg border border-coffee-foam mb-3">
                <p className="text-sm text-coffee-espresso mb-2">
                  <strong>You</strong> requested a response from <strong>{currentScenario.owner}</strong>:
                </p>
                <p className="text-sm text-coffee-mocha">
                  &ldquo;{currentScenario.outcome}&rdquo;
                </p>
                <p className="text-xs text-coffee-cortado mt-2">By: {currentScenario.deadline}</p>
              </div>

              {/* Status updates */}
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-sm transition-all duration-200 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="w-2 h-2 rounded-full bg-coffee-oat"></div>
                  <span className="text-coffee-cortado">{currentScenario.owner} saw your request and started</span>
                </div>

                <div className={`flex items-center gap-2 text-sm transition-all duration-200 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="w-2 h-2 rounded-full bg-coffee-espresso"></div>
                  <span className="text-coffee-cortado">{currentScenario.owner} marked your request as done</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hero Section
const Hero = () => (
  <section className="min-h-dvh flex flex-col justify-center px-4 md:px-12 lg:px-24 pt-20 md:pt-24 pb-12 md:pb-16 bg-coffee-paper">
    <div className="max-w-5xl mx-auto w-full">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left: Copy */}
        <div>
          <p className="text-coffee-latte text-xs md:text-sm uppercase mb-4 md:mb-6">A Slack layer</p>

          <h1 className="text-3xl md:text-5xl lg:text-[3.25rem] font-semibold text-coffee-espresso leading-[1.1] tracking-tight mb-4 md:mb-6 text-balance">
            Wait on people.
            <br />
            <span className="text-coffee-oat">Without the silence.</span>
          </h1>

          <p className="text-base md:text-xl text-coffee-cortado leading-relaxed mb-8 md:mb-10 max-w-[60ch] text-pretty">
            When teams work across time zones, simple requests turn into day-long waits. Messages get buried, context is lost, and nobody knows what&apos;s happening. Attunly makes it easier to wait on people who aren&apos;t online right now.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
            <Button primary href="/beta" className="text-base md:text-lg px-8 py-4">
              <SlackIcon className="w-5 h-5 mr-2" />
              Add to Slack
            </Button>
            <Button href="#how-it-works">See how it works →</Button>
          </div>

          <p className="text-xs md:text-sm text-coffee-latte max-w-[60ch]">
            No setup required
          </p>
        </div>

        {/* Right: Mock Slack UI */}
        <RequestFlowAnimation />
      </div>
    </div>
  </section>
);

// The Moment Section
const TheMoment = () => (
  <section className="relative px-4 md:px-12 lg:px-24 py-16 md:py-32 bg-coffee-cream overflow-visible">
    <div className="max-w-5xl mx-auto">
      <div className="max-w-2xl">
        <p className="text-coffee-latte text-sm uppercase mb-4">You know this feeling</p>

        <div className="space-y-6 text-xl md:text-2xl text-coffee-mocha leading-relaxed max-w-[60ch]">
          <p>You sent a message. You need a response.</p>
          <p>
            They&apos;re in a different timezone. Or maybe just busy. Or maybe they saw it and forgot. You don&apos;t know.
          </p>
          <p className="text-coffee-latte">So you wait. And wonder. And check Slack again. The silence says nothing.</p>
        </div>

        <div className="mt-10 pt-8 border-t border-coffee-steamed">
          <p className="text-lg text-coffee-roast font-medium max-w-[60ch]">
            Attunly replaces silence with clarity. You know when they saw it. You know if they&apos;re blocked. You know what&apos;s happening.
          </p>
        </div>
      </div>
    </div>

    {/* Lottie Animation - positioned to section */}
    <div className="hidden lg:block absolute bottom-0 right-0 w-[550px] -translate-x-36 translate-y-[42px]">
      <Lottie
        animationData={freelancerChatting}
        loop={true}
        className="w-full h-auto"
      />
    </div>
  </section>
);

// Before/After Demo Section
const BeforeAfterDemo = () => {
  const [activeTab, setActiveTab] = useState<'without' | 'with'>('without');

  return (
    <section
      id="how-it-works"
      className="px-4 md:px-12 lg:px-24 py-16 md:py-32 bg-coffee-espresso"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold text-coffee-paper leading-tight mb-4 text-balance">
            The difference is clarity.
          </h2>
          <p className="text-lg text-coffee-steamed max-w-[50ch] mx-auto text-pretty">
            Hours of silence. Or knowing exactly what&apos;s happening.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-coffee-roast/50 rounded-full p-1">
            <button
              onClick={() => setActiveTab('without')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'without'
                  ? 'bg-coffee-paper text-coffee-espresso shadow-sm'
                  : 'text-coffee-steamed hover:text-coffee-paper'
              }`}
            >
              Without Attunly
            </button>
            <button
              onClick={() => setActiveTab('with')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'with'
                  ? 'bg-coffee-paper text-coffee-espresso shadow-sm'
                  : 'text-coffee-steamed hover:text-coffee-paper'
              }`}
            >
              With Attunly
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,280px] gap-6">
        {/* Mock Slack UI */}
        <div>
        <div className="bg-[#1a1d21] rounded-xl shadow-lg overflow-hidden font-sans ring-1 ring-coffee-oat/70">
          {/* Slack header */}
          <div className="bg-[#1a1d21] px-4 py-3 flex items-center gap-3 border-b border-white/10">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
            </div>
            <span className="text-white/70 text-sm font-medium ml-2">
              {activeTab === 'without' ? 'DM with @sarah' : 'Attunly'}
            </span>
          </div>

          {/* Chat content - fixed height to prevent layout shift when switching tabs */}
          <div className="p-5 min-h-[420px]">
            {activeTab === 'without' ? (
              /* Without Attunly - The silence */
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-coffee-mocha flex items-center justify-center text-coffee-paper text-sm font-semibold flex-shrink-0">
                    Y
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-[15px]">You</span>
                      <span className="text-xs text-white/60">9:15 AM</span>
                    </div>
                    <p className="text-[15px] text-white/90 leading-relaxed">
                      Hey Sarah, I need the updated API spec before I can finish my PR. Can you send it when you get a chance?
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white/60 text-sm pl-12">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>4 hours later...</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-coffee-mocha flex items-center justify-center text-coffee-paper text-sm font-semibold flex-shrink-0">
                    Y
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-[15px]">You</span>
                      <span className="text-xs text-white/60">1:22 PM</span>
                    </div>
                    <p className="text-[15px] text-white/90 leading-relaxed">
                      Hey, just following up on this. No rush, just want to make sure you saw it
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white/60 text-sm pl-12">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Next day...</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-coffee-oat flex items-center justify-center text-coffee-paper text-sm font-semibold flex-shrink-0">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-[15px]">Sarah</span>
                      <span className="text-xs text-white/60">10:05 AM</span>
                    </div>
                    <p className="text-[15px] text-white/90 leading-relaxed">
                      Oh sorry! I was waiting on something from the product team. Should have it today
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white/50 text-sm text-center">
                    A full day of waiting. No visibility. No way to plan.
                  </p>
                </div>
              </div>
            ) : (
              /* With Attunly - The clarity */
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-coffee-espresso flex items-center justify-center flex-shrink-0">
                    <img src="/logo.svg" alt="Attunly" className="w-5 h-5 invert" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-white text-[15px]">Attunly</span>
                      <span className="text-[11px] text-white/50 bg-white/10 px-1.5 py-0.5 rounded font-medium">APP</span>
                      <span className="text-xs text-white/60">9:15 AM</span>
                    </div>

                    {/* Request sent */}
                    <div className="p-3 bg-coffee-cream rounded-lg mb-3">
                      <p className="text-sm text-coffee-espresso mb-2">
                        <strong>You</strong> requested a response from <strong>Sarah</strong>:
                      </p>
                      <p className="text-sm text-coffee-mocha">
                        &ldquo;Send updated API spec&rdquo;
                      </p>
                      <p className="text-xs text-coffee-cortado mt-2">By: today at 5pm</p>
                    </div>

                    {/* Status updates */}
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center gap-2 text-white/80 text-sm">
                        <div className="w-2 h-2 rounded-full bg-coffee-oat"></div>
                        <span>9:47 AM &mdash; Sarah saw your request and started looking into it</span>
                      </div>

                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-white/80 text-sm">
                          <strong className="text-white">10:15 AM</strong> &mdash; I&apos;m blocked because: &ldquo;Waiting on final field names from product. Should have them by noon.&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-white/80 text-sm">
                        <div className="w-2 h-2 rounded-full bg-coffee-oat"></div>
                        <span>2:30 PM &mdash; Sarah marked your request as done</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white/70 text-sm text-center">
                        You knew what was happening the whole time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Insight Cards - only visible on smaller screens */}
        <div className="lg:hidden mt-4 flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
          {activeTab === 'without' ? (
            <>
              <div className="flex-shrink-0 snap-start bg-coffee-paper rounded-xl p-3 shadow-sm min-w-[140px]">
                <p className="text-coffee-espresso font-semibold">24+ hours</p>
                <p className="text-coffee-cortado text-xs">of silence</p>
              </div>
              <div className="flex-shrink-0 snap-start bg-coffee-paper rounded-xl p-3 shadow-sm min-w-[140px]">
                <p className="text-coffee-espresso font-semibold">No visibility</p>
                <p className="text-coffee-cortado text-xs">did they see it?</p>
              </div>
              <div className="flex-shrink-0 snap-start bg-coffee-paper rounded-xl p-3 shadow-sm min-w-[140px]">
                <p className="text-coffee-espresso font-semibold">Can&apos;t plan</p>
                <p className="text-coffee-cortado text-xs">your work is stuck</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex-shrink-0 snap-start bg-coffee-paper rounded-xl p-3 shadow-sm min-w-[140px]">
                <p className="text-coffee-espresso font-semibold">Seen</p>
                <p className="text-coffee-cortado text-xs">you know they got it</p>
              </div>
              <div className="flex-shrink-0 snap-start bg-coffee-paper rounded-xl p-3 shadow-sm min-w-[140px]">
                <p className="text-coffee-espresso font-semibold">Honest updates</p>
                <p className="text-coffee-cortado text-xs">blocked? you&apos;ll know</p>
              </div>
              <div className="flex-shrink-0 snap-start bg-coffee-paper rounded-xl p-3 shadow-sm min-w-[140px]">
                <p className="text-coffee-espresso font-semibold">Done</p>
                <p className="text-coffee-cortado text-xs">clear when complete</p>
              </div>
            </>
          )}
        </div>
        </div>

        {/* Insight Side Panel */}
        <div className="hidden lg:flex flex-col justify-center">
          {activeTab === 'without' ? (
            <div className="space-y-5">
              <div className="bg-coffee-paper rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-coffee-foam flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-coffee-espresso" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-coffee-espresso font-semibold text-lg">24+ hours</p>
                    <p className="text-coffee-cortado text-sm">of waiting in silence</p>
                  </div>
                </div>
              </div>
              <div className="bg-coffee-paper rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-coffee-foam flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-coffee-espresso" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-coffee-espresso font-semibold text-lg">No visibility</p>
                    <p className="text-coffee-cortado text-sm">did they see it?</p>
                  </div>
                </div>
              </div>
              <div className="bg-coffee-paper rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-coffee-foam flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-coffee-espresso" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-coffee-espresso font-semibold text-lg">Can&apos;t plan</p>
                    <p className="text-coffee-cortado text-sm">your work is stuck</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-coffee-paper rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-coffee-foam flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-coffee-espresso" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-coffee-espresso font-semibold text-lg">Seen</p>
                    <p className="text-coffee-cortado text-sm">you know they got it</p>
                  </div>
                </div>
              </div>
              <div className="bg-coffee-paper rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-coffee-foam flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-coffee-espresso" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-coffee-espresso font-semibold text-lg">Honest updates</p>
                    <p className="text-coffee-cortado text-sm">blocked? you&apos;ll know why</p>
                  </div>
                </div>
              </div>
              <div className="bg-coffee-paper rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-coffee-foam flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-coffee-espresso" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-coffee-espresso font-semibold text-lg">Done</p>
                    <p className="text-coffee-cortado text-sm">clear when it&apos;s complete</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </section>
  );
};

// What's Different + Who Uses It Combined Section
const WhatsDifferentAndWhoUsesIt = () => (
  <section className="px-4 md:px-12 lg:px-24 py-16 md:py-32 bg-coffee-paper">
    <div className="max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16">
        {/* Left: What Attunly Does */}
        <div>
          <p className="text-coffee-latte text-sm uppercase mb-4">What it does</p>

          <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-8 max-w-[60ch] text-balance">
            Three things.
            <br />
            <span className="text-coffee-oat">Nothing more.</span>
          </h2>

          <div className="space-y-4">
            {[
              {
                title: 'Request a response',
                desc: "Ask one person for one thing. Clearly. With a deadline that's just context, not pressure.",
              },
              {
                title: 'See when they saw it',
                desc: 'You know the moment they acknowledge your request. No more wondering.',
              },
              {
                title: 'Get honest updates',
                desc: 'If they\'re blocked, you\'ll know why. If they\'re done, you\'ll know when. Silence becomes clarity.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 bg-coffee-cream rounded-xl border border-coffee-foam"
              >
                <p className="font-semibold text-coffee-espresso mb-1">{item.title}</p>
                <p className="text-coffee-cortado text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sound Familiar */}
        <div>
          <p className="text-coffee-latte text-sm uppercase mb-4">Sound familiar?</p>

          <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-8 max-w-[60ch] text-balance">
            Moments Attunly
            <br />
            <span className="text-coffee-oat">was made for.</span>
          </h2>

          <div className="space-y-4">
            {[
              'You sent a message yesterday. Still no response. Did they see it? Are they working on it? You have no idea.',
              'Your teammate is 8 hours ahead. By the time they respond, you\'ve lost a full day.',
              'You don\'t want to nag. But you also can\'t afford to just wait and hope.',
              'A simple request shouldn\'t require a follow-up thread, a standup mention, and a Slack reminder.',
            ].map((moment) => (
              <div
                key={moment}
                className="p-4 bg-coffee-cream rounded-xl border border-coffee-foam"
              >
                <p className="text-coffee-mocha text-sm">{moment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Testimonials Section
const Testimonials = () => {
  const testimonials = [
    {
      quote: "We went from 'did you see my message?' to knowing exactly when people saw it and what's blocking them.",
      name: 'Priya Sharma',
      role: 'Engineering Manager',
      company: 'a remote-first startup',
      initials: 'PS',
    },
    {
      quote: "The 'blocked' button is genius. Now we actually know why things are stuck instead of guessing.",
      name: 'Marcus Chen',
      role: 'Product Lead',
      company: 'a distributed company',
      initials: 'MC',
    },
    {
      quote: 'Our team is across 5 timezones. Attunly is the only thing that makes async handoffs bearable.',
      name: 'Elena Voss',
      role: 'Founder',
      company: 'a small async team',
      initials: 'EV',
    },
    {
      quote: "I used to send follow-ups just to feel like I wasn't forgotten. Now I just check the status and move on.",
      name: 'David Park',
      role: 'Senior Developer',
      company: 'a fully remote agency',
      initials: 'DP',
    },
  ];

  return (
    <section className="px-4 md:px-12 lg:px-24 py-16 md:py-32 bg-coffee-cream">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-coffee-latte text-sm uppercase mb-4">What teams are saying</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight text-balance">
            Clarity changes everything.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="p-6 bg-coffee-paper rounded-xl border border-coffee-foam"
            >
              <p className="text-lg text-coffee-mocha leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-coffee-espresso flex items-center justify-center text-coffee-paper text-sm font-semibold flex-shrink-0">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-semibold text-coffee-espresso">{testimonial.name}</p>
                  <p className="text-sm text-coffee-cortado">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Trust Section
const Trust = () => (
  <Section darker>
    <p className="text-coffee-latte text-sm uppercase mb-4">No new tools to learn</p>

    <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-4 text-balance">
      It&apos;s just a Slack command.
    </h2>
    <p className="text-lg text-coffee-cortado mb-10 max-w-[50ch] text-pretty">
      Request a response. Get clarity. That&apos;s it.
    </p>

    <div className="grid gap-5">
      <div className="p-6 bg-coffee-paper rounded-xl border border-coffee-foam">
        <h3 className="text-lg font-semibold text-coffee-espresso mb-2">No setup required</h3>
        <p className="text-coffee-cortado">Install the Slack app. Start using it. No profiles to fill out, no onboarding.</p>
      </div>

      <div className="p-6 bg-coffee-paper rounded-xl border border-coffee-foam">
        <h3 className="text-lg font-semibold text-coffee-espresso mb-2">Lives in Slack</h3>
        <p className="text-coffee-cortado">
          No new app. No new tab. Just{' '}
          <code className="bg-coffee-cream px-1.5 py-0.5 rounded text-sm text-coffee-mocha">/attunly</code> where you
          already work.
        </p>
      </div>

      <div className="p-6 bg-coffee-paper rounded-xl border border-coffee-foam">
        <h3 className="text-lg font-semibold text-coffee-espresso mb-2">Lightweight for the owner</h3>
        <p className="text-coffee-cortado">Three buttons: Start, Blocked, Done. Takes 2 seconds to respond. No pressure, no guilt.</p>
      </div>

      <div className="p-6 bg-coffee-paper rounded-xl border border-coffee-foam">
        <h3 className="text-lg font-semibold text-coffee-espresso mb-2">Honest by design</h3>
        <p className="text-coffee-cortado">&ldquo;Blocked&rdquo; is a first-class response. Better to know why someone can&apos;t help than to wonder in silence.</p>
      </div>
    </div>
  </Section>
);

// FAQ Section - Accordion with flip arrows
const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How is this different from just DMing someone?',
      a: 'When you DM someone, you have no idea if they saw it, if they\'re working on it, or if they\'re stuck. Attunly gives you visibility: you know when they saw your request, and if they\'re blocked, you\'ll know why.',
    },
    {
      q: 'What does the person receiving the request see?',
      a: 'They get a clear DM with what you need and when you need it by. They can click Start, Blocked, or Done. If they\'re blocked, they explain why. It takes seconds.',
    },
    {
      q: 'Does this add more Slack noise?',
      a: 'Less, actually. Instead of follow-up messages, reminder pings, and "hey just checking in" threads, you get one clean request and real-time updates. The conversation stays quiet.',
    },
    {
      q: 'What if they can\'t do it by my deadline?',
      a: 'The deadline is just context, not pressure. If they click Blocked, you\'ll know immediately and can adjust. That honesty is the whole point.',
    },
    {
      q: 'Do I need to set anything up?',
      a: 'Just install the Slack app. No profiles, no onboarding, no expertise mapping. You can start using it right away.',
    },
    {
      q: 'Does this work for distributed teams?',
      a: 'That\'s exactly who it\'s for. When your teammate is 8 hours ahead, you can\'t afford to wait a full day wondering if they saw your message. Attunly gives you clarity across timezones.',
    },
  ];

  return (
    <section className="px-4 md:px-12 lg:px-24 py-12 md:py-20 bg-coffee-paper">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-8 text-balance">
          Common questions.
        </h2>

        <div className="divide-y divide-coffee-foam">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="cursor-pointer"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex justify-between items-center py-5 gap-4">
                <h3 className="text-lg font-medium text-coffee-espresso">{faq.q}</h3>
                <svg
                  className={`w-5 h-5 text-coffee-cortado flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-96 pb-5' : 'max-h-0'
                }`}
              >
                <p className="text-coffee-cortado">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Final CTA Section
const FinalCTA = () => (
  <Section className="text-center" id="install" darker>
    <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-4 text-balance">
      Replace silence with clarity.
    </h2>

    <p className="text-xl text-coffee-cortado mb-10 max-w-[60ch] mx-auto text-pretty">
      Request a response. See when they saw it. Know what&apos;s happening.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
      <Button primary href="/beta" className="text-base md:text-lg px-8 py-4">
        <SlackIcon className="w-5 h-5 mr-2" />
        Add to Slack
      </Button>
    </div>

    <p className="text-sm text-coffee-latte">Free for teams up to 10 · No credit card required</p>
  </Section>
);

// Footer
const Footer = () => (
  <footer className="px-4 md:px-12 lg:px-24 py-10 md:py-12 bg-coffee-espresso text-coffee-oat">
    <div className="max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
      <div className="text-xl font-semibold text-coffee-paper">attunly</div>
      <div className="flex gap-8 text-sm">
        <Link href="/privacy" className="hover:text-coffee-paper transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-coffee-paper transition-colors">
          Terms
        </Link>
        <Link href="/security" className="hover:text-coffee-paper transition-colors">
          Security
        </Link>
        <Link href="/support" className="hover:text-coffee-paper transition-colors">
          Contact
        </Link>
      </div>
    </div>
  </footer>
);

// Main Page
export default function AttunlyLanding() {
  return (
    <main
      className="antialiased"
      style={{
        fontFamily: '"Source Serif 4", "Source Serif Pro", Georgia, "Times New Roman", serif',
      }}
    >
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-12 lg:px-24 py-4 bg-coffee-paper/95 backdrop-blur-sm border-b border-coffee-foam">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-7 h-7" />
            <span className="text-xl font-semibold text-coffee-espresso">attunly</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/beta"
              className="text-base font-medium text-coffee-cortado hover:text-coffee-espresso transition-colors"
            >
              Join Beta
            </Link>
            <Link
              href="/login"
              className="text-base font-medium text-coffee-cortado hover:text-coffee-espresso transition-colors"
            >
              Log in
            </Link>
          </div>

          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/beta"
              className="text-sm font-medium text-coffee-cortado hover:text-coffee-espresso transition-colors"
            >
              Join Beta
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-coffee-cortado hover:text-coffee-espresso transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </nav>

      <Hero />
      <TheMoment />
      <BeforeAfterDemo />
      <WhatsDifferentAndWhoUsesIt />
      <Testimonials />
      <Trust />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
