"use client"

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-4 w-4 text-ctp-green" />,
        info: <Info className="h-4 w-4 text-ctp-blue" />,
        warning: <TriangleAlert className="h-4 w-4 text-ctp-yellow" />,
        error: <OctagonX className="h-4 w-4 text-ctp-red" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin text-ctp-peach" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl",
          title: "group-[.toast]:text-foreground group-[.toast]:font-semibold",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-ctp-peach group-[.toast]:text-white group-[.toast]:rounded-lg",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg",
          success: "group-[.toaster]:border-ctp-green/30",
          error: "group-[.toaster]:border-ctp-red/30",
          warning: "group-[.toaster]:border-ctp-yellow/30",
          info: "group-[.toaster]:border-ctp-blue/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
