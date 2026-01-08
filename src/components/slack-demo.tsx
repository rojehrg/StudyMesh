'use client';

import { useEffect, useState } from 'react';

interface Person {
  initials: string;
  name: string;
  role: string;
  skills: string;
  availability: string;
  status: 'green' | 'yellow';
}

interface Scenario {
  phrase: string;
  channel: string;
  people: Person[];
}

const scenarios: Scenario[] = [
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

interface SlackDemoProps {
  /** Size variant - compact for auth pages, full for landing */
  size?: 'compact' | 'full';
  /** Optional className for additional styling */
  className?: string;
}

export function SlackDemo({ size = 'full', className = '' }: SlackDemoProps) {
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
  }, [displayText, isDeleting, scenarioIndex, currentScenario.phrase]);

  const isCompact = size === 'compact';

  return (
    <div className={`font-sans ${className}`}>
      <div className={`bg-white rounded-xl shadow-xl border border-coffee-foam/50 overflow-hidden ${isCompact ? 'max-w-sm' : 'max-w-md'}`}>
        {/* Slack header */}
        <div className={`bg-[#3F0F40] ${isCompact ? 'px-3 py-2' : 'px-4 py-3'} flex items-center gap-2`}>
          <div className="flex gap-1.5">
            <div className={`${isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full bg-[#EC6A5F]`}></div>
            <div className={`${isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full bg-[#F4BF50]`}></div>
            <div className={`${isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full bg-[#61C454]`}></div>
          </div>
          <span className={`text-white/90 ${isCompact ? 'text-xs' : 'text-sm'} ml-3 font-medium`}># {currentScenario.channel}</span>
        </div>

        {/* Slack input area */}
        <div className={`${isCompact ? 'p-3' : 'p-4'} bg-white`}>
          <div className={`border border-gray-300 rounded-lg ${isCompact ? 'px-3 py-2' : 'px-4 py-3'} bg-white`}>
            <div className={`flex items-center ${isCompact ? 'text-sm' : 'text-[15px]'}`}>
              <span className="text-gray-900 font-bold">/attunly</span>
              <span className="ml-2 text-gray-700">{displayText}</span>
              <span className="inline-block w-0.5 h-[1.1em] bg-current text-gray-400 ml-0.5 animate-[blink_1s_step-end_infinite]"></span>
            </div>
          </div>

          {/* Response preview */}
          <div
            className={`${isCompact ? 'mt-3' : 'mt-4'} transition-all duration-500 ease-out ${
              showResponse ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <div className={`flex items-start ${isCompact ? 'gap-2' : 'gap-3'}`}>
              <div className={`${isCompact ? 'w-7 h-7' : 'w-9 h-9'} rounded-lg bg-coffee-espresso flex items-center justify-center flex-shrink-0`}>
                <img src="/logo.svg" alt="Attunly" className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'} invert`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`flex items-center ${isCompact ? 'gap-1.5 mb-0.5' : 'gap-2 mb-1'}`}>
                  <span className={`font-bold text-gray-900 ${isCompact ? 'text-sm' : 'text-[15px]'}`}>Attunly</span>
                  <span className={`${isCompact ? 'text-[10px]' : 'text-[11px]'} text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium`}>APP</span>
                  <span className={`${isCompact ? 'text-[10px]' : 'text-xs'} text-gray-400`}>12:34 PM</span>
                </div>
                <p className={`${isCompact ? 'text-sm' : 'text-[15px]'} text-gray-800 leading-relaxed`}>
                  Found <strong>{currentScenario.people.length} people</strong> who can help:
                </p>

                {currentScenario.people.map((person, index) => (
                  <div key={person.initials} className={`${index === 0 ? (isCompact ? 'mt-2' : 'mt-3') : 'mt-2'} ${isCompact ? 'p-2' : 'p-3'} bg-coffee-cream rounded-lg border border-coffee-foam`}>
                    <div className={`flex items-center ${isCompact ? 'gap-2' : 'gap-3'}`}>
                      <div className="relative">
                        <div className={`${isCompact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'} rounded-lg bg-coffee-steamed flex items-center justify-center font-semibold text-coffee-mocha`}>
                          {person.initials}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 ${isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full border-2 border-white ${
                          person.status === 'green' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-coffee-espresso ${isCompact ? 'text-xs' : 'text-sm'}`}>{person.name}</div>
                        <p className={`${isCompact ? 'text-[10px]' : 'text-xs'} text-coffee-cortado`}>{person.availability} · {person.skills}</p>
                      </div>
                      <button className={`${isCompact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} font-medium rounded-md transition-colors ${
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
}
