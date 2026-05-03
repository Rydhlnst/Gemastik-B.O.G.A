import { ContractBuilder } from "@/components/sppg/admin/contract-builder";

export default function CreateTenderPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-6 font-sans w-full">
      
      {/* Soft Header */}
      <div className="w-full mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Formulir Penerbitan SPK</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Eksplorasi database sekolah dan tentukan parameter kontrak pengadaan gizi.</p>
      </div>

      <div className="w-full">
        <ContractBuilder />
      </div>
      
    </div>
  );
}

