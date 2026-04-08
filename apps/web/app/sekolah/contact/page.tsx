"use client";

import { useState } from "react";
import { CheckCircle2, MapPin, Mail, Phone } from "lucide-react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="bg-white">
      <section className="py-12 md:py-20 px-6 md:px-16" style={{ background: "linear-gradient(135deg, #0a0e28 0%, #0d1a4a 100%)" }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#a5b4fc" }}>Get In Touch</p>
          <h1 className="text-5xl font-bold text-white tracking-tight mb-4" style={{ fontFamily: "'Georgia', serif" }}>Let's Talk Supply Chain</h1>
          <div className="w-16 h-1 rounded-full" style={{ background: "linear-gradient(90deg, #6366f1, #06b6d4)" }} />
        </div>
      </section>
      <section className="py-12 md:py-16 px-6 md:px-16 flex justify-center" style={{ background: "#f8faff" }}>
        <div className="w-full max-w-xl">
          {sent ? (
            <div className="bg-white rounded-2xl p-12 text-center" style={{ border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 8px 40px rgba(99,102,241,0.08)" }}>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                <p className="text-gray-500 text-sm">Our team will get back to you within 24 hours.</p>
              </div>
            </div>
          ) : (
            <form
              className="bg-white rounded-2xl p-10 flex flex-col gap-5"
              style={{ border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 8px 40px rgba(99,102,241,0.08)" }}
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            >
              {[["Your Name", "text", true], ["Company / Organization", "text", false], ["Email Address", "email", true]].map(([label, type, required]) => (
                <div key={label as string}>
                  <label className="block text-xs text-gray-400 mb-1.5 tracking-wide">{label as string}{required ? " *" : ""}</label>
                  <input
                    type={type as string}
                    required={required as boolean}
                    placeholder={`Enter ${(label as string).toLowerCase()}...`}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all"
                    style={{ background: "#f8faff", border: "1px solid rgba(99,102,241,0.15)", fontFamily: "inherit" }}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 tracking-wide">Message *</label>
                <textarea
                  rows={4} required
                  placeholder="Give us some feedback on our website."
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm text-gray-900 outline-none resize-y"
                  style={{ background: "#f8faff", border: "1px solid rgba(99,102,241,0.15)", fontFamily: "inherit" }}
                />
              </div>
              <button
                type="submit"
                className="py-3 rounded-xl text-white font-semibold text-sm cursor-pointer border-none"
                style={{ background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)", boxShadow: "0 4px 20px rgba(99,102,241,0.3)" }}
              >
                Send Message
              </button>
            </form>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
            { Icon: MapPin, title: "Bandung, Indonesia",   sub: "Jl. Telekomunikasi No.52-53" },
            { Icon: Mail,   title: "hello@gmail.com",      sub: "We reply within 24h" },
            { Icon: Phone,  title: "+62 89 9000 9000",     sub: "Mon–Fri, 8am–6pm WIB" },
          ].map(({ Icon, title, sub }) => (
            <div key={title} className="text-center py-4 px-3 rounded-xl bg-white" style={{ border: "1px solid rgba(99,102,241,0.1)" }}>
              <div className="flex justify-center mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#ede9fe,#cffafe)" }}>
                  <Icon className="w-4 h-4 text-indigo-500" />
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900">{title}</div>
              <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
            </div>
          ))}
          </div>
        </div>
      </section>
    </div>
  );
}
