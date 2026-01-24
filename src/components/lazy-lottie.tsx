"use client";

import dynamic from "next/dynamic";
import { ComponentType, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Lottie animation props interface
 */
interface LottieAnimationProps {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Loading skeleton for Lottie animations
 */
function LottieSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="w-full h-full rounded-lg" />
    </div>
  );
}

/**
 * Dynamically imported Lottie component
 * Reduces initial bundle size by lazy-loading lottie-react
 */
const DynamicLottie = dynamic(
  () => import("lottie-react").then((mod) => mod.default as ComponentType<LottieAnimationProps>),
  {
    ssr: false,
    loading: () => <LottieSkeleton className="w-full h-full" />,
  }
);

/**
 * Lazy-loaded Lottie animation component
 * Use this instead of directly importing lottie-react for better performance
 *
 * @example
 * ```tsx
 * import { LazyLottie } from "@/components/lazy-lottie";
 * import animationData from "@/public/animation.json";
 *
 * <LazyLottie
 *   animationData={animationData}
 *   loop={true}
 *   className="w-24 h-24"
 * />
 * ```
 */
export function LazyLottie({
  animationData,
  loop = true,
  autoplay = true,
  className,
  style,
}: LottieAnimationProps) {
  return (
    <Suspense fallback={<LottieSkeleton className={className} />}>
      <DynamicLottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        className={className}
        style={style}
      />
    </Suspense>
  );
}

/**
 * Pre-configured lazy Lottie loader for the loading animation
 * Used in PageLoader and other loading states
 */
export function LazyLottieLoader({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <div className={`${sizeClasses[size]} ${className || ""}`}>
      <Suspense fallback={<Skeleton className="w-full h-full rounded-full" />}>
        <DynamicLottieLoader />
      </Suspense>
    </div>
  );
}

/**
 * Internal component that loads the loading animation
 */
const DynamicLottieLoader = dynamic(
  () =>
    import("lottie-react").then((mod) => {
      const Lottie = mod.default;
      // Return a component that uses the loading animation
      return function LoadingLottie() {
        // Dynamically import the animation data
        const loadingAnimation = require("../../public/loading.json");
        return (
          <Lottie
            animationData={loadingAnimation}
            loop={true}
            autoplay={true}
            style={{ width: "100%", height: "100%" }}
          />
        );
      };
    }),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full rounded-full" />,
  }
);
