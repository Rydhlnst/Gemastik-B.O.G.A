"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Utensils,
  Box,
  Droplets,
  ArrowRight,
  ShieldCheck,
  Zap,
  Truck,
  ThumbsUp,
  Flame,
  LineChart,
  BarChart3,
  Check,
  FileSearch,
  ClipboardList
} from "lucide-react";
import { DownloadProgressModal } from "./DownloadProgressModal";
import {
  vendorList,
  sppgList,
  getReviewsByVendor,
  getVendorPerformanceStats,
  getSPPGPerformanceStats,
  getSPPGStudentSentiment,
  type VendorReview,
  type SPPGStudentSentiment
} from "@/lib/mbgdummydata";

interface DashboardProps {
  type: "vendor" | "sppg";
  entityId: number;
}

export default function EntityPerformanceDashboard({ type, entityId }: DashboardProps) {
  const [filter, setFilter] = useState<"all" | "negative">("all");
  const [followedUp, setFollowedUp] = useState<Record<number, boolean>>({});
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditRating, setAuditRating] = useState<Record<string, number>>({});
  const [auditSubmitted, setAuditSubmitted] = useState(false);
  const [downloadModal, setDownloadModal] = useState({ isOpen: false, fileName: "" });
  const [logSubmitted, setLogSubmitted] = useState(false);

  const handleDownload = (fileName: string) => {
    setDownloadModal({ isOpen: true, fileName });
  };

  const handleLogAudit = () => {
    setLogSubmitted(true);
    setTimeout(() => setLogSubmitted(false), 3000);
  };

  const entity = useMemo(() => {
    return type === "vendor"
      ? vendorList.find((v) => v.id === entityId)
      : sppgList.find((s) => s.id === entityId);
  }, [type, entityId]);

  const stats = useMemo(() => {
    return type === "vendor"
      ? getVendorPerformanceStats(entityId)
      : getSPPGPerformanceStats(entityId);
  }, [type, entityId]);

  const studentSentiment = useMemo(() => {
    return type === "sppg" ? getSPPGStudentSentiment(entityId) : null;
  }, [type, entityId]);

  const allReviews = useMemo(() => {
    if (type === "vendor") return getReviewsByVendor(entityId);
    
    // For SPPG, get reviews for the vendor it manages
    const sppg = sppgList.find(s => s.id === entityId);
    if (!sppg) return [];
    return getReviewsByVendor(sppg.vendor_id);
  }, [type, entityId]);

  const toggleFollowUp = (id: number) => {
    setFollowedUp(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getPredicate = (score: number) => {
    if (score >= 4.5) return { text: "Luar Biasa (Excellent)", color: "text-emerald-500", bg: "bg-emerald-50" };
    if (score >= 4.0) return { text: "Sangat Baik (Very Good)", color: "text-blue-500", bg: "bg-blue-50" };
    if (score >= 3.0) return { text: "Baik / Cukup (Good/Fair)", color: "text-amber-500", bg: "bg-amber-50" };
    return { text: "Perlu Evaluasi (Poor)", color: "text-rose-500", bg: "bg-rose-50" };
  };

  const predicate = useMemo(() => getPredicate(stats?.avgRating ?? 0), [stats?.avgRating]);

  const negativeKeywords = ["basi", "lambat", "sedikit", "keras", "dingin", "kotor", "bau"];
  const isNegative = (comment: string) => {
    const lower = comment.toLowerCase();
    return negativeKeywords.some(keyword => lower.includes(keyword));
  };

  const filteredReviews = useMemo(() => {
    if (filter === "negative") {
      return allReviews.filter(r => isNegative(r.comment) || r.rating <= 2);
    }
    return allReviews;
  }, [allReviews, filter]);

  const handleAuditSubmit = () => {
    setAuditSubmitted(true);
    setTimeout(() => {
      setAuditSubmitted(false);
      setIsAuditing(false);
    }, 2000);
  };

  if (!entity || !stats) return null;

  const isSPPG = type === "sppg";

  if (isSPPG) {
    return (
      <div className="w-full space-y-4 mt-8 pb-12 font-sans">
        {/* Layer 1: Alert / Status (Urgency first) */}
        <div className="bg-rose-50 border border-rose-200 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
           <div className="flex items-start gap-4">
             <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5" />
             <div>
               <h3 className="text-sm font-bold text-rose-900 leading-tight">Audit Lapangan Diperlukan (Batas 24 Jam)</h3>
               <p className="text-sm text-rose-800 mt-1">Sentimen siswa menunjukkan penurunan kepuasan rasa. Lakukan audit batch masakan di unit ini dalam 24 jam ke depan.</p>
             </div>
           </div>
           <button 
             onClick={() => setIsAuditing(!isAuditing)}
             className="shrink-0 px-6 py-3 bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-black uppercase tracking-widest transition-colors shadow-sm"
           >
             {isAuditing ? "Tutup Form" : "Lakukan Audit Fisik"}
           </button>
        </div>

        {/* Layer 1.5: Audit Form Toggle */}
        {isAuditing && (
           <div className="p-6 border border-slate-200 rounded-xl bg-white space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                 <div>
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Formulir Audit Resmi</h3>
                   <p className="text-xs text-slate-500 mt-1">Masukkan hasil inspeksi lapangan Anda hari ini.</p>
                 </div>
              </div>

              {auditSubmitted ? (
                 <div className="flex flex-col items-center justify-center py-8">
                   <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
                   <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Audit Berhasil Terkirim</h4>
                   <p className="text-xs text-slate-500 mt-1">Skor resmi unit akan diperbarui secara real-time.</p>
                 </div>
              ) : (
                 <div className="space-y-6">
                   {[
                      { key: "higienitas", label: "Higienitas" },
                      { key: "kapasitas", label: "Kapasitas" },
                      { key: "sanitasi", label: "Sanitasi" },
                      { key: "waktu", label: "Penyajian Tepat Waktu" },
                      { key: "akurasi", label: "Akurasi Pesanan" },
                   ].map((item) => (
                      <div key={item.key} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{item.label}</span>
                         <div className="flex gap-2">
                           {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setAuditRating(prev => ({ ...prev, [item.key]: star }))}
                                className={`w-10 h-10 border rounded-lg flex items-center justify-center text-sm transition-colors ${(auditRating[item.key] || 0) >= star
                                    ? "bg-slate-800 border-slate-800 text-white"
                                    : "bg-white border-slate-200 text-slate-300 hover:bg-slate-50"
                                  }`}
                              >
                                ★
                              </button>
                           ))}
                         </div>
                      </div>
                   ))}
                   
                   <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={handleAuditSubmit}
                        disabled={Object.keys(auditRating).length < 5}
                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-colors"
                      >
                        Kirim Hasil Audit
                      </button>
                   </div>
                 </div>
              )}
           </div>
        )}

        {/* Layer 1.8: Trending Student Sentiments (Most frequent issues at the top as requested) */}
        {studentSentiment && studentSentiment.trendingKeywords.length > 0 && (
           <div className="p-5 border border-slate-200 rounded-xl bg-white">
              <div className="flex items-center gap-2 mb-4">
                 <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Sentimen Trending Siswa</span>
              </div>
              <div className="flex flex-wrap gap-2">
                 {studentSentiment.trendingKeywords.map((tag, idx) => (
                    <div 
                      key={tag.word}
                      className={`px-4 py-2 rounded-lg border flex items-center gap-3 transition-all ${
                        tag.sentiment === "positive" 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                          : tag.sentiment === "negative" 
                            ? "bg-rose-50 border-rose-100 text-rose-700 font-bold" 
                            : "bg-slate-50 border-slate-100 text-slate-600"
                      }`}
                    >
                       <span className="text-xs">{tag.word}</span>
                       <span className="text-[10px] font-black opacity-30">{tag.count} Laporan</span>
                       {tag.sentiment === "negative" && idx === 0 && (
                          <span className="animate-pulse bg-rose-500 w-1.5 h-1.5 rounded-full" />
                       )}
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* Layer 2: Skor ringkasan dengan tren & Layer 3: Distribusi detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
           <div className="p-5 border border-slate-200 rounded-xl bg-white flex flex-col justify-center">
              <p className="text-[11px] font-black tracking-widest text-slate-400 uppercase">Skor Kepuasan Siswa</p>
              <div className="flex items-end gap-2 mt-3">
                 <span className="text-5xl font-black text-slate-800 tracking-tighter">4.7</span>
                 <span className="text-sm font-bold text-slate-400 mb-1.5">/ 5.0</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                 <span className="text-xs font-bold text-emerald-600 flex items-center">↑ +0.3 vs bulan lalu</span>
                 <div className="flex gap-1 h-4 items-end">
                   <div className="w-1.5 h-[40%] bg-slate-200"></div>
                   <div className="w-1.5 h-[50%] bg-slate-200"></div>
                   <div className="w-1.5 h-[65%] bg-slate-200"></div>
                   <div className="w-1.5 h-[75%] bg-slate-200"></div>
                   <div className="w-1.5 h-[100%] bg-emerald-500"></div>
                 </div>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-4 border-t border-slate-100 pt-3">82% kepuasan net harian</p>
           </div>

           <div className="p-5 border border-slate-200 rounded-xl bg-white flex flex-col justify-center">
              <p className="text-[11px] font-black tracking-widest text-slate-400 uppercase">Skor Resmi Unit</p>
              <div className="flex items-end gap-2 mt-3">
                 <span className="text-5xl font-black text-slate-800 tracking-tighter">4.8</span>
                 <span className="text-sm font-bold text-slate-400 mb-1.5">/ 5.0</span>
              </div>
              <p className="text-xs font-bold text-slate-700 mt-3 pt-0.5">Excellent Standard Rating</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-4 border-t border-slate-100 pt-3">Berdasarkan audit kumulatif</p>
           </div>

           <div className="p-5 border border-slate-200 rounded-xl bg-white">
              <div className="flex justify-between text-[11px] font-black tracking-widest text-slate-400 uppercase mb-4">
                 <span>Distribusi Penilaian</span>
                 <span>n = 85</span>
              </div>
              <div className="space-y-2 mt-1">
                {[ 
                   {star: 5, count: 40}, {star: 4, count: 30}, 
                   {star: 3, count: 10}, {star: 2, count: 3}, {star: 1, count: 2}
                ].map((d) => (
                   <div key={d.star} className="flex items-center gap-3 text-xs">
                     <span className="w-5 font-bold text-slate-500 flex justify-between"><span>{d.star}</span><span>★</span></span>
                     <div className="flex-1 h-3 bg-slate-50 rounded-sm overflow-hidden">
                        <div className="h-full bg-slate-400" style={{width: `${(d.count/40)*100}%`}}></div>
                     </div>
                     <span className="w-6 text-right font-bold text-slate-700 tabular-nums">{d.count}</span>
                   </div>
                ))}
              </div>
           </div>
        </div>

        {/* Layer 4: Historis Jangka Panjang & Audit Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
           {[
             { label: "Higienitas", value: "4.7", trend: "↓ -0.2", isUp: false, bars: [100, 95, 90, 85, 80] },
             { label: "Kapasitas", value: "4.9", trend: "↑ +0.1", isUp: true, bars: [80, 85, 90, 95, 100] },
             { label: "Sanitasi", value: "4.8", trend: "↑ +0.5", isUp: true, bars: [60, 70, 80, 95, 100] },
             { label: "Uptime Dapur", value: "99.8%", trend: "Stabil", isUp: null, bars: [98, 99, 99.5, 99.8, 99.8] },
             { label: "Batch Error", value: "0.02%", trend: "↓ -0.01%", isUp: true, bars: [50, 40, 30, 20, 10] },
           ].map(m => (
             <div key={m.label} className="p-4 border border-slate-200 rounded-xl bg-white">
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{m.label}</p>
                <p className="text-xl font-black tracking-tight text-slate-800 mt-2">{m.value}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                   <span className={`text-[10px] font-bold tracking-tight ${m.isUp === true ? "text-emerald-600" : m.isUp === false ? "text-rose-600" : "text-slate-500"}`}>{m.trend}</span>
                   <div className="flex gap-0.5 h-3 items-end">
                     {m.bars.map((h, i) => (
                        <div key={i} className={`w-1 rounded-t-sm ${i === 4 ? (m.isUp === true ? "bg-emerald-500" : m.isUp === false ? "bg-rose-500" : "bg-slate-300") : "bg-slate-200"}`} style={{height: `${h}%`}}></div>
                     ))}
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Layer 5: Ulasan & Feedback Siswa (DAL Styled) */}
        <div className="border border-slate-200 rounded-xl bg-white flex flex-col mt-4">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Ulasan & Feedback Siswa</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Data mentah laporan rasa, porsi, dan pelayanan harian.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 border rounded-lg text-xs font-bold transition-colors ${filter === "all" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"}`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter("negative")}
                className={`px-4 py-2 border rounded-lg text-xs font-bold transition-colors ${filter === "negative" ? "bg-rose-600 text-white border-rose-600" : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"}`}
              >
                Kritis / Negatif
              </button>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto p-5 space-y-3 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review, i) => {
                  const isNeg = isNegative(review.comment) || review.rating <= 2;
                  const done = followedUp[review.id] || review.isFollowedUp;

                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`p-4 rounded-lg border flex flex-col md:flex-row gap-4 justify-between items-start ${isNeg ? "bg-rose-50/50 border-rose-200" : "bg-white border-slate-100"}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${isNeg ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"}`}>
                            {review.userName.slice(0, 1)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{review.userName}</p>
                            <p className="text-[10px] font-medium text-slate-500">Kelas {review.userClass} • {review.date}</p>
                          </div>
                          <div className="ml-auto font-black text-sm flex items-center gap-1 text-slate-700">
                             {review.rating}.0 ★
                          </div>
                        </div>
                        <p className={`text-xs font-medium leading-relaxed my-2 ${isNeg ? "text-rose-900" : "text-slate-600"}`}>
                          "{review.comment}"
                        </p>
                      </div>
                      <button
                        onClick={() => toggleFollowUp(review.id)}
                        className={`shrink-0 px-4 py-2 border rounded-md text-[10px] font-black uppercase tracking-widest transition-colors ${done
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                          }`}
                      >
                        {done ? "Tindak Lanjut ✓" : "Tandai Selesai"}
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs font-medium text-slate-400">
                  Tidak ada ulasan pada kategori ini.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // OLD VENDOR UI -------------------
  return (
    <div className="w-full space-y-8 mt-12 pb-12">
      <div className="flex items-center gap-4 mb-2">
        <div className="h-[1px] flex-1 bg-slate-100" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Detailed Performance Audit</h2>
        <div className="h-[1px] flex-1 bg-slate-100" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={`score-${type}-${entityId}`}
          className="md:col-span-4 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className={`absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 blur-3xl rounded-full -mr-16 -mt-16`} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Skor Resmi Vendor</p>
          <div className="relative">
            <span className="text-7xl font-black text-slate-900 tracking-tighter">
              {stats.avgRating.toFixed(1)}
            </span>
            <span className="text-xl font-bold text-slate-300 ml-1">/ 5.0</span>
          </div>
          <div className={`mt-4 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider ${predicate.bg} ${predicate.color}`}>
            {predicate.text}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-center"
        >
          <div className="flex items-center justify-between mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Distribusi Penilaian ({stats.total} Feedback)</p>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-slate-200" />)}
            </div>
          </div>
          <div className="space-y-4">
            {stats.distribution.map((count, i) => {
              const star = 5 - i;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5 w-12">
                    <span className="text-[11px] font-black text-slate-600">{star}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 h-2.5 bg-slate-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.2, ease: "circOut" }}
                      className={`h-full rounded-full ${star >= 4 ? "bg-indigo-500" : star >= 3 ? "bg-amber-400" : "bg-rose-400"}`}
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 w-10 text-right tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-7 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-800">Analisis Metrik Audit</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Parameter Kualitas Standar Nasional</p>
            </div>
            <div className={`p-2 rounded-xl bg-indigo-50 text-indigo-600`}>
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              {
                label: "Kualitas Rasa",
                value: stats.subAverages.rasa,
                icon: Utensils,
                color: "text-orange-500",
                bg: "bg-orange-50"
              },
              {
                label: "Porsi Makan",
                value: stats.subAverages.porsi,
                icon: Box,
                color: "text-blue-500",
                bg: "bg-blue-50"
              },
              {
                label: "Kebersihan",
                value: stats.subAverages.kebersihan,
                icon: Droplets,
                color: "text-cyan-500",
                bg: "bg-cyan-50"
              },
            ].map((m) => (
              <div key={m.label} className="flex flex-col items-center text-center group">
                <div className={`w-14 h-14 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
                  <m.icon className="w-7 h-7" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{m.label}</p>
                <p className="text-2xl font-black text-slate-800 tracking-tight">{m.value.toFixed(1)}</p>
                <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.value / 5) * 100}%` }}
                    className={`h-full ${m.color.replace('text', 'bg')}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-5 bg-slate-900 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingDown className="w-32 h-32 text-rose-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className={`flex items-center gap-2 mb-6 text-rose-400`}>
                <AlertCircle className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Status AI Insights</span>
              </div>
              <h4 className="text-white text-xl font-black leading-tight mb-4">
                {entityId === 6 ? "Intervensi Manajemen!" : "Sesuai Standar"}
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                {entityId === 6
                  ? "Banyak laporan nasi keras dan porsi tidak lengkap. Vendor ini masuk dalam daftar evaluasi kritis."
                  : "Semua indikator performa stabil. Tidak diperlukan tindakan korektif saat ini."
                }
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button
                onClick={() => handleDownload(`Rapor_Performa_${entity?.nama}_Q2_2024.pdf`)}
                className="py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white text-[9px] font-black uppercase tracking-widest transition-all"
              >
                Cetak Rapor Performa
              </button>
              <button
                onClick={handleLogAudit}
                disabled={logSubmitted}
                className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${logSubmitted
                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                    : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20"
                  }`}
              >
                {logSubmitted ? <CheckCircle2 className="w-3 h-3" /> : <ClipboardList className="w-3 h-3" />}
                {logSubmitted ? "Log Disimpan" : "Log Audit Fisik"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <DownloadProgressModal
        isOpen={downloadModal.isOpen}
        onClose={() => setDownloadModal(prev => ({ ...prev, isOpen: false }))}
        fileName={downloadModal.fileName}
      />

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h3 className="text-base font-black text-slate-800">Ulasan & Feedback Siswa</h3>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${filter === "all" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilter("negative")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${filter === "negative" ? "bg-rose-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Negatif / Kritas
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredReviews.length} Entri Terbaru</span>
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto p-4 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review, i) => {
                  const isNeg = isNegative(review.comment) || review.rating <= 2;
                  const done = followedUp[review.id] || review.isFollowedUp;

                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-6 rounded-[2rem] mb-3 border transition-all ${isNeg ? "bg-rose-50/20 border-rose-100/50" : "bg-white border-transparent hover:border-slate-100 hover:shadow-md hover:shadow-slate-100/50"
                        }`}
                    >
                      <div className="flex justify-between items-start gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className={`w-10 h-10 rounded-2xl ${isNeg ? "bg-rose-100 text-rose-600" : "bg-indigo-50 text-indigo-600"} flex items-center justify-center text-xs font-black shadow-sm`}>
                              {review.userName.slice(0, 1)}
                            </div>
                            <div>
                              <p className="text-[13px] font-black text-slate-800 leading-none mb-1">{review.userName}</p>
                              <p className="text-[10px] font-bold text-slate-400 lowercase">Kelas {review.userClass} • {review.date}</p>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ml-auto ${isNeg ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
                              <Star className={`w-3 h-3 ${isNeg ? "text-rose-500" : "text-amber-500"} fill-current`} />
                              <span className="text-[11px] font-black">{review.rating}.0</span>
                            </div>
                          </div>

                          <p className={`text-xs font-bold leading-relaxed mb-4 ${isNeg ? "text-slate-700" : "text-slate-600"}`}>
                            "{review.comment}"
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {isNeg && <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider">#Kritis</span>}
                            {review.comment.includes("Rasa") && <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-[9px] font-black uppercase border border-orange-100">#KualitasRasa</span>}
                            {review.comment.includes("Porsi") && <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase border border-blue-100">#Porsi</span>}
                            {review.comment.includes("Pengiriman") && <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase border border-emerald-100">#TepatWaktu</span>}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button
                            onClick={() => toggleFollowUp(review.id)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${done
                                ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-100"
                                : "bg-white text-slate-400 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 group"
                              }`}
                          >
                            {done ? <CheckCircle2 className="w-3 h-3" /> : null}
                            {done ? "Follow Up OK" : "Tandai Feedback"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-slate-100" />
                  </div>
                  <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Feed Kosong</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
    </div>
  );
}

function isSelected(star: number) {
  return true;
}
