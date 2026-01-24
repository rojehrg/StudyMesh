import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const skeletonVariants = cva(
  "rounded-md bg-muted",
  {
    variants: {
      variant: {
        default: "animate-pulse",
        text: "animate-pulse h-4 w-full",
        avatar: "animate-pulse rounded-full aspect-square",
        card: "animate-pulse rounded-xl",
        button: "animate-pulse rounded-md h-10",
      },
      animation: {
        pulse: "animate-pulse",
        shimmer: "skeleton-shimmer",
        none: "",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
        full: "w-full",
      },
    },
    compoundVariants: [
      // Text sizes
      { variant: "text", size: "sm", className: "h-3" },
      { variant: "text", size: "md", className: "h-4" },
      { variant: "text", size: "lg", className: "h-5" },
      // Avatar sizes
      { variant: "avatar", size: "sm", className: "w-8 h-8" },
      { variant: "avatar", size: "md", className: "w-10 h-10" },
      { variant: "avatar", size: "lg", className: "w-12 h-12" },
      // Button sizes
      { variant: "button", size: "sm", className: "h-8 w-16" },
      { variant: "button", size: "md", className: "h-10 w-24" },
      { variant: "button", size: "lg", className: "h-12 w-32" },
      // Card sizes
      { variant: "card", size: "sm", className: "h-24" },
      { variant: "card", size: "md", className: "h-32" },
      { variant: "card", size: "lg", className: "h-48" },
    ],
    defaultVariants: {
      variant: "default",
      animation: "pulse",
      size: "md",
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Enable shimmer effect overlay */
  shimmer?: boolean
}

function Skeleton({
  className,
  variant,
  animation,
  size,
  shimmer = false,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        skeletonVariants({ variant, animation: shimmer ? "shimmer" : animation, size }),
        // Dark mode support - slightly lighter muted color
        "dark:bg-muted/80",
        className
      )}
      {...props}
    />
  )
}

// Convenience components for common use cases
function TextSkeleton({
  lines = 1,
  className,
  lastLineWidth = "75%",
  ...props
}: SkeletonProps & {
  lines?: number
  lastLineWidth?: string
}) {
  if (lines === 1) {
    return <Skeleton variant="text" className={className} {...props} />
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          style={i === lines - 1 ? { width: lastLineWidth } : undefined}
          {...props}
        />
      ))}
    </div>
  )
}

function AvatarSkeleton({ className, size = "md", ...props }: SkeletonProps) {
  return <Skeleton variant="avatar" size={size} className={className} {...props} />
}

function CardSkeleton({ className, size = "md", ...props }: SkeletonProps) {
  return <Skeleton variant="card" size={size} className={cn("w-full", className)} {...props} />
}

function ButtonSkeleton({ className, size = "md", ...props }: SkeletonProps) {
  return <Skeleton variant="button" size={size} className={className} {...props} />
}

export {
  Skeleton,
  TextSkeleton,
  AvatarSkeleton,
  CardSkeleton,
  ButtonSkeleton,
  skeletonVariants
}
