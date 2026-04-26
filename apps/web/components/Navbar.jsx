import * as React from "react"
import { Shield, Globe, Menu } from "lucide-react"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const NAV_LINKS = [
  { href: "#", label: "Informasi" },
  { href: "#", label: "Layanan" },
  { href: "#", label: "Berita" },
  { href: "#", label: "Tentang Kami" },
  { href: "#", label: "Informasi Publik" },
  { href: "#", label: "Kontak" },
]

export function Navbar() {
  return (
    <nav className="w-full bg-primary text-primary-foreground py-4 px-6 md:px-12 flex items-center justify-between z-50 relative">
      <div className="flex flex-row items-center gap-2">
        <Shield className="h-8 w-8 text-white fill-white" />
        <div className="flex flex-col">
          <span className="text-xl font-bold leading-tight">BPJS</span>
          <span className="text-sm leading-tight text-white/90">Ketenagakerjaan</span>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2">
        <NavigationMenu>
          <NavigationMenuList>
            {NAV_LINKS.map((link) => (
              <NavigationMenuItem key={link.label}>
                <NavigationMenuLink className="bg-transparent hover:bg-white/10 text-white px-4 py-2 rounded-md transition-colors cursor-pointer text-sm font-medium">
                  {link.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="mx-2 w-px h-6 bg-white/30" />
        <button className="flex items-center gap-1 text-sm font-medium hover:text-white/80 transition-colors">
          <Globe className="h-4 w-4" />
          <span>ID</span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className="flex md:hidden items-center gap-4">
        <button className="flex items-center gap-1 text-xs font-medium hover:text-white/80 transition-colors">
          <Globe className="h-4 w-4" />
          <span>ID</span>
        </button>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-primary border-primary-foreground/10 text-white">
            <SheetHeader className="text-left pb-6">
              <SheetTitle className="text-white flex items-center gap-2">
                <Shield className="h-6 w-6 fill-white" />
                <span>BPJS Ketenagakerjaan</span>
              </SheetTitle>
            </SheetHeader>
            <Separator className="bg-white/10 mb-6" />
            <div className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-lg font-medium hover:text-white/70 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="absolute bottom-10 left-6 right-6">
              <Button className="w-full bg-white text-primary hover:bg-white/90">
                Masuk / Daftar
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
