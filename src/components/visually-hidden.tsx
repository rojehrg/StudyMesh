"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * VisuallyHidden component for screen reader text
 *
 * Renders content that is visually hidden but accessible to screen readers.
 * Use for icon-only buttons, interactive elements that need labels,
 * or any element that needs additional context for assistive technologies.
 *
 * @example
 * // Icon-only button with accessible label
 * <button>
 *   <TrashIcon aria-hidden="true" />
 *   <VisuallyHidden>Delete item</VisuallyHidden>
 * </button>
 *
 * @example
 * // With asChild to render as a different element
 * <VisuallyHidden asChild>
 *   <label htmlFor="search">Search</label>
 * </VisuallyHidden>
 */

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * When true, renders children directly without a wrapper span,
   * merging props with the child element.
   */
  asChild?: boolean;
  children: React.ReactNode;
}

const visuallyHiddenStyles: React.CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export function VisuallyHidden({
  asChild = false,
  children,
  className,
  style,
  ...props
}: VisuallyHiddenProps) {
  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as { className?: string; style?: React.CSSProperties };
    return React.cloneElement(children, {
      ...props,
      className: cn(childProps.className, className),
      style: { ...visuallyHiddenStyles, ...childProps.style, ...style },
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <span
      className={className}
      style={{ ...visuallyHiddenStyles, ...style }}
      {...props}
    >
      {children}
    </span>
  );
}

VisuallyHidden.displayName = "VisuallyHidden";

export default VisuallyHidden;
