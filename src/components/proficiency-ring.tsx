"use client";

import { cn } from "@/lib/utils";

interface ProficiencyRingProps {
  value: number; // 0, 25, 50, 75, or 100
  onChange: (value: number) => void;
  size?: "sm" | "md";
  color?: "terra" | "sage";
}

const levels = [
  { value: 25, label: "Beginner" },
  { value: 50, label: "Intermediate" },
  { value: 75, label: "Advanced" },
  { value: 100, label: "Expert" },
];

export function ProficiencyRing({ value, onChange, size = "md", color = "terra" }: ProficiencyRingProps) {
  const currentLevel = levels.find(l => l.value === value) || levels[0];
  const ringSize = size === "sm" ? "w-12 h-12" : "w-14 h-14";
  const innerSize = size === "sm" ? "w-9 h-9" : "w-11 h-11";

  const colorClasses = color === "terra"
    ? {
        filled: "bg-terra-400",
        empty: "bg-muted",
        text: "text-terra-500 dark:text-terra-400",
        hover: "hover:bg-terra-50 dark:hover:bg-terra-900/30 hover:border-terra-200 dark:hover:border-terra-700",
        selected: "bg-terra-50 dark:bg-terra-900/30 border-terra-300 dark:border-terra-600",
      }
    : {
        filled: "bg-sage-400",
        empty: "bg-muted",
        text: "text-sage-600 dark:text-sage-400",
        hover: "hover:bg-sage-50 dark:hover:bg-sage-900/30 hover:border-sage-200 dark:hover:border-sage-700",
        selected: "bg-sage-50 dark:bg-sage-900/30 border-sage-300 dark:border-sage-600",
      };

  // Calculate which quadrants are filled (going clockwise from top-right)
  const filledQuadrants = Math.round(value / 25);

  return (
    <div className="flex items-center gap-3">
      {/* Ring Visualization */}
      <div className={cn("relative rounded-full p-0.5", ringSize)}>
        {/* Quadrants - using CSS clip-path for clean separation */}
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {[0, 1, 2, 3].map((quadrant) => {
            const startAngle = quadrant * 90;
            const endAngle = startAngle + 88; // 88 degrees for small gap
            const isFilled = quadrant < filledQuadrants;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = 50 + 45 * Math.cos(startRad);
            const y1 = 50 + 45 * Math.sin(startRad);
            const x2 = 50 + 45 * Math.cos(endRad);
            const y2 = 50 + 45 * Math.sin(endRad);

            const largeArc = endAngle - startAngle > 180 ? 1 : 0;

            return (
              <path
                key={quadrant}
                d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                className={cn(
                  "transition-colors duration-200",
                  isFilled ? colorClasses.filled : colorClasses.empty
                )}
              />
            );
          })}
        </svg>

        {/* Center circle */}
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-full flex items-center justify-center",
          innerSize
        )}>
          <span className={cn("text-xs font-semibold", colorClasses.text)}>
            {filledQuadrants}/4
          </span>
        </div>
      </div>

      {/* Level Buttons */}
      <div className="flex gap-1">
        {levels.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className={cn(
              "px-2 py-1 text-xs rounded-md border transition-all",
              value === level.value
                ? colorClasses.selected + " border-current font-medium " + colorClasses.text
                : "border-border text-muted-foreground " + colorClasses.hover
            )}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Simpler display-only version for showing in cards
export function ProficiencyDisplay({ value, size = "sm", color = "terra" }: Omit<ProficiencyRingProps, "onChange">) {
  const ringSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const innerSize = size === "sm" ? "w-5 h-5" : "w-7 h-7";

  const colorClasses = color === "terra"
    ? { filled: "bg-terra-400", empty: "bg-muted", text: "text-terra-500 dark:text-terra-400" }
    : { filled: "bg-sage-400", empty: "bg-muted", text: "text-sage-600 dark:text-sage-400" };

  const filledQuadrants = Math.round(value / 25);

  return (
    <div className={cn("relative rounded-full", ringSize)}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {[0, 1, 2, 3].map((quadrant) => {
          const startAngle = quadrant * 90;
          const endAngle = startAngle + 88;
          const isFilled = quadrant < filledQuadrants;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const x1 = 50 + 45 * Math.cos(startRad);
          const y1 = 50 + 45 * Math.sin(startRad);
          const x2 = 50 + 45 * Math.cos(endRad);
          const y2 = 50 + 45 * Math.sin(endRad);

          return (
            <path
              key={quadrant}
              d={`M 50 50 L ${x1} ${y1} A 45 45 0 0 1 ${x2} ${y2} Z`}
              className={isFilled ? colorClasses.filled : colorClasses.empty}
            />
          );
        })}
      </svg>
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-full",
        innerSize
      )} />
    </div>
  );
}
