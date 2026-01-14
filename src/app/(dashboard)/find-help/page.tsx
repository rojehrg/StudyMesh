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
import { useToast } from "@/hooks/use-toast";
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
  Languages,
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
  slack_handle: string | null;
  translated_expertise?: string | null;
  translation_info?: {
    from_dept: string;
    to_dept: string;
  } | null;
}

export default function FindHelpPage() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchType, setSearchType] = useState<"ai" | "text" | "none">("none");
  const [selectedPerson, setSelectedPerson] = useState<Match | null>(null);
  const { toast } = useToast();

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
    if (person.slack_handle) {
      // Person has Slack connected - show instructions to use /attunly command
      toast({
        title: "Request help in Slack",
        description: `Use /attunly ${person.slack_handle} in Slack to request help from ${person.first_name}.`,
      });
    } else if (person.slack_connected) {
      // Slack connected but no handle (edge case)
      toast({
        title: "Request help in Slack",
        description: `Use /attunly in Slack to request help from ${person.first_name}.`,
      });
    } else {
      // Person hasn't connected Slack
      toast({
        title: "Slack not connected",
        description: `${person.first_name} hasn't connected Slack yet. Try reaching out another way.`,
        variant: "destructive",
      });
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
          Search by topic or skill to discover who can help
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
              placeholder="e.g., React, sales pipeline, data analysis..."
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
                <Search className="w-4 h-4 mr-2" />
                Search
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
          <p className="text-sm text-coffee-mocha mb-3">Popular topics:</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Popular search topics">
            {[
              "React",
              "SQL",
              "UX design",
              "Python",
              "sales strategy",
              "APIs",
              "data analysis",
            ].map((example) => (
              <button
                key={example}
                onClick={() => {
                  setQuery(example);
                }}
                className="text-sm px-3 py-1.5 bg-coffee-cream/50 hover:bg-coffee-cream text-coffee-mocha rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-mocha focus:ring-offset-1"
                aria-label={`Search for ${example}`}
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
              {matches.length} {matches.length === 1 ? "match" : "matches"} found
            </p>

            {matches.map((match, index) => (
              <motion.div
                key={match.user_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-coffee-foam p-5 hover:shadow-md transition-shadow"
              >
                {/* Header: Avatar, Name, Badges, Action */}
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback className="bg-coffee-cream text-coffee-mocha text-base font-medium">
                      {getInitials(match.first_name, match.last_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-coffee-espresso">
                        {match.first_name} {match.last_name}
                      </h3>
                      {match.currently_available && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          Available
                        </span>
                      )}
                      <Badge
                        variant="secondary"
                        className="bg-coffee-cream/50 text-coffee-mocha text-xs"
                      >
                        {Math.round(match.similarity * 100)}% match
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-coffee-cortado mt-0.5">
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAskForHelp(match)}
                      >
                        <Slack className="w-4 h-4 mr-1" />
                        No Slack
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expertise section */}
                <div className="space-y-2">
                  {/* Their expertise */}
                  {(match.match_reason || match.expertise_text) && (
                    <div className="bg-coffee-cream/30 rounded-lg px-3 py-2">
                      <p className="text-xs text-coffee-latte mb-1">Their expertise</p>
                      <p className="text-sm text-coffee-mocha">
                        {match.match_reason || match.expertise_text}
                      </p>
                    </div>
                  )}

                  {/* Translation */}
                  {match.translated_expertise && (
                    <div className="bg-coffee-foam/50 rounded-lg px-3 py-2">
                      <p className="text-xs text-coffee-latte mb-1">
                        In {match.translation_info?.to_dept} terms
                      </p>
                      <p className="text-sm text-coffee-espresso font-medium">
                        {match.translated_expertise.replace(/^.*→\s*/, '')}
                      </p>
                    </div>
                  )}
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
                title: "Search a topic",
                desc: "Enter keywords or skills you need",
              },
              {
                icon: Sparkles,
                title: "See who knows it",
                desc: "AI matches you with the right people",
              },
              {
                icon: MessageSquare,
                title: "Reach out",
                desc: "Send them a message on Slack",
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
                  Ready to reach out?
                </p>
                <p className="text-sm text-coffee-cortado">
                  Type <code className="bg-coffee-cream/80 px-1.5 py-0.5 rounded text-xs font-mono text-coffee-mocha">/attunly</code> in Slack to request their help, or send them a direct message.
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
