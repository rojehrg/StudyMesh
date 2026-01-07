'use client';

import { useState, useEffect, useRef } from 'react';

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

const Section = ({ children, className = '', darker = false, id }: {
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

const Button = ({ children, primary = false, href = '#', className = '' }: {
  children: React.ReactNode;
  primary?: boolean;
  href?: string;
  className?: string;
}) => (
  <a
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
  </a>
);

const SlackIcon = ({ className = 'w-5 h-5 mr-2' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
  </svg>
);

// ============================================
// HERO SECTION
// ============================================
const Hero = () => (
  <section className="min-h-[70vh] flex flex-col justify-center px-6 md:px-12 lg:px-24 py-16 bg-coffee-paper">
    <div className="max-w-2xl mx-auto w-full">
      <p className="text-coffee-latte text-sm tracking-wide uppercase mb-6">
        Find the right person to ask
      </p>

      <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-coffee-espresso leading-[1.1] tracking-tight mb-6">
        Ask for help
        <br />
        <span className="text-coffee-oat">without the friction.</span>
      </h1>

      <p className="text-xl md:text-2xl text-coffee-cortado leading-relaxed mb-10 max-w-[60ch]">
        Describe what you know. Connect your calendar.
        Then type <code className="bg-coffee-cream px-2 py-0.5 rounded text-lg font-mono text-coffee-mocha">/attunly</code> in Slack
        to find who can help and when they're free.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button primary href="/signup">
          Create your profile
        </Button>
        <Button href="#how-it-works">See how it works →</Button>
      </div>

      {/* Proof line */}
      <p className="text-sm text-coffee-latte max-w-[60ch]">
        No status to set. No scheduling awkwardness. Just ask.
      </p>
    </div>
  </section>
);

// ============================================
// THE MOMENT SECTION
// ============================================
const TheMoment = () => (
  <Section darker>
    <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">
      You know this feeling
    </p>

    <div className="space-y-6 text-xl md:text-2xl text-coffee-mocha leading-relaxed max-w-[60ch]">
      <p>The cursor is blinking in Slack.</p>
      <p>
        You need to ask someone for help. But you're not sure how to phrase it.
        You rewrite the message. You soften it. You delete the whole thing.
      </p>
      <p className="text-coffee-latte">
        So the question waits, and the work stays blocked.
      </p>
    </div>

    <div className="mt-10 pt-8 border-t border-coffee-steamed">
      <p className="text-lg text-coffee-mocha font-medium max-w-[60ch]">
        The question never gets asked. That's the cost.
      </p>
    </div>
  </Section>
);

// ============================================
// THE SOLUTION SECTION
// ============================================
const TheSolution = () => (
  <Section>
    <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">
      What Attunly does
    </p>

    <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-8 max-w-[60ch]">
      It knows who knows what
      <br />
      <span className="text-coffee-oat">and when they're free.</span>
    </h2>

    <div className="space-y-5 text-lg text-coffee-cortado leading-relaxed max-w-[60ch]">
      <p>
        Everyone creates a profile describing their expertise in their own words.
        Attunly understands natural language, so "I'm good at React hooks and debugging CSS" works.
      </p>
      <p>
        When you need help, type <code className="bg-coffee-cream px-2 py-0.5 rounded font-mono text-coffee-mocha">/attunly</code> in Slack.
        Attunly finds who matches and shows their real availability from Google Calendar.
        Then it drafts a calm message you can send or edit.
      </p>
    </div>
  </Section>
);

// ============================================
// HOW IT WORKS (3 STEPS)
// ============================================
const HowItWorks = () => (
  <Section darker id="how-it-works">
    <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">
      Three steps
    </p>

    <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-12">
      How it works
    </h2>

    <div className="space-y-10">
      {[
        {
          step: '1',
          title: 'Create your profile',
          desc: 'Describe what you know in your own words. No forms, just natural language.',
        },
        {
          step: '2',
          title: 'Connect your calendar',
          desc: "Link Google Calendar so others can see when you're actually free.",
        },
        {
          step: '3',
          title: 'Use /attunly in Slack',
          desc: 'Describe what you need. Get matched with someone who can help and see their availability.',
        },
      ].map((item) => (
        <div key={item.step} className="flex gap-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-coffee-espresso text-coffee-paper flex items-center justify-center text-lg font-semibold">
            {item.step}
          </div>
          <div>
            <h3 className="text-xl font-medium text-coffee-espresso mb-1">
              {item.title}
            </h3>
            <p className="text-coffee-cortado max-w-[60ch]">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

// ============================================
// WHAT MAKES THIS DIFFERENT
// ============================================
const WhatsDifferent = () => (
  <Section>
    <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">
      Why this exists
    </p>

    <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-10 max-w-[60ch]">
      Slack doesn't help you
      <br />
      <span className="text-coffee-oat">with this part.</span>
    </h2>

    <div className="space-y-8 text-lg text-coffee-cortado max-w-[60ch]">
      <div className="pb-6 border-b border-coffee-foam">
        <p className="font-medium text-coffee-espresso mb-2">
          Slack shows who's online.
        </p>
        <p className="max-w-[60ch]">
          Not whether you should ask now, or how to ask without creating pressure.
        </p>
      </div>

      <div className="pb-6 border-b border-coffee-foam">
        <p className="font-medium text-coffee-espresso mb-2">
          Calendars show meetings.
        </p>
        <p className="max-w-[60ch]">An empty slot isn't permission to interrupt.</p>
      </div>

      <div>
        <p className="font-medium text-coffee-espresso mb-2">
          Attunly removes the friction.
        </p>
        <p className="text-coffee-mocha max-w-[60ch]">
          So the work moves forward.
        </p>
      </div>
    </div>
  </Section>
);

// ============================================
// TRUST & RESTRAINT
// ============================================
const Trust = () => (
  <Section darker>
    <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">
      Designed for real teams
    </p>

    <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-10">
      Stays out of your way.
    </h2>

    <div className="grid gap-6">
      {[
        {
          title: 'No status to set',
          desc: 'Works when you need it. Nothing to maintain.',
        },
        {
          title: 'Works with Slack',
          desc: 'No new app. Just a command.',
        },
        {
          title: 'You stay in control',
          desc: 'Edit the draft. Pick the recipient.',
        },
      ].map((item) => (
        <div
          key={item.title}
          className="p-6 bg-coffee-paper rounded-lg border border-coffee-foam"
        >
          <h3 className="text-lg font-medium text-coffee-espresso mb-2">
            {item.title}
          </h3>
          <p className="text-coffee-cortado max-w-[60ch]">{item.desc}</p>
        </div>
      ))}
    </div>
  </Section>
);

// ============================================
// FINAL CTA
// ============================================
const FinalCTA = () => (
  <Section className="text-center" id="install">
    <h2 className="text-3xl md:text-4xl font-semibold text-coffee-espresso leading-tight mb-4">
      Find the right person to ask.
    </h2>

    <p className="text-xl text-coffee-cortado mb-10 max-w-[60ch] mx-auto">
      Create your profile in a few minutes. Then use Slack to ask for help.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
      <Button primary href="/signup">
        Create your profile
      </Button>
      <Button href="/login">Already have an account? →</Button>
    </div>

    <p className="text-sm text-coffee-latte">
      Free to start · No credit card
    </p>
  </Section>
);

// ============================================
// FOOTER
// ============================================
const Footer = () => (
  <footer className="px-6 md:px-12 lg:px-24 py-12 bg-coffee-espresso text-coffee-latte">
    <div className="max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <a href="/" className="flex items-center gap-2">
        <img src="/logo.svg" alt="" className="w-6 h-6 invert" />
        <span className="text-xl font-semibold text-coffee-paper">attunly</span>
      </a>
      <div className="flex gap-8 text-sm">
        <a href="/privacy" className="hover:text-coffee-paper transition-colors">
          Privacy
        </a>
        <a href="/terms" className="hover:text-coffee-paper transition-colors">
          Terms
        </a>
        <a href="/support" className="hover:text-coffee-paper transition-colors">
          Contact
        </a>
      </div>
    </div>
  </footer>
);

// ============================================
// MAIN PAGE
// ============================================
export default function AttunlyLanding() {
  return (
    <main
      className="antialiased bg-coffee-paper"
      style={{
        fontFamily:
          '"Source Serif 4", "Source Serif Pro", Georgia, "Times New Roman", serif',
      }}
    >
      {/* Minimal nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 lg:px-24 py-4 bg-[#fffcf9]/95 backdrop-blur-sm border-b border-coffee-foam">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-7 h-7" />
            <span className="text-xl font-semibold text-coffee-espresso">attunly</span>
          </a>
          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="text-sm font-medium text-coffee-cortado hover:text-coffee-espresso transition-colors"
            >
              Log in
            </a>
            <Button primary href="/signup" className="text-sm py-2.5 px-5">
              Create profile
            </Button>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16" />

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
