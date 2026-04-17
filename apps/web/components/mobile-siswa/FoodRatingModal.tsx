"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Send } from "lucide-react";
import { useState, useEffect } from "react";

interface FoodRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RATING_DATA = [
  {
    label: "Very bad",
    emoji: "☹️",
    color: "bg-[#FFD1D1]", // Soft Pink/Red
    accent: "bg-[#FF4D4D]",
    textColor: "text-[#B30000]",
    description: "Sangat buruk",
  },
  {
    label: "Bad",
    emoji: "😕",
    color: "bg-[#EBD9FF]", // Soft Purple/Lavender
    accent: "bg-[#A855F7]",
    textColor: "text-[#6B21A8]",
    description: "Buruk",
  },
  {
    label: "Very Good",
    emoji: "😊",
    color: "bg-[#D1F7FF]", // Soft Teal/Cyan
    accent: "bg-[#06B6D4]",
    textColor: "text-[#164E63]",
    description: "Sangat baik",
  },
  {
    label: "Excellent",
    emoji: "🤩",
    color: "bg-[#D1FFD6]", // Soft Light Green
    accent: "bg-[#22C55E]",
    textColor: "text-[#14532D]",
    description: "Sangat luar biasa",
  },
];

export const FoodRatingModal = ({ isOpen, onClose }: FoodRatingModalProps) => {
  const [rating, setRating] = useState(2); // Default to Very Good
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState("");

  const currentData = RATING_DATA[rating];

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] md:hidden"
        >
          {/* Animated Background Overlay */}
          <motion.div 
            animate={{ backgroundColor: rating === 0 ? "#FFD1D1" : rating === 1 ? "#EBD9FF" : rating === 2 ? "#D1F7FF" : "#D1FFD6" }}
            className="absolute inset-0 transition-colors duration-500"
          />
          
          {/* Subtle Stripes Background Effect */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 100%' }} 
          />

          <div className="relative h-full flex flex-col p-6">
            {/* Header */}
            <header className="flex items-center gap-4 mb-12">
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-black uppercase tracking-widest text-slate-600/60">Rating Makanan</span>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.h2 
                key={`title-${rating}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-black text-slate-900 tracking-tight mb-16 px-4"
              >
                How was your experience?
              </motion.h2>

              <div className="relative w-full flex flex-col items-center mb-20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={rating}
                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 1.5, opacity: 0, rotate: 10 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="text-[120px] leading-none mb-4 drop-shadow-2xl"
                  >
                    {currentData.emoji}
                  </motion.div>
                </AnimatePresence>
                
                <motion.div
                  key={`label-${rating}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-2xl font-black ${currentData.textColor} tracking-tight`}
                >
                  {currentData.label}
                </motion.div>
              </div>

              {/* Custom Slider Overlay */}
              <div className="w-full max-w-xs relative mb-12">
                <div className="absolute inset-0 flex items-center px-1">
                   <div className="w-full h-1 bg-black/5 rounded-full flex justify-between">
                     {[0, 1, 2, 3].map((i) => (
                       <div key={i} className="w-1 h-1 bg-black/10 rounded-full mt-[-1px]"></div>
                     ))}
                   </div>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="relative z-10 w-full appearance-none bg-transparent cursor-pointer h-8 accent-transparent
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-xl 
                    [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-indigo-500"
                  style={{ 
                    // @ts-ignore
                    '--thumb-color': rating === 0 ? "#FF4D4D" : rating === 1 ? "#A855F7" : rating === 2 ? "#06B6D4" : "#22C55E"
                  }}
                />
                {/* Visual Thumb Overlay */}
                <motion.div 
                   animate={{ left: `${(rating / 3) * 100}%` }}
                   className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-[6px] border-white shadow-xl pointer-events-none transition-colors duration-300 ${currentData.accent}`}
                />
              </div>

              {/* Text Area */}
              <div className="w-full">
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe in detail (optional)"
                  className="w-full bg-white/40 backdrop-blur-md rounded-2xl p-4 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none border border-white/20 focus:border-white/50 transition-all resize-none"
                  rows={2}
                />
              </div>
            </main>

            {/* Footer Action */}
            <footer className="mt-8">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#1A1C29] text-white py-5 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all overflow-hidden relative"
              >
                {isSubmitting ? (
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                     className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                   />
                ) : (
                  <>Kirim Feedback <Send className="w-4 h-4 ml-1" /></>
                )}
              </button>
            </footer>

            {/* Celebration Stars Background Decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               <motion.div 
                 animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
                 transition={{ repeat: Infinity, duration: 3 }}
                 className="absolute top-1/4 left-10 text-purple-400 text-xl"
               >✦</motion.div>
               <motion.div 
                 animate={{ y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
                 transition={{ repeat: Infinity, duration: 4, delay: 1 }}
                 className="absolute top-1/3 right-12 text-pink-400 text-lg"
               >✦</motion.div>
               <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                 transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                 className="absolute bottom-1/4 left-1/4 text-indigo-400 text-2xl"
               >✧</motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
