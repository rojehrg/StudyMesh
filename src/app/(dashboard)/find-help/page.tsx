"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LottieLoader } from "@/components/loading-states";
import {
  Search,
  Sparkles,
  MessageSquare,
  Slack,
  MapPin,
  Briefcase,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";

interface Match {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  expertise_text: string | null;
  similarity: number;
  match_reason?: string;
  currently_available: boolean;
  major: string | null;
  department: string | null;
  timezone: string | null;
  slack_connected: boolean;
}

export default function FindHelpPage() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchType, setSearchType] = useState<"ai" | "text" | "none">("none");
  const [selectedPerson, setSelectedPerson] = useState<Match | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setSearching(true);
    setSearched(true);

    try {
      const res = await fetch("/api/find-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryText: query, limit: 10 }),
      });

      const data = await res.json();

      if (data.success) {
        setMatches(data.matches || []);
        setSearchType(data.searchType || "none");
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setMatches([]);
    } finally {
      setSearching(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getInitials = (first: string | null, last: string | null) => {
    return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() || "?";
  };

  const handleAskForHelp = (person: Match) => {
    // For now, redirect to a Slack DM or show contact info
    // In the future, this could open the NudgeDialog
    if (person.slack_connected) {
      setSelectedPerson(person);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-coffee-espresso mb-2">
          Find Help
        </h1>
        <p className="text-coffee-cortado">
          Describe what you need help with and we'll find the right person
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-coffee-latte" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., I need help with React performance optimization..."
              className="pl-10 h-12 text-base"
              autoFocus
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="h-12 px-6 bg-coffee-espresso hover:bg-coffee-roast"
          >
            {searching ? (
              <LottieLoader size="sm" className="w-5 h-5" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Find
              </>
            )}
          </Button>
        </div>

        {/* Search type indicator */}
        {searched && !searching && (
          <div className="mt-2 text-sm text-coffee-latte">
            {searchType === "ai" && (
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI-powered matching
              </span>
            )}
            {searchType === "text" && (
              <span>Keyword matching</span>
            )}
          </div>
        )}
      </div>

      {/* Example queries */}
      {!searched && (
        <div className="mb-8">
          <p className="text-sm text-coffee-cortado mb-3">Try searching for:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "React hooks best practices",
              "Database optimization",
              "UX design feedback",
              "Python data analysis",
              "AWS deployment help",
            ].map((example) => (
              <button
                key={example}
                onClick={() => {
                  setQuery(example);
                }}
                className="text-sm px-3 py-1.5 bg-coffee-cream/50 hover:bg-coffee-cream text-coffee-mocha rounded-full transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {searching ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <LottieLoader size="lg" />
            <p className="text-coffee-cortado mt-4">Finding the right people...</p>
          </motion.div>
        ) : searched && matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-coffee-cream/30 rounded-xl"
          >
            <Users className="w-10 h-10 text-coffee-latte mx-auto mb-3" />
            <p className="text-coffee-mocha font-medium">No matches found</p>
            <p className="text-coffee-cortado text-sm mt-1">
              Try different keywords or a broader description
            </p>
          </motion.div>
        ) : matches.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-sm text-coffee-cortado mb-4">
              {matches.length} {matches.length === 1 ? "person" : "people"} can help
            </p>

            {matches.map((match, index) => (
              <motion.div
                key={match.user_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-coffee-foam p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarFallback className="bg-coffee-cream text-coffee-mocha text-lg">
                      {getInitials(match.first_name, match.last_name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-coffee-espresso">
                        {match.first_name} {match.last_name}
                      </h3>
                      {match.currently_available && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          Available
                        </span>
                      )}
                      {/* Match score */}
                      <Badge
                        variant="secondary"
                        className="bg-coffee-cream/50 text-coffee-mocha text-xs"
                      >
                        {Math.round(match.similarity * 100)}% match
                      </Badge>
                    </div>

                    {/* Role & Department */}
                    <div className="flex items-center gap-3 text-sm text-coffee-cortado mt-1">
                      {match.major && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {match.major}
                        </span>
                      )}
                      {match.department && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {match.department}
                        </span>
                      )}
                    </div>

                    {/* Match reason or expertise */}
                    {match.match_reason ? (
                      <p className="text-sm text-coffee-mocha mt-2 italic">
                        "{match.match_reason}"
                      </p>
                    ) : match.expertise_text ? (
                      <p className="text-sm text-coffee-cortado mt-2 line-clamp-2">
                        {match.expertise_text}
                      </p>
                    ) : null}
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    {match.slack_connected ? (
                      <Button
                        size="sm"
                        onClick={() => handleAskForHelp(match)}
                        className="bg-coffee-espresso hover:bg-coffee-roast"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Ask
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        <Slack className="w-4 h-4 mr-1" />
                        No Slack
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* How it works */}
      {!searched && (
        <div className="mt-12 pt-8 border-t border-coffee-foam/50">
          <h2 className="text-lg font-medium text-coffee-espresso mb-4">
            How it works
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Describe your need",
                desc: "Tell us what you're trying to solve",
              },
              {
                icon: Sparkles,
                title: "AI finds matches",
                desc: "We match your request to team expertise",
              },
              {
                icon: MessageSquare,
                title: "Connect & learn",
                desc: "Reach out and get the help you need",
              },
            ].map((step, i) => (
              <div
                key={step.title}
                className="flex items-start gap-3 p-4 bg-coffee-cream/30 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-coffee-cream flex items-center justify-center shrink-0">
                  <step.icon className="w-4 h-4 text-coffee-mocha" />
                </div>
                <div>
                  <p className="font-medium text-coffee-espresso">{step.title}</p>
                  <p className="text-sm text-coffee-cortado">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selectedPerson} onOpenChange={() => setSelectedPerson(null)}>
        <SheetContent side="right" className="w-[400px] sm:w-[480px]">
          {selectedPerson && (
            <div className="space-y-6">
              <SheetHeader className="flex flex-row items-start gap-4 space-y-0">
                <Avatar className="h-16 w-16 shrink-0">
                  <AvatarFallback className="bg-coffee-cream text-coffee-mocha text-xl">
                    {getInitials(selectedPerson.first_name, selectedPerson.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-xl text-coffee-espresso">
                      {selectedPerson.first_name} {selectedPerson.last_name}
                    </SheetTitle>
                    {selectedPerson.currently_available && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Available
                      </span>
                    )}
                  </div>
                  {selectedPerson.major && (
                    <p className="text-coffee-cortado mt-1">{selectedPerson.major}</p>
                  )}
                </div>
              </SheetHeader>

              {selectedPerson.expertise_text && (
                <div>
                  <h3 className="text-sm font-medium text-coffee-mocha mb-2">
                    Their expertise
                  </h3>
                  <p className="text-sm text-coffee-cortado leading-relaxed">
                    {selectedPerson.expertise_text}
                  </p>
                </div>
              )}

              {selectedPerson.match_reason && (
                <div className="p-3 bg-coffee-cream/50 rounded-lg">
                  <p className="text-sm text-coffee-mocha">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    <strong>Why they match:</strong> {selectedPerson.match_reason}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-coffee-foam">
                <p className="text-sm text-coffee-cortado mb-3">
                  Use Slack to reach out:
                </p>
                <div className="p-4 bg-coffee-cream/30 rounded-lg">
                  <code className="text-sm text-coffee-espresso">
                    /attunly ask @{selectedPerson.first_name?.toLowerCase()} {query}
                  </code>
                </div>
                <p className="text-xs text-coffee-latte mt-2">
                  Or just send them a direct message on Slack
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
