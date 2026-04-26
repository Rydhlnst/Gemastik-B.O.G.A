import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase transition-colors focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-raised text-foreground hover:bg-muted/30",
        secondary:
          "border-border bg-muted/30 text-foreground hover:bg-muted/45",
        destructive:
          "border-status-danger/25 bg-status-danger-bg text-status-danger hover:bg-status-danger-bg/80",
        success:
          "border-status-success/25 bg-status-success-bg text-status-success hover:bg-status-success-bg/80",
        warning:
          "border-status-warning/25 bg-status-warning-bg text-status-warning hover:bg-status-warning-bg/80",
        info:
          "border-status-info/25 bg-status-info-bg text-status-info hover:bg-status-info-bg/80",
        pending:
          "border-status-pending/25 bg-status-pending-bg text-status-pending hover:bg-status-pending-bg/80",
        outline: "border-border bg-transparent text-foreground hover:bg-muted/20",
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
