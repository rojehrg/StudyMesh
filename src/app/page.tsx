'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Fade-in on scroll hook
const useFadeIn = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

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
}) => {
  const { ref, isVisible } = useFadeIn();
  return (
    <section
      ref={ref}
      id={id}
      className={`
        px-6 md:px-12 lg:px-24 py-24 md:py-32
        ${darker ? 'bg-coffee-cream' : 'bg-coffee-paper'}
        ${className}
        transition-all duration-[600ms] ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
      `}
    >
      <div className="max-w-2xl mx-auto">{children}</div>
    </section>
  );
};

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
    <div className="hidden lg:block">
      <div className="bg-white rounded-xl shadow-xl border border-coffee-foam/50 overflow-hidden max-w-md ml-auto font-sans">
        {/* Slack header */}
        <div className="bg-[#3F0F40] px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#EC6A5F]"></div>
            <div className="w-3 h-3 rounded-full bg-[#F4BF50]"></div>
            <div className="w-3 h-3 rounded-full bg-[#61C454]"></div>
          </div>
          <span className="text-white/90 text-sm ml-3 font-medium"># {currentScenario.channel}</span>
        </div>

        {/* Slack input area */}
        <div className="p-4 bg-white">
          <div className="border border-gray-300 rounded-lg px-4 py-3 bg-white">
            <div className="flex items-center text-[15px]">
              <span className="text-gray-900 font-bold">/attunly</span>
              <span className="ml-2 text-gray-700">{displayText}</span>
              <span className="inline-block w-0.5 h-[1.1em] bg-current text-gray-400 ml-0.5 animate-[blink_1s_step-end_infinite]"></span>
            </div>
          </div>

          {/* Response preview */}
          <div
            className={`mt-4 transition-all duration-500 ease-out ${
              showResponse ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-coffee-espresso flex items-center justify-center flex-shrink-0">
                <img src="/logo.svg" alt="Attunly" className="w-5 h-5 invert" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-[15px]">Attunly</span>
                  <span className="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium">APP</span>
                  <span className="text-xs text-gray-400">12:34 PM</span>
                </div>
                <p className="text-[15px] text-gray-800 leading-relaxed">
                  Found <strong>{currentScenario.people.length} people</strong> who can help:
                </p>

                {currentScenario.people.map((person, index) => (
                  <div key={person.initials} className={`${index === 0 ? 'mt-3' : 'mt-2'} p-3 bg-coffee-cream rounded-lg border border-coffee-foam`}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-lg bg-coffee-steamed flex items-center justify-center text-sm font-semibold text-coffee-mocha">
                          {person.initials}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          person.status === 'green' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-coffee-espresso text-sm">{person.name}</div>
                        <p className="text-xs text-coffee-cortado">{person.availability} · {person.skills}</p>
                      </div>
                      <button className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
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
  <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-24 pb-16 bg-coffee-paper">
    <div className="max-w-5xl mx-auto w-full">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Copy */}
        <div>
          <p className="text-coffee-latte text-sm tracking-wide uppercase mb-6">A Slack command</p>

          <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-semibold text-coffee-espresso leading-[1.1] tracking-tight mb-6">
            Ask for help in Slack
            <br />
            <span className="text-coffee-oat">without overthinking.</span>
          </h1>

          <p className="text-xl text-coffee-cortado leading-relaxed mb-10 max-w-[60ch]">
            Type{' '}
            <code className="bg-coffee-cream px-2 py-0.5 rounded text-lg font-mono text-coffee-mocha">
              /attunly
            </code>
            . Get matched with who can help, see their availability, and send a calm message. Move the work
            forward.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button primary href="/signup">
              <SlackIcon />
              Add to Slack
            </Button>
            <Button href="#how-it-works">See how it works →</Button>
          </div>

          <p className="text-sm text-coffee-latte max-w-[60ch]">
            No setup. No status updates. Works where you already work.
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
  <Section darker>
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
        The question never gets asked. That&apos;s the cost.
      </p>
    </div>
  </Section>
);

// The Solution Section
const TheSolution = () => (
  <Section>
    <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">What Attunly does</p>

    <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-8 max-w-[60ch]">
      It finds who can help,
      <br />
      <span className="text-coffee-oat">and helps you ask.</span>
    </h2>

    <div className="space-y-5 text-lg text-coffee-cortado leading-relaxed max-w-[60ch]">
      <p>
        Type{' '}
        <code className="bg-coffee-cream px-2 py-0.5 rounded font-mono text-coffee-mocha">
          /attunly need help with the payments API
        </code>{' '}
        — Attunly matches you with teammates who have relevant expertise, shows you when they&apos;re actually
        free, and drafts a calm message.
      </p>
      <p>Pick a person, edit the message if you want, send it. Or book time directly.</p>
    </div>
  </Section>
);

// How It Works Section
const HowItWorks = () => {
  const { ref, isVisible } = useFadeIn();

  return (
    <section
      ref={ref}
      id="how-it-works"
      className={`px-6 md:px-12 lg:px-24 py-24 md:py-32 bg-coffee-cream transition-all duration-[600ms] ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="max-w-2xl mx-auto">
        <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">Three steps</p>

        <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-12">
          How it works
        </h2>

        <div className="space-y-8">
          {[
            {
              step: '1',
              title: 'Type /attunly in Slack',
              desc: 'Describe what you need. "Need help with the payments API" or "anyone know React hooks?"',
            },
            {
              step: '2',
              title: 'See who matches + availability',
              desc: "Attunly shows teammates with relevant expertise and when they're actually free—not just \"online.\"",
            },
            {
              step: '3',
              title: 'Send a message or book time',
              desc: 'Use the drafted message or schedule a call. The question gets asked. You move on.',
            },
          ].map((item, index) => (
            <div
              key={item.step}
              className={`flex gap-5 items-start transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-full bg-coffee-espresso text-coffee-paper flex items-center justify-center text-lg font-semibold">
                {item.step}
              </div>
              <div className="pt-1">
                <h3 className="text-xl font-medium text-coffee-espresso mb-2">{item.title}</h3>
                <p className="text-coffee-cortado">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// What's Different Section
const WhatsDifferent = () => (
  <Section>
    <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">Why this exists</p>

    <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-10 max-w-[60ch]">
      Slack doesn&apos;t help you
      <br />
      <span className="text-coffee-oat">with this part.</span>
    </h2>

    <div className="space-y-5">
      {[
        {
          title: '"Who knows this?"',
          desc: "Slack doesn't know who has what expertise. Attunly matches your question to teammates based on what they know.",
        },
        {
          title: '"Are they free?"',
          desc: 'A green dot means online, not available. Attunly shows actual calendar availability.',
        },
        {
          title: '"How do I phrase this?"',
          desc: "Attunly drafts a low-pressure message that's easy to say yes or no to.",
        },
      ].map((item) => (
        <div
          key={item.title}
          className="card-hover p-5 bg-coffee-cream rounded-xl border border-coffee-foam"
        >
          <p className="font-semibold text-coffee-espresso mb-1">{item.title}</p>
          <p className="text-coffee-cortado">{item.desc}</p>
        </div>
      ))}
    </div>
  </Section>
);

// Trust Section
const Trust = () => (
  <Section darker>
    <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">Designed for real teams</p>

    <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-10">
      Stays out of your way.
    </h2>

    <div className="grid gap-5">
      <div className="card-hover p-6 bg-coffee-paper rounded-xl border border-coffee-foam">
        <h3 className="text-lg font-semibold text-coffee-espresso mb-2">2-minute setup</h3>
        <p className="text-coffee-cortado">Describe what you know in plain English. Connect your calendar. Done.</p>
      </div>

      <div className="card-hover p-6 bg-coffee-paper rounded-xl border border-coffee-foam">
        <h3 className="text-lg font-semibold text-coffee-espresso mb-2">Lives in Slack</h3>
        <p className="text-coffee-cortado">
          No new app. No new tab. Just{' '}
          <code className="bg-coffee-cream px-1.5 py-0.5 rounded text-sm text-coffee-mocha">/attunly</code> where you
          already work.
        </p>
      </div>

      <div className="card-hover p-6 bg-coffee-paper rounded-xl border border-coffee-foam">
        <h3 className="text-lg font-semibold text-coffee-espresso mb-2">You stay in control</h3>
        <p className="text-coffee-cortado">Edit the draft. Pick a different person. Schedule or message. Your call.</p>
      </div>
    </div>
  </Section>
);

// Final CTA Section
const FinalCTA = () => (
  <Section className="text-center" id="install">
    <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-4">
      Start asking without overthinking.
    </h2>

    <p className="text-xl text-coffee-cortado mb-10 max-w-[60ch] mx-auto">
      Add Attunly to Slack in under a minute.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
      <Button primary href="/signup">
        <SlackIcon />
        Add to Slack
      </Button>
    </div>

    <p className="text-sm text-coffee-latte">Free to start · No credit card · Works with any Slack plan</p>
  </Section>
);

// Footer
const Footer = () => (
  <footer className="px-6 md:px-12 lg:px-24 py-12 bg-coffee-espresso text-coffee-oat">
    <div className="max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
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
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 lg:px-24 py-4 bg-coffee-paper/70 border-b border-coffee-foam/50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-7 h-7" />
            <span className="text-xl font-semibold text-coffee-espresso">attunly</span>
          </Link>
          <div className="flex items-center gap-4">
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
        </div>
      </nav>

      <Hero />
      <TheMoment />
      <TheSolution />
      <HowItWorks />
      <WhatsDifferent />
      <Trust />
      <FinalCTA />
      <Footer />
    </main>
  );
}
