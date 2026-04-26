"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";
import { useState } from "react";

interface InteractiveRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveRatingModal = ({ isOpen, onClose }: InteractiveRatingModalProps) => {
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);

  const emojis = [
    { id: 1, e: "😡", label: "Buruk" },
    { id: 2, e: "😐", label: "Biasa" },
    { id: 3, e: "😋", label: "Enak" },
    { id: 4, e: "🤩", label: "Mantap!" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] md:hidden"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 w-full bg-white rounded-t-[2.5rem] p-6 pb-12 z-[80] md:hidden shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            
            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-amber-500" fill="currentColor" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Beri Nilai Vendor</h3>
              <p className="text-sm font-medium text-slate-500">Gimana rasa makanan hari ini?</p>
            </div>

            <div className="flex justify-between gap-2 mb-8">
               {emojis.map((item) => (
                 <button 
                   key={item.id}
                   onClick={() => setSelectedEmoji(item.id)}
                   className={`flex-1 aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all ${
                     selectedEmoji === item.id 
                     ? 'bg-amber-100 border-2 border-amber-400 scale-110 shadow-lg shadow-amber-200' 
                     : 'bg-slate-50 border-2 border-transparent grayscale hover:grayscale-0'
                   }`}
                 >
                    <span className="text-4xl">{item.e}</span>
                    <span className={`text-[10px] font-black ${selectedEmoji === item.id ? 'text-amber-700' : 'text-slate-400'}`}>
                      {item.label}
                    </span>
                 </button>
               ))}
            </div>

            <button 
               onClick={onClose}
               disabled={!selectedEmoji}
               className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
                 selectedEmoji 
                 ? 'bg-[#1A1C29] text-white shadow-xl active:scale-95' 
                 : 'bg-slate-100 text-slate-400 cursor-not-allowed'
               }`}
            >
              Kirim Penilaian
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
