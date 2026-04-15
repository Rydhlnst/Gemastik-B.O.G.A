"use client"

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

type ExpandingSearchDockProps = {
  onSearch?: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
};

export function ExpandingSearchDock({
  onSearch,
  placeholder = "Search...",
  initialValue = "",
}: ExpandingSearchDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState(initialValue);

  // Sync with external state if needed
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setQuery("");
    if (onSearch) onSearch("");
  };

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (onSearch) onSearch(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!isExpanded && !query ? (
          <motion.button
            key="icon"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleExpand}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50 text-gray-500"
          >
            <Search className="h-4 w-4" />
          </motion.button>
        ) : (
          <motion.form
            key="input"
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: isExpanded ? 280 : 200, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            onSubmit={handleSubmit}
            className="relative"
          >
            <motion.div
              initial={{ backdropFilter: "blur(0px)" }}
              animate={{ backdropFilter: "blur(12px)" }}
              className="relative flex items-center gap-2 overflow-hidden rounded-full border border-gray-200 bg-white/80 shadow-sm backdrop-blur-md"
            >
              <div className="ml-3">
                <Search className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={placeholder}
                autoFocus
                className="h-10 flex-1 bg-transparent pr-4 text-xs outline-none placeholder:text-gray-400 font-medium"
              />
              <motion.button
                type="button"
                onClick={handleCollapse}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="mr-1.5 flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
