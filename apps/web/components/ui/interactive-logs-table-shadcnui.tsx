"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LogLevel = "Selesai" | "Diperjalanan" | "Belum";

interface Log {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  duration: string;
  status: string;
  tags: string[];
}

type Filters = {
  level: string[];
  service: string[];
  status: string[];
};

const SAMPLE_LOGS: Log[] = [
  {
    id: "1",
    timestamp: new Date().toISOString(),
    level: "Selesai",
    service: "CV Katering Bandung",
    message: "Pengiriman ke SMAN 3 Bandung Berhasil",
    duration: "450 Porsi",
    status: "200",
    tags: ["Logistik", "Sukses"],
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    level: "Diperjalanan",
    service: "Dapur Sehat Mandiri",
    message: "Keterlambatan 15 Menit - Macet",
    duration: "300 Porsi",
    status: "warning",
    tags: ["Logistik", "Delay"],
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    level: "Belum",
    service: "Berkah Food Service",
    message: "Kendala Armada - Kendaraan Mogok",
    duration: "250 Porsi",
    status: "503",
    tags: ["Logistik", "Urgent"],
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    level: "Selesai",
    service: "Sari Rasa Katering",
    message: "Tiba di SDN Cempaka - Tepat Waktu",
    duration: "150 Porsi",
    status: "201",
    tags: ["Logistik", "Tiba"],
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    level: "Selesai",
    service: "Dapur Ibu Rahma",
    message: "Verifikasi Manifest Pengiriman Selesai",
    duration: "400 Porsi",
    status: "200",
    tags: ["Logistik", "Docs"],
  },
];

const levelStyles: Record<LogLevel, string> = {
  Selesai: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black",
  Diperjalanan: "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black",
  Belum: "bg-red-500/10 text-red-600 dark:text-red-400 font-black",
};

const statusStyles: Record<string, string> = {
  "200": "text-emerald-500 font-black",
  "201": "text-blue-500 font-black",
  "429": "text-yellow-500 font-black",
  "502": "text-red-500 font-black",
  "503": "text-red-500 font-black",
  warning: "text-amber-500 font-black",
};

function LogRow({
  log,
  expanded,
  onToggle,
}: {
  log: Log;
  expanded: boolean;
  onToggle: () => void;
}) {
  const formattedTime = new Date(log.timestamp).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <>
      <motion.button
        onClick={onToggle}
        className="w-full p-4 text-left transition-colors hover:bg-slate-50 active:bg-slate-100 border-b border-slate-100"
        whileHover={{ backgroundColor: "rgba(0,0,0,0.01)" }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="h-4 w-4 text-slate-300" />
          </motion.div>

          <Badge
            variant="secondary"
            className={`flex-shrink-0 capitalize px-3 py-1 rounded-lg text-[10px] tracking-widest ${levelStyles[log.level]}`}
          >
            {log.level}
          </Badge>

          <time className="w-20 flex-shrink-0 font-mono text-[10px] text-slate-400 font-bold">
            {formattedTime}
          </time>

          <span className="flex-shrink-0 min-w-[140px] text-xs font-black text-slate-900 uppercase tracking-tight">
            {log.service}
          </span>

          <p className="flex-1 truncate text-xs text-slate-600 font-medium">
            {log.message}
          </p>

          <span
            className={`flex-shrink-0 font-mono text-xs font-black ${
              statusStyles[log.status] ?? "text-slate-400"
            }`}
          >
            {log.status}
          </span>

          <span className="w-24 flex-shrink-0 text-right font-mono text-[10px] text-slate-400 font-bold">
            {log.duration}
          </span>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-slate-50/50 backdrop-blur-3xl"
          >
            <div className="space-y-4 p-6 border-l-2 border-emerald-500 ml-4 my-2">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                  Detail Laporan
                </p>
                <p className="rounded-xl bg-white p-4 font-mono text-xs text-slate-800 leading-relaxed border border-slate-200 shadow-sm">
                  {log.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Volume Muatan
                  </p>
                  <p className="font-mono text-xs font-black text-slate-900">{log.duration}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Stempel Waktu
                  </p>
                  <p className="font-mono text-[10px] text-slate-500">
                    {log.timestamp}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Identifikasi
                </p>
                <div className="flex flex-wrap gap-2">
                  {log.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[9px] font-black border-slate-200 text-emerald-700 px-2 py-0.5 rounded-md uppercase tracking-tighter bg-white">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterPanel({
  filters,
  onChange,
  logs,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  logs: Log[];
}) {
  const levels = Array.from(new Set(logs.map((log) => log.level)));
  const services = Array.from(new Set(logs.map((log) => log.service)));
  const statuses = Array.from(new Set(logs.map((log) => log.status)));

  const toggleFilter = (category: keyof Filters, value: string) => {
    const current = filters[category];
    const updated = current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value];

    onChange({
      ...filters,
      [category]: updated,
    });
  };

  const clearAll = () => {
    onChange({
      level: [],
      service: [],
      status: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (group) => group.length > 0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.05 }}
      className="flex h-full flex-col space-y-6 overflow-y-auto bg-slate-50/80 p-6 backdrop-blur-xl border-r border-slate-100"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Filter Monitoring</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-6 text-[10px] font-black text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
          >
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          Prioritas
        </p>
        <div className="space-y-2">
          {levels.map((level) => {
            const selected = filters.level.includes(level);

            return (
              <motion.button
                key={level}
                type="button"
                whileHover={{ x: 4 }}
                onClick={() => toggleFilter("level", level)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-2 border rounded-xl px-4 py-3 text-[11px] font-bold transition-all ${
                  selected
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 shadow-sm"
                    : "border-slate-200 text-slate-500 hover:border-emerald-500/30 hover:bg-white"
                }`}
              >
                <span className="capitalize">{level}</span>
                {selected && <Check className="h-3.5 w-3.5" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          Vendor & Layanan
        </p>
        <div className="space-y-2">
          {services.map((service) => {
            const selected = filters.service.includes(service);

            return (
              <motion.button
                key={service}
                type="button"
                whileHover={{ x: 4 }}
                onClick={() => toggleFilter("service", service)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-2 border rounded-xl px-4 py-3 text-[11px] font-bold transition-all ${
                  selected
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 shadow-sm"
                    : "border-slate-200 text-slate-500 hover:border-emerald-500/30 hover:bg-white"
                }`}
              >
                <span className="truncate">{service}</span>
                {selected && <Check className="h-3.5 w-3.5" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export function InteractiveLogsTable({ data = SAMPLE_LOGS }: { data?: Log[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    level: [],
    service: [],
    status: [],
  });

  const filteredLogs = useMemo(() => {
    return data.filter((log) => {
      const lowerQuery = searchQuery.toLowerCase();

      const matchSearch =
        log.message.toLowerCase().includes(lowerQuery) ||
        log.service.toLowerCase().includes(lowerQuery);

      const matchLevel =
        filters.level.length === 0 || filters.level.includes(log.level);
      const matchService =
        filters.service.length === 0 || filters.service.includes(log.service);
      const matchStatus =
        filters.status.length === 0 || filters.status.includes(log.status);

      return matchSearch && matchLevel && matchService && matchStatus;
    });
  }, [data, filters, searchQuery]);

  const activeFilters =
    filters.level.length + filters.service.length + filters.status.length;

  return (
    <div className="w-full bg-[#1b4332] rounded-[48px] overflow-hidden border border-white/10 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.4)]">
      <div className="flex flex-col h-[700px]">
        {/* Header Section with Emerald Gradient */}
        <div className="border-b border-white/10 bg-gradient-to-br from-[#064e3b] to-[#1b4332] p-8 lg:p-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Live monitoring</h1>
                <p className="text-[10px] text-emerald-400/60 font-black uppercase tracking-[0.3em] mt-1">
                  Menampilkan {filteredLogs.length} dari {data.length} rekaman aktif
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <Search className="h-6 w-6 text-emerald-400" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-1 group">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  placeholder="Cari manifest, vendor, atau status..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:bg-white/10 focus:border-emerald-500/50 transition-all text-sm font-medium"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters((current) => !current)}
                className={`h-14 px-6 rounded-2xl border-white/10 transition-all relative ${
                  showFilters ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <Filter className="h-5 w-5 mr-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
                {activeFilters > 0 && (
                  <Badge className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center p-0 text-[10px] font-black bg-emerald-400 text-[#064e3b] border-2 border-[#064e3b] shadow-lg">
                    {activeFilters}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div
                key="filters"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "circOut" }}
                className="overflow-hidden border-r border-white/10"
              >
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  logs={data}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
            <div className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.03,
                        ease: "circOut"
                      }}
                    >
                      <LogRow
                        log={log}
                        expanded={expandedId === log.id}
                        onToggle={() =>
                          setExpandedId((current) =>
                            current === log.id ? null : log.id
                          )
                        }
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full p-20 text-center"
                  >
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <Search className="h-8 w-8 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
                      Tidak ada rekaman yang sesuai dengan filter Anda.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
