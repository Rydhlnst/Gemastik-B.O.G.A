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
  success: "bg-emerald-100 text-emerald-600",
  warning: "bg-amber-100 text-amber-600",
  info: "bg-indigo-100 text-indigo-600",
  refund: "bg-rose-100 text-rose-600",
};

const dotMap: Record<FeedItemType, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  info: "bg-indigo-400",
  refund: "bg-rose-500",
};

interface ActivityFeedProps {
  items: FeedItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Log Aktivitas</h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              Stream real-time sistem
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
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
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
            <Inbox className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-bold text-gray-400">
            Belum ada aktivitas hari ini
          </p>
          <p className="text-[10px] text-gray-300 font-medium mt-1">
            Aktivitas sistem akan muncul di sini secara real-time
          </p>
        </motion.div>
      )}

      {/* Feed Items */}
      {items.length > 0 && (
        <div className="divide-y divide-gray-50">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/60 transition-all text-left group"
              >
                {/* Type Icon */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[item.type]}`}
                >
                  {iconMap[item.type]}
                </div>

                {/* Dot */}
                <div
                  className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${dotMap[item.type]}`}
                />

                {/* Message */}
                <p className="flex-1 text-[11px] font-semibold text-gray-700 leading-snug group-hover:text-gray-900 transition-colors">
                  {item.message}
                </p>

                {/* Time */}
                <span className="flex-shrink-0 text-[9px] font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  {item.time}
                </span>

                {/* Arrow indicator */}
                <div className="flex-shrink-0 w-5 h-5 rounded-lg flex items-center justify-center text-gray-200 group-hover:text-indigo-400 group-hover:bg-indigo-50 transition-all">
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
