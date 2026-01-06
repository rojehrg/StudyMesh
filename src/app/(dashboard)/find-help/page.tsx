"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  WifiHigh,
  Star,
  UserCircle,
  PaperPlane,
  ArrowRightMd,
  Info,
  SearchMagnifyingGlass
} from "react-coolicons";
import { LottieLoader } from "@/components/loading-states";
import { useEmbeddings } from "@/hooks/use-embeddings";
import { createClient } from "@/lib/supabase/client";
import { NudgeDialog } from "@/components/nudge-dialog";
import { toast } from "sonner";

interface MatchResult {
  user_id: string;
  first_name: string;
  last_name: string;
  expertise_text: string;
  similarity: number;
  currently_available: boolean;
  major?: string;
  department?: string;
  timezone?: string;
  availability_slots?: any[];
  slack_connected?: boolean;
}

interface CurrentUser {
  userId: string;
  firstName?: string;
  lastName?: string;
  knowledgeAreas?: string[];
  expertiseSkills?: string[];
  timezone?: string;
  availabilitySlots?: any[];
}

export default function FindHelpPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MatchResult | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [searchType, setSearchType] = useState<'ai' | 'text' | null>(null);

  const { embed, ready: embeddingReady, generating: embeddingGenerating } = useEmbeddings();
  const supabase = createClient();

  // Load current user profile and generate their expertise embedding if needed
  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, expertise_skills, expertise_text, timezone, availability')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        return;
      }

      if (profile) {
        setCurrentUser({
          userId: profile.user_id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          knowledgeAreas: profile.expertise_skills || [],
          timezone: profile.timezone,
          availabilitySlots: profile.availability?.slots || [],
        });

        // Generate and save expertise embedding if user has expertise text but embedding might be missing
        if (profile.expertise_text && embeddingReady) {
          try {
            const embedding = await embed(profile.expertise_text);
            await fetch('/api/profile/expertise', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ expertiseText: profile.expertise_text, embedding }),
            });
          } catch (err) {
            console.error('Failed to generate expertise embedding:', err);
          }
        }
      }
    };

    if (embeddingReady) {
      loadCurrentUser();
    }
  }, [supabase, embeddingReady, embed]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setSearching(true);
    setHasSearched(false); // Reset so loading shows cleanly
    setResults([]);
    setSearchType(null);

    // Minimum loading time for UX
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 800));

    try {
      let queryEmbedding = null;

      // Try to generate embedding if ready
      if (embeddingReady) {
        try {
          queryEmbedding = await embed(query);
        } catch (err) {
          console.warn('Embedding generation failed, using text search:', err);
        }
      }

      // Search for matches - API will fall back to text search if no embedding
      const [response] = await Promise.all([
        fetch('/api/find-help', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            queryEmbedding,
            queryText: query, // Always pass text for fallback
            limit: 10,
          }),
        }),
        minLoadTime, // Ensure minimum loading time
      ]);

      const data = await response.json();

      if (data.success) {
        setResults(data.matches || []);
        setSearchType(data.searchType || 'text');
      } else {
        toast.error('Failed to search');
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
      setResults([]);
    } finally {
      setSearching(false);
      setHasSearched(true);
    }
  }, [query, embed, embeddingReady]);

  const handleNudge = async (data: {
    recipientId: string;
    topic: string;
    type: "ask" | "offer";
    meetingLength: "15min" | "30min" | "1hr" | "async";
    suggestedTime?: string;
    message: string;
  }) => {
    const senderName = currentUser?.firstName
      ? `${currentUser.firstName}${currentUser.lastName ? ' ' + currentUser.lastName : ''}`
      : 'Someone';

    const response = await fetch('/api/slack/nudge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientUserId: data.recipientId,
        senderName,
        topic: data.topic,
        nudgeType: data.type,
        meetingLength: data.meetingLength,
        message: data.message,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send nudge');
    }

    toast.success('Nudge sent!');
  };

  const formatSimilarity = (similarity: number) => {
    return Math.round(similarity * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <img src="/ai-search.svg" alt="" className="w-7 h-7" />
          AI Match
        </h1>
        <p className="text-muted-foreground mt-1">
          Describe what you need help with and our AI will find the right teammates
        </p>
      </div>

      {/* Search Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">What do you need help with?</CardTitle>
            {!embeddingReady && (
              <Badge variant="secondary" className="text-xs bg-muted">
                <LottieLoader size="sm" className="w-3 h-3 mr-1" />
                Loading AI
              </Badge>
            )}
          </div>
          <CardDescription>
            Be specific about your problem or question. Our AI will match you with people who have relevant expertise.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Example: Need help debugging a React performance issue with re-renders..."
            rows={3}
            className="resize-none focus:ring-2 focus:ring-primary/20 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) {
                handleSearch();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Cmd + Enter</kbd> to search
            </p>
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || searching}
              className="gap-2 bg-violet-500 hover:bg-violet-600 rounded-xl cursor-pointer active:scale-95 transition-all"
            >
              {searching || embeddingGenerating ? (
                <>
                  <LottieLoader size="sm" className="w-4 h-4" />
                  {embeddingGenerating ? "Analyzing..." : "Searching..."}
                </>
              ) : (
                "Find Matches"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {searching && (
        <Card>
          <CardContent className="py-12 text-center">
            <LottieLoader size="lg" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Finding the best matches...</h3>
            <p className="text-sm text-muted-foreground">
              Our AI is analyzing your request
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {hasSearched && !searching && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">
                {results.length > 0 ? "Best Matches" : "No Matches Found"}
              </h2>
              {searchType && results.length > 0 && (
                <Badge variant="secondary" className={`text-xs border-0 ${
                  searchType === 'ai' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {searchType === 'ai' ? (
                    <><Star className="w-3 h-3 mr-1" />AI Match</>
                  ) : (
                    <><SearchMagnifyingGlass className="w-3 h-3 mr-1" />Text Search</>
                  )}
                </Badge>
              )}
            </div>
            {results.length > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                {results.length} {results.length === 1 ? 'person' : 'people'} found
              </Badge>
            )}
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UserCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No matches found</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  We match you with teammates based on their expertise profiles. If your team is new, ask teammates to fill in "What can you help with?" in their Settings.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/settings">Add your expertise</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {results.map((match, index) => (
                <motion.div
                  key={match.user_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`transition-all hover:border-primary/30 ${
                    match.currently_available ? 'border-success/30 bg-success/5' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarFallback className={`font-semibold ${
                            match.currently_available
                              ? 'bg-success/20 text-success'
                              : 'bg-primary/20 text-primary'
                          }`}>
                            {match.first_name?.[0]?.toUpperCase() || 'T'}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">
                              {match.first_name} {match.last_name}
                            </h3>
                            <Badge
                              variant="secondary"
                              className={`text-xs border-0 ${
                                formatSimilarity(match.similarity) >= 80
                                  ? 'bg-success/20 text-success'
                                  : formatSimilarity(match.similarity) >= 60
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {formatSimilarity(match.similarity)}% match
                            </Badge>
                            {match.currently_available && (
                              <Badge className="bg-success/20 text-success border-0 text-xs">
                                <WifiHigh className="w-3 h-3 mr-0.5" />
                                Available now
                              </Badge>
                            )}
                          </div>

                          {(match.major || match.department) && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {[match.major, match.department].filter(Boolean).join(' · ')}
                            </p>
                          )}

                          {/* Skills tags */}
                          {(match.major || match.department || match.expertise_text) && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {match.major && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                  {match.major}
                                </span>
                              )}
                              {match.department && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                  {match.department}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <Button
                          size="sm"
                          onClick={() => setSelectedMember(match)}
                          className="bg-violet-500 hover:bg-violet-600 rounded-xl"
                        >
                          <PaperPlane className="w-4 h-4 mr-1" />
                          Nudge
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Help tip when no search yet */}
      {!hasSearched && !searching && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Info className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-1">How it works</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Our AI understands natural language. Just describe your problem and we'll find teammates
              with relevant expertise - no need for exact keyword matches.
            </p>

            {/* Suggested queries */}
            <div className="mt-5">
              <p className="text-xs text-muted-foreground mb-2">Try searching for:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Help with React performance",
                  "Someone who knows our API",
                  "Design feedback needed",
                  "Database optimization",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                Green = available now
              </span>
              <span className="flex items-center gap-1">
                <ArrowRightMd className="w-3 h-3" />
                Higher % = better match
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nudge Dialog */}
      {selectedMember && currentUser && (
        <NudgeDialog
          open={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          member={{
            userId: selectedMember.user_id,
            name: `${selectedMember.first_name || ''} ${selectedMember.last_name || ''}`.trim() || 'Teammate',
            knowledgeAreas: [],
            timezone: selectedMember.timezone,
            availabilitySlots: selectedMember.availability_slots,
            currentlyAvailable: selectedMember.currently_available,
            slackConnected: selectedMember.slack_connected,
          }}
          currentUser={currentUser}
          onNudge={handleNudge}
        />
      )}
    </motion.div>
  );
}
