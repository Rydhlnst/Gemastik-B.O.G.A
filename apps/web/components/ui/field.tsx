import * as React from "react"
import { cn } from "@/lib/utils"

export function FieldLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("cursor-pointer block", className)} {...props} />
}

export function Field({ className, orientation = "vertical", ...props }: React.HTMLAttributes<HTMLDivElement> & { orientation?: "vertical" | "horizontal" }) {
  return (
    <div
      className={cn(
        "flex w-full rounded-lg border border-gray-200 bg-white/80 p-3 shadow-sm transition-all hover:bg-white hover:border-gray-300 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 hover:-translate-y-0.5",
        orientation === "horizontal" ? "flex-row items-center justify-between" : "flex-col",
        className
      )}
      {...props}
    />
  )
}

export function FieldContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-0.5", className)} {...props} />
}

export function FieldTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <div className={cn("font-bold text-sm text-gray-900", className)} {...props} />
}

export function FieldDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn("text-xs text-gray-500", className)} {...props} />
}
