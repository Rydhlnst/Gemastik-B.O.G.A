import { Navbar } from '@/sections/Navbar'
import { HeroSection } from '@/sections/HeroSection'
import { TrustMarquee } from '@/sections/TrustMarquee'
import { PhaseTimeline } from '@/sections/PhaseTimeline'
import { TrustPrimitives } from '@/sections/TrustPrimitives'
import { RoleGateways } from '@/sections/RoleGateways'
import { Footer } from '@/sections/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Navbar />
      <HeroSection />
      <TrustMarquee />
      <PhaseTimeline />
      <TrustPrimitives />
      <RoleGateways />
      <Footer />
    </div>
  )
}
