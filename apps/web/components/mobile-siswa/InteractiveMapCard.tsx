"use client";

import dynamic from "next/dynamic";
import { type Sekolah } from "@/lib/mbgdummydata";
import { CheckCircle2, Activity } from "lucide-react";

const MapLibreMap = dynamic(() => import("@/components/ui/MapLibreMap"), { ssr: false });

interface InteractiveMapCardProps {
  selectedSchool: Sekolah | null;
  onSchoolSelect: (school: Sekolah | null) => void;
}

export const InteractiveMapCard = ({ selectedSchool, onSchoolSelect }: InteractiveMapCardProps) => {
  return (
    <div className="px-6 py-4 pb-8">
      <div className="w-full h-[500px] rounded-[2rem] bg-white shadow-sm border border-slate-100 relative">
        
        {/* Map Container */}
        <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
          <MapLibreMap selectedSchool={selectedSchool} onSchoolSelect={onSchoolSelect} />
        </div>

        {/* Floating Overlay Layer (Pointer Events None to let map interact) */}
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4">
          {/* Content removed to focus on personalized map experience */}
        </div>
        
      </div>
    </div>
  );
};
