"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MagnifyingGlass,
  CircleNotch,
  Lightning,
  Sparkle,
  UserCircle,
  HandWaving,
  ArrowRight,
  Info
} from "@phosphor-icons/react";
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

  const { embed, ready: embeddingReady, generating: embeddingGenerating } = useEmbeddings();
  const supabase = createClient();

  // Load current user profile and generate their expertise embedding if needed
  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, knowledge_areas, expertise_skills, expertise_text, timezone, availability')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setCurrentUser({
          userId: profile.user_id,
          knowledgeAreas: profile.knowledge_areas || profile.expertise_skills || [],
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
    if (!query.trim() || !embeddingReady) return;

    setSearching(true);
    setHasSearched(true);

    try {
      // Generate embedding for the search query
      const queryEmbedding = await embed(query);

      // Search for matches
      const response = await fetch('/api/find-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryEmbedding, limit: 10 }),
      });

      const data = await response.json();

      if (data.success && data.matches) {
        setResults(data.matches);
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
    const response = await fetch('/api/nudge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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
          <MagnifyingGlass className="w-7 h-7 text-primary" weight="duotone" />
          Find Help
        </h1>
        <p className="text-muted-foreground mt-1">
          Describe what you need help with and we'll find the right teammates
        </p>
      </div>

      {/* Search Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">What do you need help with?</CardTitle>
            {!embeddingReady && (
              <Badge variant="secondary" className="text-xs bg-muted">
                <CircleNotch className="w-3 h-3 animate-spin mr-1" weight="duotone" />
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
            placeholder="Example: My Salesforce dashboard is showing incorrect numbers and I need help debugging the SOQL query. Also having trouble with the report scheduling."
            rows={4}
            className="resize-none"
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
              disabled={!query.trim() || !embeddingReady || searching}
              className="gap-2"
            >
              {searching || embeddingGenerating ? (
                <>
                  <CircleNotch className="w-4 h-4 animate-spin" weight="duotone" />
                  {embeddingGenerating ? "Analyzing..." : "Searching..."}
                </>
              ) : (
                <>
                  <Sparkle className="w-4 h-4" weight="duotone" />
                  Find Matches
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {results.length > 0 ? "Best Matches" : "No Matches Found"}
            </h2>
            {results.length > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                {results.length} {results.length === 1 ? 'person' : 'people'} found
              </Badge>
            )}
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UserCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" weight="duotone" />
                <h3 className="font-semibold text-foreground mb-2">No matches yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  We couldn't find teammates with matching expertise. Try rephrasing your question or ask in a pod.
                </p>
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
                                <Lightning className="w-3 h-3 mr-0.5" weight="fill" />
                                Available now
                              </Badge>
                            )}
                          </div>

                          {(match.major || match.department) && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {[match.major, match.department].filter(Boolean).join(' · ')}
                            </p>
                          )}

                          {match.expertise_text && (
                            <p className="text-sm text-foreground/80 mt-2 line-clamp-2">
                              {match.expertise_text}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <Button
                          size="sm"
                          onClick={() => setSelectedMember(match)}
                          className={match.currently_available
                            ? 'bg-success hover:bg-success/90'
                            : 'bg-primary hover:bg-primary/90'
                          }
                        >
                          <HandWaving className="w-4 h-4 mr-1" weight="duotone" />
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
      {!hasSearched && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Info className="w-10 h-10 text-muted-foreground mx-auto mb-3" weight="duotone" />
            <h3 className="font-medium text-foreground mb-1">How it works</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Our AI understands natural language. Just describe your problem and we'll find teammates
              with relevant expertise - no need for exact keyword matches.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                Green = available now
              </span>
              <span className="flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
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
