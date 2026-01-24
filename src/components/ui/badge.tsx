import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-oat focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-coffee-mocha text-coffee-paper hover:bg-coffee-roast",
        secondary:
          "bg-coffee-foam text-coffee-mocha hover:bg-coffee-cream",
        destructive:
          "bg-coffee-roast text-coffee-paper hover:bg-coffee-espresso",
        outline: "text-foreground shadow-none border border-coffee-foam",
        // Coffee palette variants for role badges
        owner: "bg-coffee-steamed text-coffee-roast border-coffee-latte hover:bg-coffee-steamed",
        admin: "bg-coffee-foam text-coffee-mocha border-coffee-latte hover:bg-coffee-foam",
        member: "bg-coffee-cream text-coffee-cortado border-coffee-foam hover:bg-coffee-cream",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
