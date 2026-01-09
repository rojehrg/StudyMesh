import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-coffee-foam bg-white px-3 py-2 text-base text-coffee-espresso ring-offset-background placeholder:text-coffee-latte focus-visible:outline-none focus-visible:border-coffee-mocha focus-visible:ring-1 focus-visible:ring-coffee-mocha/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
