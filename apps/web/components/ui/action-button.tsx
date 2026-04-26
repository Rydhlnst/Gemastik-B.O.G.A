import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionVariant = "primary" | "secondary" | "danger" | "outline" | "ghost";

export function ActionButton({
  intent = "primary",
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "variant"> & {
  intent?: ActionVariant;
}) {
  const classes =
    intent === "primary"
      ? "bg-role-primary text-white hover:bg-role-primary-hover focus-visible:ring-role-primary/25"
      : intent === "secondary"
      ? "bg-role-accent text-foreground hover:bg-role-accent/80"
      : intent === "danger"
      ? "bg-status-danger text-white hover:bg-status-danger/90 focus-visible:ring-status-danger/25"
      : intent === "outline"
      ? "border border-border bg-surface hover:bg-surface-raised"
      : "hover:bg-surface-raised";

  return (
    <Button
      variant="default"
      {...props}
      className={cn(
        "rounded-full transition-colors duration-200",
        classes,
        className
      )}
    />
  );
}
