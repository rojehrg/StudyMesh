"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getTimezoneAbbrev,
  findOptimalDeadline,
} from "@/lib/availability";
import {
  getSuggestedDeadlines,
  formatRelativeTimezone,
  isInWorkingHours,
  isInSleepWindow,
  formatTimeInTimezone,
} from "@/lib/timezone-utils";

interface SmartDeadlinePickerProps {
  ownerTimezone: string;
  requesterTimezone: string;
  onSelect: (deadline: Date) => void;
  selectedDeadline?: Date;
  className?: string;
}

interface DeadlineOption {
  label: string;
  date: Date;
  ownerTime: string;
  requesterTime: string;
  isRecommended?: boolean;
  warning?: string;
}

/**
 * Smart deadline picker that suggests times based on timezone awareness
 * Considers:
 * - Owner's working hours
 * - 8-hour sleep buffer
 * - Requester's expectations
 */
export function SmartDeadlinePicker({
  ownerTimezone,
  requesterTimezone,
  onSelect,
  selectedDeadline,
  className,
}: SmartDeadlinePickerProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customHours, setCustomHours] = useState<number>(24);

  const ownerTzAbbrev = getTimezoneAbbrev(ownerTimezone);
  const requesterTzAbbrev = getTimezoneAbbrev(requesterTimezone);
  const relativeTz = formatRelativeTimezone(requesterTimezone, ownerTimezone);

  // Generate suggested deadlines
  const suggestions = useMemo(() => {
    const baseSuggestions = getSuggestedDeadlines(
      ownerTimezone,
      requesterTimezone,
      getTimezoneAbbrev
    );

    // Add warnings for potentially problematic times
    return baseSuggestions.map((suggestion): DeadlineOption => {
      let warning: string | undefined;

      // Check if deadline falls in owner's sleep window
      const deadlineHour = new Date(
        suggestion.date.toLocaleString("en-US", { timeZone: ownerTimezone })
      ).getHours();

      if (isInSleepWindow(ownerTimezone)) {
        warning = "Owner may be sleeping";
      }

      // Mark "End of their day" as recommended if owner is currently working
      const isRecommended =
        suggestion.label === "End of their day" && isInWorkingHours(ownerTimezone);

      return {
        ...suggestion,
        isRecommended,
        warning,
      };
    });
  }, [ownerTimezone, requesterTimezone]);

  // Generate custom deadline
  const customDeadline = useMemo(() => {
    if (!customMode) return null;

    const optimal = findOptimalDeadline(
      ownerTimezone,
      requesterTimezone,
      customHours
    );

    return {
      label: `In ${customHours} hours (adjusted)`,
      date: optimal.deadline,
      ownerTime: optimal.ownerLocalTime,
      requesterTime: optimal.requesterLocalTime,
      reasoning: optimal.reasoning,
    };
  }, [customMode, customHours, ownerTimezone, requesterTimezone]);

  const handleSelect = useCallback(
    (date: Date) => {
      onSelect(date);
    },
    [onSelect]
  );

  const isSelected = (date: Date) => {
    if (!selectedDeadline) return false;
    return Math.abs(date.getTime() - selectedDeadline.getTime()) < 60000; // Within 1 minute
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Timezone context header */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-coffee-cortado">
          <span className="font-medium">Owner:</span> {ownerTzAbbrev}
        </div>
        <div className="text-coffee-latte text-xs">{relativeTz}</div>
        <div className="text-coffee-cortado">
          <span className="font-medium">You:</span> {requesterTzAbbrev}
        </div>
      </div>

      {/* Quick options */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-coffee-mocha uppercase tracking-wide">
          Suggested deadlines
        </p>
        <div className="grid gap-2">
          {suggestions.map((option, index) => (
            <DeadlineOptionCard
              key={index}
              option={option}
              isSelected={isSelected(option.date)}
              onClick={() => handleSelect(option.date)}
            />
          ))}
        </div>
      </div>

      {/* Custom deadline section */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setCustomMode(!customMode)}
          className="text-xs font-medium text-coffee-mocha uppercase tracking-wide hover:text-coffee-espresso transition-colors"
        >
          {customMode ? "Hide custom" : "Custom deadline"}
        </button>

        {customMode && (
          <Card className="p-4 space-y-3 bg-coffee-cream/50">
            <div className="flex items-center gap-3">
              <label className="text-sm text-coffee-cortado">
                Hours from now:
              </label>
              <input
                type="number"
                min={1}
                max={168}
                value={customHours}
                onChange={(e) => setCustomHours(parseInt(e.target.value) || 24)}
                className="w-20 px-2 py-1 text-sm border border-coffee-foam rounded bg-white text-coffee-espresso focus:outline-none focus:ring-1 focus:ring-coffee-mocha"
              />
            </div>

            {customDeadline && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-cortado">
                    Owner: {customDeadline.ownerTime}
                  </span>
                  <span className="text-coffee-cortado">
                    You: {customDeadline.requesterTime}
                  </span>
                </div>
                <p className="text-xs text-coffee-latte">
                  {customDeadline.reasoning}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelect(customDeadline.date)}
                  className={cn(
                    "w-full",
                    isSelected(customDeadline.date) &&
                      "ring-2 ring-coffee-mocha bg-coffee-cream"
                  )}
                >
                  Select this deadline
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Current selection display */}
      {selectedDeadline && (
        <div className="pt-2 border-t border-coffee-foam">
          <p className="text-xs text-coffee-latte mb-1">Selected deadline:</p>
          <div className="flex justify-between text-sm">
            <span className="text-coffee-espresso font-medium">
              {formatTimeInTimezone(selectedDeadline, ownerTimezone, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
                timeZone: ownerTimezone,
              })}{" "}
              ({ownerTzAbbrev})
            </span>
            <span className="text-coffee-cortado">
              {formatTimeInTimezone(selectedDeadline, requesterTimezone, {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
                timeZone: requesterTimezone,
              })}{" "}
              ({requesterTzAbbrev})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual deadline option card
 */
interface DeadlineOptionCardProps {
  option: DeadlineOption;
  isSelected: boolean;
  onClick: () => void;
}

function DeadlineOptionCard({
  option,
  isSelected,
  onClick,
}: DeadlineOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full p-3 text-left rounded-lg border transition-all",
        "hover:border-coffee-mocha hover:bg-coffee-cream/30",
        isSelected
          ? "border-coffee-mocha bg-coffee-cream/50 ring-1 ring-coffee-mocha"
          : "border-coffee-foam bg-white",
        option.isRecommended && !isSelected && "border-coffee-steamed"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-coffee-espresso">
              {option.label}
            </span>
            {option.isRecommended && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-coffee-steamed text-coffee-mocha">
                Recommended
              </span>
            )}
          </div>
          {option.warning && (
            <p className="text-xs text-coffee-latte">{option.warning}</p>
          )}
        </div>
        {isSelected && (
          <span className="text-xs text-coffee-mocha font-medium">Selected</span>
        )}
      </div>

      <div className="flex justify-between mt-2 text-xs">
        <span className="text-coffee-cortado">{option.ownerTime}</span>
        <span className="text-coffee-latte">{option.requesterTime}</span>
      </div>
    </button>
  );
}

/**
 * Compact version for inline use
 */
interface SmartDeadlinePickerCompactProps {
  ownerTimezone: string;
  requesterTimezone: string;
  onSelect: (deadline: Date) => void;
  className?: string;
}

export function SmartDeadlinePickerCompact({
  ownerTimezone,
  requesterTimezone,
  onSelect,
  className,
}: SmartDeadlinePickerCompactProps) {
  const suggestions = useMemo(() => {
    return getSuggestedDeadlines(
      ownerTimezone,
      requesterTimezone,
      getTimezoneAbbrev
    ).slice(0, 3);
  }, [ownerTimezone, requesterTimezone]);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSelect(suggestion.date)}
          className="text-xs"
        >
          {suggestion.label}
        </Button>
      ))}
    </div>
  );
}
