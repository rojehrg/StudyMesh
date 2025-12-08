"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  placeholder?: string;
  type?: "expertise" | "growth";
}

export function SkillAutocomplete({
  value,
  onChange,
  onAdd,
  placeholder = "Add a skill...",
  type = "expertise",
}: SkillAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Load skills only from people in your pods
  useEffect(() => {
    loadPodMemberSkills();
  }, []);

  const loadPodMemberSkills = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get pods the user is in
      const { data: userPods } = await supabase
        .from("pod_members")
        .select("pod_id")
        .eq("user_id", user.id);

      if (!userPods || userPods.length === 0) {
        setAllSkills([]);
        return;
      }

      const podIds = userPods.map(p => p.pod_id);

      // Get all members from those pods (excluding current user)
      const { data: podMembers } = await supabase
        .from("pod_members")
        .select("user_id")
        .in("pod_id", podIds)
        .neq("user_id", user.id);

      if (!podMembers || podMembers.length === 0) {
        setAllSkills([]);
        return;
      }

      // Get unique user IDs
      const uniqueUserIds = [...new Set(podMembers.map(m => m.user_id))];

      // Get profiles only for pod members
      const { data: profiles } = await supabase
        .from("profiles")
        .select("expertise_skills, growth_skills")
        .in("user_id", uniqueUserIds);

      if (!profiles) return;

      const skillSet = new Set<string>();

      profiles.forEach((profile) => {
        (profile.expertise_skills || []).forEach((skill: string) => {
          if (skill && skill.trim()) {
            skillSet.add(skill.trim());
          }
        });
        (profile.growth_skills || []).forEach((skill: string) => {
          if (skill && skill.trim()) {
            skillSet.add(skill.trim());
          }
        });
      });

      setAllSkills(Array.from(skillSet).sort());
    } catch (error) {
      console.error("Error loading skills:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter suggestions based on input
  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchTerm = value.toLowerCase();
    const filtered = allSkills
      .filter(
        (skill) =>
          skill.toLowerCase().includes(searchTerm) &&
          skill.toLowerCase() !== searchTerm
      )
      .slice(0, 6);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(-1);
  }, [value, allSkills]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        onChange(suggestions[selectedIndex]);
        setShowSuggestions(false);
        setTimeout(() => onAdd(), 0);
      } else {
        onAdd();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (skill: string) => {
    onChange(skill);
    setShowSuggestions(false);
    setTimeout(() => onAdd(), 0);
  };

  return (
    <div className="relative flex gap-2">
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.trim() && suggestions.length > 0 && setShowSuggestions(true)}
        />

        {/* Suggestions dropdown */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          >
            <div className={cn(
              "px-3 py-2 text-[10px] uppercase tracking-wider font-medium border-b border-border flex items-center gap-2",
              type === "expertise"
                ? "bg-ctp-peach/10 text-ctp-peach"
                : "bg-ctp-green/10 text-ctp-green"
            )}>
              <Search className="w-3 h-3" />
              Skills from your pods
            </div>
            <div className="max-h-48 overflow-y-auto">
              {suggestions.map((skill, index) => {
                // Highlight matching text
                const searchTerm = value.toLowerCase();
                const skillLower = skill.toLowerCase();
                const matchIndex = skillLower.indexOf(searchTerm);

                let highlightedSkill;
                if (matchIndex >= 0 && value.trim()) {
                  const before = skill.slice(0, matchIndex);
                  const match = skill.slice(matchIndex, matchIndex + value.length);
                  const after = skill.slice(matchIndex + value.length);
                  highlightedSkill = (
                    <>
                      {before}
                      <span className={cn(
                        "font-semibold",
                        type === "expertise" ? "text-ctp-peach" : "text-ctp-green"
                      )}>
                        {match}
                      </span>
                      {after}
                    </>
                  );
                } else {
                  highlightedSkill = skill;
                }

                return (
                  <button
                    key={skill}
                    className={cn(
                      "w-full text-left px-3 py-2.5 text-sm transition-colors",
                      index === selectedIndex
                        ? type === "expertise"
                          ? "bg-ctp-peach/15 text-foreground"
                          : "bg-ctp-green/15 text-foreground"
                        : "text-foreground hover:bg-accent"
                    )}
                    onClick={() => handleSuggestionClick(skill)}
                  >
                    {highlightedSkill}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Button onClick={onAdd} size="icon" variant="outline" disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
