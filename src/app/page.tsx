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

// Typing animation component
const TypingAnimation = () => {
  const scenarios = [
    {
      phrase: 'need help with the payments API',
      channel: 'engineering',
      people: [
        { initials: 'SM', name: 'Sarah M.', role: 'Senior Backend Engineer', skills: 'Stripe, API design', availability: 'Free now', status: 'green' },
        { initials: 'JK', name: 'James K.', role: 'Platform Engineer', skills: 'Payments, billing', availability: 'Free at 2pm', status: 'yellow' },
      ],
    },
    {
      phrase: 'anyone know Figma prototyping?',
      channel: 'design',
      people: [
        { initials: 'AL', name: 'Amy L.', role: 'Product Designer', skills: 'Figma, prototyping', availability: 'Free now', status: 'green' },
        { initials: 'MR', name: 'Marcus R.', role: 'UX Designer', skills: 'Interaction design', availability: 'Free at 3pm', status: 'yellow' },
      ],
    },
    {
      phrase: 'stuck on a React hooks issue',
      channel: 'frontend',
      people: [
        { initials: 'DW', name: 'Dana W.', role: 'Frontend Lead', skills: 'React, TypeScript', availability: 'Free now', status: 'green' },
        { initials: 'KP', name: 'Kevin P.', role: 'UI Engineer', skills: 'React hooks, state', availability: 'Free in 30min', status: 'yellow' },
      ],
    },
    {
      phrase: 'help with database migrations',
      channel: 'backend',
      people: [
        { initials: 'RN', name: 'Rachel N.', role: 'Database Admin', skills: 'PostgreSQL, migrations', availability: 'Free now', status: 'green' },
        { initials: 'TH', name: 'Tom H.', role: 'Backend Engineer', skills: 'SQL, data modeling', availability: 'Free at 4pm', status: 'yellow' },
      ],
    },
    {
      phrase: 'questions about our auth flow',
      channel: 'security',
      people: [
        { initials: 'LG', name: 'Lisa G.', role: 'Security Engineer', skills: 'OAuth, SSO', availability: 'Free now', status: 'green' },
        { initials: 'CB', name: 'Chris B.', role: 'Identity Lead', skills: 'Auth, permissions', availability: 'Free at 1pm', status: 'yellow' },
      ],
    },
  ];

  const [displayText, setDisplayText] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentScenario = scenarios[scenarioIndex];

  useEffect(() => {
    const currentPhrase = currentScenario.phrase;

    const timeout = setTimeout(
      () => {
        if (isDeleting) {
          setDisplayText(currentPhrase.substring(0, displayText.length - 1));
          if (displayText.length === 1) {
            setIsDeleting(false);
            setShowResponse(false);
            setScenarioIndex((prev) => (prev + 1) % scenarios.length);
          }
        } else {
          setDisplayText(currentPhrase.substring(0, displayText.length + 1));
          if (displayText.length === currentPhrase.length - 1) {
            setShowResponse(true);
            setTimeout(() => setIsDeleting(true), 2500);
          }
        }
      },
      isDeleting ? 25 : displayText.length === 0 ? 300 : 50
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, scenarioIndex, currentScenario.phrase, scenarios.length]);

  return (
    <div className="mt-8 lg:mt-0">
      <div className="bg-white rounded-xl shadow-xl border border-coffee-foam/50 overflow-hidden lg:max-w-md lg:ml-auto font-sans">
        {/* Slack header */}
        <div className="bg-[#3F0F40] px-3 lg:px-4 py-2.5 lg:py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full bg-[#EC6A5F]"></div>
            <div className="w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full bg-[#F4BF50]"></div>
            <div className="w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full bg-[#61C454]"></div>
          </div>
          <span className="text-white/90 text-sm ml-2 lg:ml-3 font-medium"># {currentScenario.channel}</span>
        </div>

        {/* Slack input area */}
        <div className="p-3 lg:p-4 bg-white">
          <div className="border border-gray-300 rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 bg-white">
            <div className="flex items-center text-sm lg:text-[15px]">
              <span className="text-gray-900 font-bold">/attunly</span>
              <span className="ml-2 text-gray-700">{displayText}</span>
              <span className="inline-block w-0.5 h-[1.1em] bg-current text-gray-400 ml-0.5 animate-[blink_1s_step-end_infinite]"></span>
            </div>
          </div>

          {/* Response preview */}
          <div
            className={`mt-3 lg:mt-4 transition-all duration-500 ease-out ${
              showResponse ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <div className="flex items-start gap-2.5 lg:gap-3">
              <div className="w-8 lg:w-9 h-8 lg:h-9 rounded-lg bg-coffee-espresso flex items-center justify-center flex-shrink-0">
                <img src="/logo.svg" alt="Attunly" className="w-4 lg:w-5 h-4 lg:h-5 invert" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-sm lg:text-[15px]">Attunly</span>
                  <span className="text-[10px] lg:text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium">APP</span>
                  <span className="text-xs text-gray-400 hidden sm:inline">12:34 PM</span>
                </div>
                <p className="text-sm lg:text-[15px] text-gray-800 leading-relaxed">
                  Found <strong>{currentScenario.people.length} people</strong> who can help:
                </p>

                {currentScenario.people.map((person, index) => (
                  <div key={person.initials} className={`${index === 0 ? 'mt-2 lg:mt-3' : 'mt-2'} p-2.5 lg:p-3 bg-coffee-cream rounded-lg border border-coffee-foam`}>
                    <div className="flex items-center gap-2.5 lg:gap-3">
                      <div className="relative">
                        <div className="w-9 lg:w-10 h-9 lg:h-10 rounded-lg bg-coffee-steamed flex items-center justify-center text-xs lg:text-sm font-semibold text-coffee-mocha">
                          {person.initials}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full border-2 border-white ${
                          person.status === 'green' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-coffee-espresso text-sm">{person.name}</div>
                        <p className="text-xs text-coffee-cortado">{person.availability} · {person.skills}</p>
                      </div>
                      <button className={`px-2.5 lg:px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        index === 0
                          ? 'bg-coffee-espresso text-coffee-paper hover:bg-coffee-roast'
                          : 'bg-white text-coffee-espresso border border-coffee-foam hover:bg-coffee-cream'
                      }`}>
                        Ask
                      </button>
                    </div>
                  </div>
                ))}
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
  <section className="min-h-screen flex flex-col justify-center px-4 md:px-12 lg:px-24 pt-20 md:pt-24 pb-12 md:pb-16 bg-coffee-paper">
    <div className="max-w-5xl mx-auto w-full">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left: Copy */}
        <div>
          <p className="text-coffee-latte text-xs md:text-sm tracking-wide uppercase mb-4 md:mb-6">A Slack command</p>

          <h1 className="text-3xl md:text-5xl lg:text-[3.25rem] font-semibold text-coffee-espresso leading-[1.1] tracking-tight mb-4 md:mb-6">
            Find the right person.
            <br />
            <span className="text-coffee-oat">Ask them easily.</span>
          </h1>

          <p className="text-base md:text-xl text-coffee-cortado leading-relaxed mb-8 md:mb-10 max-w-[60ch]">
            Type{' '}
            <code className="bg-coffee-cream px-1.5 md:px-2 py-0.5 rounded text-sm md:text-lg font-mono text-coffee-mocha">
              /attunly
            </code>{' '}
            in Slack. Find who knows it, see when they&apos;re free, ask in a language they understand.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
            <Button primary href="/signup">
              <SlackIcon />
              Add to Slack
            </Button>
            <Button href="#how-it-works">See how it works →</Button>
          </div>

          <p className="text-xs md:text-sm text-coffee-latte max-w-[60ch]">
            2-minute setup · Lives entirely in Slack · Free for small teams
          </p>
        </div>

        {/* Right: Mock Slack UI */}
        <TypingAnimation />
      </div>
    </div>
  </section>
);

// The Moment Section
const TheMoment = () => (
  <section className="relative px-4 md:px-12 lg:px-24 py-16 md:py-32 bg-coffee-cream overflow-visible">
    <div className="max-w-5xl mx-auto">
      <div className="max-w-2xl">
        <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">You know this feeling</p>

        <div className="space-y-6 text-xl md:text-2xl text-coffee-mocha leading-relaxed max-w-[60ch]">
          <p>The cursor is blinking in Slack.</p>
          <p>
            You need help with something. But you&apos;re not sure who knows it. You&apos;re not sure if they&apos;re free.
            You&apos;re not sure how to phrase it.
          </p>
          <p className="text-coffee-latte">So the question waits, and the work stays blocked.</p>
        </div>

        <div className="mt-10 pt-8 border-t border-coffee-steamed">
          <p className="text-lg text-coffee-roast font-medium max-w-[60ch]">
            That question? It stays unasked. And the work stays stuck.
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

// Social Proof Section
const SocialProof = () => (
  <Section>
    <div className="text-center relative">
      {/* Arrow pointing to quote */}
      <img
        src="/arrow-brush.svg"
        alt=""
        className="absolute top-0 -left-28 w-24 h-24 rotate-[310deg] opacity-60"
      />
      <blockquote className="text-2xl md:text-3xl text-coffee-mocha leading-relaxed mb-6 max-w-[50ch] mx-auto">
        &ldquo;Attunly cut our &apos;who knows this?&apos; messages by 80%. People actually ask for help now.&rdquo;
      </blockquote>
      <p className="text-coffee-cortado">
        — Engineering Manager, Series B startup
      </p>
    </div>
  </Section>
);

// Before/After Demo Section
const BeforeAfterDemo = () => {
  const [activeTab, setActiveTab] = useState<'without' | 'with'>('without');

  return (
    <section
      id="how-it-works"
      className="px-4 md:px-12 lg:px-24 py-16 md:py-32 bg-coffee-espresso"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold text-coffee-paper leading-tight mb-4">
            From stuck to unstuck.
          </h2>
          <p className="text-lg text-coffee-steamed max-w-[50ch] mx-auto">
            See the difference one command makes.
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

        {/* Mock Slack UI */}
        <div className="bg-[#1a1d21] rounded-xl shadow-2xl overflow-hidden font-sans ring-1 ring-coffee-oat/70 shadow-[0_0_60px_-12px_rgba(199,163,118,0.4)]">
          {/* Slack header */}
          <div className="bg-[#1a1d21] px-4 py-3 flex items-center gap-3 border-b border-white/10">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
            </div>
            <span className="text-white/70 text-sm font-medium ml-2">
              {activeTab === 'without' ? '# general' : '# engineering'}
            </span>
            <span className="text-white/60 text-xs">
              {activeTab === 'without' ? '847 members' : '24 members'}
            </span>
          </div>

          {/* Chat content - fixed height to prevent layout shift when switching tabs */}
          <div className="p-5 min-h-[420px]">
            {activeTab === 'without' ? (
              /* Without Attunly - The anxiety */
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    Y
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-[15px]">You</span>
                      <span className="text-xs text-white/60">2:34 PM</span>
                    </div>
                    <p className="text-[15px] text-white/90 leading-relaxed">
                      hey does anyone know how the auth flow works? I need to add a new OAuth provider but I&apos;m not sure where to start
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white/60 text-sm pl-12">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>3 hours later...</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    M
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-[15px]">Mike</span>
                      <span className="text-xs text-white/60">5:47 PM</span>
                    </div>
                    <p className="text-[15px] text-white/90 leading-relaxed">
                      hmm not sure, maybe try asking in #backend?
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-[15px]">Sara</span>
                      <span className="text-xs text-white/60">5:52 PM</span>
                    </div>
                    <p className="text-[15px] text-white/90 leading-relaxed">
                      I think Jake worked on that? Or maybe it was the other team
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white/50 text-sm text-center">
                    Half a day lost. Still no answer.
                  </p>
                </div>
              </div>
            ) : (
              /* With Attunly - The solution */
              <div className="space-y-4">
                <div className="border border-white/20 rounded-lg px-4 py-3 bg-white/5">
                  <div className="flex items-center text-[15px]">
                    <span className="text-white font-semibold">/attunly</span>
                    <span className="ml-2 text-white/80">need help with auth flow, adding OAuth provider</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-5">
                  <div className="w-9 h-9 rounded-lg bg-coffee-espresso flex items-center justify-center flex-shrink-0">
                    <img src="/logo.svg" alt="Attunly" className="w-5 h-5 invert" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-white text-[15px]">Attunly</span>
                      <span className="text-[11px] text-white/50 bg-white/10 px-1.5 py-0.5 rounded font-medium">APP</span>
                      <span className="text-xs text-white/60">just now</span>
                    </div>
                    <p className="text-[15px] text-white/90 leading-relaxed mb-3">
                      Found <strong>2 people</strong> who can help with authentication:
                    </p>

                    {/* Expert cards */}
                    <div className="space-y-2">
                      <div className="p-3 bg-coffee-cream rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-lg bg-coffee-steamed flex items-center justify-center text-sm font-semibold text-coffee-mocha">
                              LG
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-coffee-cream bg-green-500"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-coffee-espresso text-sm">Lisa G.</div>
                            <p className="text-xs text-coffee-cortado">Free now · OAuth, SSO, Identity</p>
                          </div>
                          <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-coffee-espresso text-coffee-paper">
                            Ask
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-coffee-cream rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-lg bg-coffee-steamed flex items-center justify-center text-sm font-semibold text-coffee-mocha">
                              CB
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-coffee-cream bg-yellow-500"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-coffee-espresso text-sm">Chris B.</div>
                            <p className="text-xs text-coffee-cortado">Free at 3pm · Auth, Permissions</p>
                          </div>
                          <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-white text-coffee-espresso border border-coffee-foam">
                            Ask
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white/70 text-sm text-center">
                        Question answered in 10 minutes.
                      </p>
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
        {/* Left: The Gap */}
        <div>
          <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">The gap</p>

          <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-8 max-w-[60ch]">
            Four questions
            <br />
            <span className="text-coffee-oat">Slack can&apos;t answer.</span>
          </h2>

          <div className="space-y-4">
            {[
              {
                title: '"Who knows this?"',
                desc: "Attunly matches your question to teammates based on what they know.",
              },
              {
                title: '"Are they actually free?"',
                desc: 'Shows actual calendar availability, not just a green dot.',
              },
              {
                title: '"How do I ask?"',
                desc: "Drafts a low-pressure message that's easy to say yes or no to.",
              },
              {
                title: '"Do they speak my language?"',
                desc: "Auto-translates jargon between departments. Sales-speak becomes engineering-speak.",
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
          <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">Sound familiar?</p>

          <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-8 max-w-[60ch]">
            Moments Attunly
            <br />
            <span className="text-coffee-oat">was made for.</span>
          </h2>

          <div className="space-y-4">
            {[
              'When the person who built that service left 6 months ago',
              'When you\'re the new hire who doesn\'t know anyone yet',
              'When it\'s 4pm and you need someone who\'s actually free',
              'When you don\'t want to post in #general and look clueless',
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

// Lingo Translation Section
const LingoTranslation = () => (
  <section className="px-4 md:px-12 lg:px-24 py-16 md:py-32 bg-coffee-cream/50">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <span className="inline-block mb-4 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
          Cross-Department Clarity
        </span>
        <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-4">
          One language.
          <br />
          <span className="text-coffee-oat">Every department.</span>
        </h2>
        <p className="text-lg text-coffee-cortado max-w-2xl mx-auto">
          When Sales asks about "deal velocity," Engineering hears "lead conversion pipeline performance."
          Attunly translates departmental jargon so everyone understands each other.
        </p>
      </div>

      {/* Before/After Translation Demo */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Before - Jargon */}
        <div className="bg-white rounded-xl p-6 border border-coffee-foam">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="font-medium text-coffee-mocha">Without translation</span>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Sales asks:</p>
              <p className="text-sm text-coffee-espresso">"Who can help with our deal velocity issues?"</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Engineering sees:</p>
              <p className="text-sm text-gray-400 italic">"Deal velocity? What does that even mean?"</p>
            </div>
          </div>
        </div>

        {/* After - Translated */}
        <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <span className="font-medium text-coffee-mocha">With Attunly</span>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600 mb-1">Sales asks:</p>
              <p className="text-sm text-coffee-espresso">"Who can help with our deal velocity issues?"</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <p className="text-xs text-green-600 mb-1">Engineering sees:</p>
              <p className="text-sm text-coffee-espresso">"Who can help optimize lead conversion performance in the pipeline?"</p>
              <p className="text-xs text-gray-400 mt-1 italic">Auto-translated from Sales → Engineering</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Trust Section
const Trust = () => (
  <Section darker>
    <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">Designed for real teams</p>

    <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-10">
      Stays out of your way.
    </h2>

    <div className="grid gap-5">
      <div className="p-6 bg-coffee-paper rounded-xl border border-coffee-foam">
        <h3 className="text-lg font-semibold text-coffee-espresso mb-2">2-minute setup</h3>
        <p className="text-coffee-cortado">Describe what you know in plain English. Connect your calendar. Done.</p>
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
        <h3 className="text-lg font-semibold text-coffee-espresso mb-2">You stay in control</h3>
        <p className="text-coffee-cortado">Edit the draft. Pick a different person. Schedule or message. Your call.</p>
      </div>
    </div>
  </Section>
);

// Integrations Section
const Integrations = () => (
  <Section darker>
    <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">Works with your tools</p>

    <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-10">
      No new apps to learn.
    </h2>

    <div className="grid gap-5">
      <div className="card-hover p-6 bg-coffee-paper rounded-xl border border-coffee-foam">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-coffee-espresso">Slack</h3>
        </div>
        <p className="text-coffee-cortado">
          Type <code className="bg-coffee-cream px-1.5 py-0.5 rounded text-sm text-coffee-mocha">/attunly</code> in any channel.
          Get suggestions, send messages, all without leaving Slack.
        </p>
      </div>

      <div className="card-hover p-6 bg-coffee-paper rounded-xl border border-coffee-foam">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-coffee-foam flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-coffee-espresso">Google Calendar</h3>
        </div>
        <p className="text-coffee-cortado">
          See when teammates are actually free. Not just "online" — actually available for a call or a quick chat.
        </p>
      </div>
    </div>
  </Section>
);

// Pricing Section
const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Free',
      description: 'Try Attunly with a small team',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        { text: 'Up to 5 team members', included: true },
        { text: 'Basic expertise matching', included: true },
        { text: 'Slack integration', included: true },
        { text: 'AI-drafted messages', included: true },
        { text: 'Calendar integration', included: false },
        { text: 'Advanced analytics', included: false },
        { text: 'Priority support', included: false },
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Starter',
      description: 'For growing teams',
      monthlyPrice: 8,
      yearlyPrice: 6,
      features: [
        { text: 'Up to 20 team members', included: true },
        { text: 'AI-powered matching', included: true },
        { text: 'Slack integration', included: true },
        { text: 'AI-drafted messages', included: true },
        { text: 'Calendar integration', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Priority support', included: false },
      ],
      cta: 'Start 14-Day Trial',
      popular: false,
    },
    {
      name: 'Pro',
      description: 'For scaling organizations',
      monthlyPrice: 15,
      yearlyPrice: 12,
      features: [
        { text: 'Up to 100 team members', included: true },
        { text: 'AI-powered matching', included: true },
        { text: 'All integrations', included: true },
        { text: 'AI-drafted messages', included: true },
        { text: 'Calendar integration', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Priority support', included: true },
      ],
      cta: 'Start 14-Day Trial',
      popular: true,
    },
  ];

  return (
    <section
      id="pricing"
      className="px-4 md:px-12 lg:px-24 py-16 md:py-32 bg-coffee-paper"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">Pricing</p>

          <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-4">
            Simple, transparent pricing.
            <br />
            <span className="text-coffee-oat">Start free, scale as you grow.</span>
          </h2>

          <p className="text-lg text-coffee-cortado mb-8 max-w-[50ch] mx-auto">
            No hidden fees. 14-day free trial on paid plans. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-coffee-cream rounded-full p-1.5">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !isYearly
                  ? 'bg-coffee-paper text-coffee-espresso shadow-sm'
                  : 'text-coffee-cortado hover:text-coffee-espresso'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                isYearly
                  ? 'bg-coffee-paper text-coffee-espresso shadow-sm'
                  : 'text-coffee-cortado hover:text-coffee-espresso'
              }`}
            >
              Yearly
            </button>
          </div>
          {/* Always render to prevent layout shift */}
          <p className={`text-sm text-coffee-roast font-medium mt-3 transition-opacity ${isYearly ? 'opacity-100' : 'opacity-0'}`}>
            Save 25% with annual billing
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl p-5 md:p-6 ${
                plan.popular
                  ? 'bg-coffee-espresso text-coffee-paper ring-2 ring-coffee-espresso md:-mt-4 md:mb-4 md:py-10'
                  : 'bg-coffee-cream border border-coffee-foam'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coffee-oat text-coffee-espresso text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <div className="mb-4">
                <h3 className={`text-xl font-semibold mb-1 ${plan.popular ? 'text-coffee-paper' : 'text-coffee-espresso'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.popular ? 'text-coffee-steamed' : 'text-coffee-cortado'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-coffee-paper' : 'text-coffee-espresso'}`}>
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className={plan.popular ? 'text-coffee-steamed' : 'text-coffee-latte'}>
                    /user/mo
                  </span>
                </div>
                {plan.monthlyPrice === 0 ? (
                  <p className={`text-sm mt-1 ${plan.popular ? 'text-coffee-steamed' : 'text-coffee-latte'}`}>
                    Free forever
                  </p>
                ) : isYearly ? (
                  <p className={`text-sm mt-1 ${plan.popular ? 'text-coffee-steamed' : 'text-coffee-latte'}`}>
                    Billed annually
                  </p>
                ) : null}
              </div>

              <Link
                href="/signup"
                className={`block w-full text-center px-6 py-3 rounded-lg font-medium transition-all duration-200 mb-6 ${
                  plan.popular
                    ? 'bg-coffee-paper text-coffee-espresso hover:bg-coffee-cream'
                    : 'bg-coffee-espresso text-coffee-paper hover:bg-coffee-roast'
                }`}
              >
                {plan.cta}
              </Link>

              <div className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className={`flex items-center gap-3 text-sm ${
                      feature.included
                        ? plan.popular ? 'text-coffee-paper' : 'text-coffee-cortado'
                        : plan.popular ? 'text-coffee-steamed' : 'text-coffee-latte'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                      feature.included
                        ? plan.popular ? 'bg-coffee-paper/20 text-coffee-paper' : 'bg-coffee-paper text-coffee-espresso'
                        : plan.popular ? 'bg-coffee-steamed/20 text-coffee-steamed' : 'bg-coffee-foam text-coffee-latte'
                    }`}>
                      {feature.included ? '✓' : '–'}
                    </span>
                    <span className={!feature.included ? 'line-through' : ''}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="mt-12 text-center">
          <p className="text-coffee-cortado">
            Need more than 100 users?{' '}
            <Link href="/support" className="text-coffee-espresso font-medium hover:text-coffee-roast transition-colors">
              Contact us for Enterprise pricing →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

// FAQ Section - Accordion with flip arrows
const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does Attunly know who to suggest?',
      a: 'When you set up your profile, you describe what you know in plain English. Our AI matches your questions to those expertise descriptions — not just keyword matching, but understanding context.',
    },
    {
      q: 'What if I want to message someone not in the suggestions?',
      a: 'The suggestions are just that — suggestions. You can search for anyone in your workspace and message them directly.',
    },
    {
      q: 'Does it require everyone on my team to sign up?',
      a: 'Attunly works best when more people have profiles, but you can start with just a few. Anyone in your Slack workspace can receive messages.',
    },
    {
      q: 'Is my calendar data private?',
      a: 'Yes. We only show free/busy status, never meeting details. Your calendar data is encrypted and never shared with other users or third parties.',
    },
    {
      q: 'What if I don\'t want to be disturbed?',
      a: 'You control your availability. Set yourself as unavailable, and Attunly won\'t suggest you to others. You can also set office hours.',
    },
    {
      q: 'What if I don\'t understand someone\'s technical jargon?',
      a: 'Attunly automatically translates departmental terminology. When an engineer\'s expertise is described in technical terms, you\'ll see a plain-English version tailored to your department. No more "lost in translation" moments.',
    },
  ];

  return (
    <section className="px-4 md:px-12 lg:px-24 py-12 md:py-20 bg-coffee-paper">
      <div className="max-w-2xl mx-auto">
        <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">Questions</p>

        <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-8">
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
                  openIndex === index ? 'max-h-40 pb-5' : 'max-h-0'
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
    <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-4">
      That question doesn&apos;t have to wait.
    </h2>

    <p className="text-xl text-coffee-cortado mb-10 max-w-[60ch] mx-auto">
      Add Attunly to Slack. Find who can help. Ask easily.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
      <Button primary href="/signup">
        <SlackIcon />
        Add to Slack
      </Button>
    </div>

    <p className="text-sm text-coffee-latte">Free for teams up to 5 · Setup takes 2 minutes</p>
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
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-12 lg:px-24 py-4 bg-coffee-paper/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-7 h-7" />
            <span className="text-xl font-semibold text-coffee-espresso">attunly</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="#pricing"
              className="text-sm font-medium text-coffee-cortado hover:text-coffee-espresso transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-coffee-cortado hover:text-coffee-espresso transition-colors"
            >
              Log in
            </Link>
            <Button primary href="/signup" className="text-sm py-2.5 px-5">
              <SlackIcon className="w-4 h-4 mr-2" />
              Add to Slack
            </Button>
          </div>

          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="#pricing"
              className="text-xs font-medium text-coffee-cortado hover:text-coffee-espresso transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-xs font-medium text-coffee-cortado hover:text-coffee-espresso transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 px-3 py-2 bg-coffee-espresso text-coffee-paper rounded-lg text-xs font-medium hover:bg-coffee-roast transition-colors"
            >
              <SlackIcon className="w-3.5 h-3.5" />
              Add to Slack
            </Link>
          </div>
        </div>
      </nav>

      <Hero />
      <TheMoment />
      <SocialProof />
      <BeforeAfterDemo />
      <WhatsDifferentAndWhoUsesIt />
      <LingoTranslation />
      <Trust />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
