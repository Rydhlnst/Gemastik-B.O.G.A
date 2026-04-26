import * as React from "react"
import { ArrowRight, ChevronLeft, ChevronRight, Users, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MainSection() {
  return (
    <section className="relative w-full bg-primary text-primary-foreground pt-12 pb-32 px-6 md:px-12 overflow-hidden flex items-center justify-between min-h-[500px]">
      {/* Decorative background shape elements */}
      <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full text-white">
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
        </svg>
      </div>
      
      {/* Accent Green Strip (similar to screenshot) */}
      <div 
        className="absolute bottom-0 left-0 w-[120%] h-32 bg-accent opacity-90 rotate-[-3deg] origin-bottom-left -z-0"
      />

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
        
        {/* Left Side Content */}
        <div className="flex flex-col space-y-6 max-w-xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Bayar Iuran JHT<br />
            Bisa Dimana Saja
          </h1>
          <p className="text-lg text-primary-foreground/90 leading-relaxed max-w-md">
            Nikmati fasilitas khusus iuran JHT untuk pekerja Bukan Penerima Upah (BPU) #BankingfromHome
          </p>
          
          <div className="pt-4">
            <Button className="bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-2 border border-white/20 px-6 py-6 text-sm">
              Lihat Manfaat <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Right Side Illustration (Placeholder) */}
        <div className="hidden md:flex justify-center items-center relative h-[300px]">
          {/* Main Illustration Wrapper */}
          <div className="relative w-72 h-72 rounded-full bg-white/5 flex items-center justify-center">
            {/* Some generic lucide icons to mock the people interacting with money */}
            <Users className="w-40 h-40 text-accent absolute bottom-4 drop-shadow-2xl" />
            <CreditCard className="w-20 h-20 text-white absolute top-4 right-4 drop-shadow-lg" />
            
            {/* Mock floating elements */}
            <div className="absolute -left-6 top-1/3 bg-white text-primary rounded-full p-3 shadow-lg">
              <span className="text-lg font-bold">+</span>
            </div>
            <div className="absolute right-0 top-1/4 bg-white text-accent rounded-full p-4 shadow-xl">
              <span className="text-xl font-bold">Rp</span>
            </div>
          </div>
        </div>

      </div>

      {/* Slider Controls (decorative) */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:block">
        <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
          <ChevronLeft className="w-6 h-6" />
        </Button>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:block">
        <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>
    </section>
  )
}
