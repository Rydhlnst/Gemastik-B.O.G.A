import * as React from "react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";

type DashboardShellProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function DashboardShell({
  title,
  description,
  badge,
  actions,
  children,
  className,
}: DashboardShellProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-8",
        className
      )}
    >
      {(title || description || badge || actions) && (
        <div className="mb-6 border-b border-border pb-5">
          {badge ? <div className="mb-2 w-fit">{badge}</div> : null}
          <PageHeader title={title} subtitle={description} actions={actions} />
        </div>
      )}

      {children}
    </main>
  );
}
