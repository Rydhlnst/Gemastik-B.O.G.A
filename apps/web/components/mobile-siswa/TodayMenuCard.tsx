import { Info, UtensilsCrossed } from "lucide-react";

export const TodayMenuCard = () => {
  return (
    <div className="px-6 mb-2 relative z-10">
      <div className="bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-100/50 rounded-3xl p-5 shadow-sm relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-200/30 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex items-start justify-between relative z-10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-100/80 flex items-center justify-center shadow-inner border border-white">
              <UtensilsCrossed className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
               <h3 className="font-black text-slate-800 text-[13px] tracking-tight">Menu Makan Siang</h3>
               <p className="text-[10px] font-bold text-slate-400">Jadwal Gizi Nasional</p>
            </div>
          </div>
          <span className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-md shadow-indigo-500/20">
            HARI INI
          </span>
        </div>

        <div className="relative z-10 flex items-center gap-4 bg-white/80 p-3.5 rounded-[1.25rem] border border-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-3xl shrink-0 border border-indigo-100/50">🍱</div>
          <div className="flex-1">
            <p className="text-[12px] font-black text-slate-800 leading-tight mb-1">Nasi Bento Ayam Teriyaki</p>
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Nasi Putih • Ayam Tumis Teriyaki • Sayur Bayam Jagung • Susu UHT Rasa Cokelat</p>
          </div>
        </div>

        <button className="w-full mt-4 flex items-center justify-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest py-3 rounded-xl bg-indigo-50/50 hover:bg-indigo-100 border border-indigo-100/50 transition-colors active:scale-95 duration-200">
          Lihat Info Nutrisi <Info className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
