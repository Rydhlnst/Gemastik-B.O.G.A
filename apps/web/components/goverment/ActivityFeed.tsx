"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  AlertCircle,
  RotateCcw,
  FileText,
  Inbox,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";

export type FeedItemType = "success" | "warning" | "info" | "refund";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  message: string;
  time: string;
  href: string;
}

const iconMap: Record<FeedItemType, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4" />,
  warning: <AlertCircle className="w-4 h-4" />,
  info: <FileText className="w-4 h-4" />,
  refund: <RotateCcw className="w-4 h-4" />,
};

const colorMap: Record<FeedItemType, string> = {
  success: "bg-status-success-bg text-status-success",
  warning: "bg-status-warning-bg text-status-warning",
  info: "bg-status-info-bg text-status-info",
  refund: "bg-status-danger-bg text-status-danger",
};

const dotMap: Record<FeedItemType, string> = {
  success: "bg-status-success",
  warning: "bg-status-warning",
  info: "bg-status-info",
  refund: "bg-status-danger",
};

interface ActivityFeedProps {
  items: FeedItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  const router = useRouter();

  return (
    <div className="bg-surface rounded-[var(--radius-xl)] border border-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-role-primary flex items-center justify-center text-white shadow-card">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Log Aktivitas</h2>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">
              Stream real-time sistem
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-role-surface rounded-full border border-border">
          <div className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
          <span className="text-xs font-semibold text-role-primary uppercase tracking-wider">
            Live
          </span>
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-surface-raised border border-border flex items-center justify-center mb-4">
            <Inbox className="w-7 h-7 text-muted" />
          </div>
          <p className="text-sm font-semibold text-muted">
            Belum ada aktivitas hari ini
          </p>
          <p className="text-xs text-muted font-medium mt-1">
            Aktivitas sistem akan muncul di sini secara real-time
          </p>
        </motion.div>
      )}

      {/* Feed Items */}
      {items.length > 0 && (
        <div className="divide-y divide-border">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-muted-bg/60 transition-colors text-left group"
              >
                {/* Type Icon */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center ${colorMap[item.type]}`}
                >
                  {iconMap[item.type]}
                </div>

                {/* Dot */}
                <div
                  className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${dotMap[item.type]}`}
                />

                {/* Message */}
                <p className="flex-1 text-sm font-medium text-foreground leading-snug">
                  {item.message}
                </p>

                {/* Time */}
                <span className="flex-shrink-0 text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">
                  {item.time}
                </span>

                {/* Arrow indicator */}
                <div className="flex-shrink-0 w-5 h-5 rounded-[var(--radius-sm)] flex items-center justify-center text-muted/50 group-hover:text-role-primary group-hover:bg-role-accent transition-colors">
                  <svg
                    width="10"
                    height="10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
