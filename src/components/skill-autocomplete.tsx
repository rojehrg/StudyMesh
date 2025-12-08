"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

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

  // Load all skills from the system on mount
  useEffect(() => {
    loadAllSkills();
  }, []);

  const loadAllSkills = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("expertise_skills, growth_skills");

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
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-1.5 text-[10px] uppercase tracking-wider text-gray-400 font-medium border-b bg-gray-50">
              Existing skills in your team
            </div>
            {suggestions.map((skill, index) => (
              <button
                key={skill}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-ctp-peach/10 transition-colors ${
                  index === selectedIndex
                    ? type === "expertise"
                      ? "bg-ctp-peach/10 text-ctp-peach"
                      : "bg-ctp-green/10 text-ctp-green"
                    : "text-gray-700"
                }`}
                onClick={() => handleSuggestionClick(skill)}
              >
                {skill}
              </button>
            ))}
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
