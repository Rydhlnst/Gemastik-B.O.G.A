import React from "react"
import { Navbar } from "@/components/Navbar"

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}
