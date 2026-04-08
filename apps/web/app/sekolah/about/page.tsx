import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { Rocket, Globe, TrendingUp, Users, Trophy, Lightbulb } from "lucide-react";

const items = [
  { Icon: Rocket,      name: "Founded 2018",        desc: "Started with a mission to bring real-time visibility and intelligence to global supply chains." },
  { Icon: Globe,       name: "50+ Countries",        desc: "Operating across more than 50 countries with a network of 1,200+ trusted logistics partners." },
  { Icon: TrendingUp,  name: "$2B+ Cargo Managed",   desc: "Trusted by leading enterprises to move billions of dollars of goods safely every year." },
  { Icon: Users,       name: "800+ Team Members",    desc: "A global team of logistics experts, engineers, and data scientists united by one mission." },
  { Icon: Trophy,      name: "Award-Winning Platform",desc: "Recognised by Gartner and Forbes as a Top 10 Supply Chain Innovation platform in 2024." },
  { Icon: Lightbulb,   name: "AI-Powered Insights",  desc: "Our proprietary AI engine predicts disruptions up to 72 hours ahead, keeping clients one step ahead." },
];

export default function About() {
  return (
    <div className="bg-white">
      <section className="py-12 md:py-20 px-6 md:px-16" style={{ background: "linear-gradient(135deg, #0a0e28 0%, #0d1a4a 100%)" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#a5b4fc" }}>Our Story</p>
          <h1 className="text-5xl font-bold text-white tracking-tight mb-4" style={{ fontFamily: "'Georgia', serif" }}>
            About{" "}
            <PointerHighlight
              containerClassName="inline-block ml-2"
              rectangleClassName="bg-indigo-500/20 border-indigo-400/50"
              pointerClassName="text-white w-8 h-8"
            >
              <span className="relative z-10">B.O.G.A</span>
            </PointerHighlight>
          </h1>
          <div className="w-16 h-1 rounded-full mb-6" style={{ background: "linear-gradient(90deg, #6366f1, #06b6d4)" }} />
          <p className="text-gray-400 text-base leading-relaxed max-w-2xl">
            B.O.G.A was built by logistics veterans who were tired of fragmented, opaque supply chains. We created a single platform that gives businesses total visibility and control — from the first purchase order to the last delivery.
          </p>
        </div>
      </section>
      <section className="py-12 md:py-16 px-6 md:px-16" style={{ background: "#f8faff" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.name} className="bg-white rounded-2xl p-7" style={{ border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 4px 20px rgba(99,102,241,0.05)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg,#ede9fe,#cffafe)" }}>
                <item.Icon className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{item.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed m-0">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
