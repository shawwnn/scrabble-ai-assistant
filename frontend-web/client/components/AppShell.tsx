import { Bell, Gamepad2, History, Home, Menu, Settings, Sparkles, X } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const nav = [{ to: "/", label: "Home", icon: Home }, { to: "/games", label: "Ongoing games", icon: Gamepad2 }, { to: "/history", label: "Match history", icon: History }, { to: "/settings", label: "Settings", icon: Settings }];
export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = location.pathname.startsWith("/games/") ? "Game board" : nav.find((item) => item.to === location.pathname)?.label ?? "Scrabble AI";
  return <div className="min-h-screen bg-background text-foreground">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-20 items-center justify-between border-b border-sidebar-border px-7"><Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><Sparkles className="h-4 w-4" /></span><span className="text-lg font-extrabold tracking-[.22em]">SCRABBLE</span></Link><button className="lg:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button></div>
      <nav className="flex-1 space-y-1 px-4 py-7">{nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === "/"} onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}><Icon className="h-4 w-4" />{label}</NavLink>)}</nav>
      <div className="border-t border-sidebar-border p-5"><div className="flex items-center gap-3 rounded-xl bg-sidebar-accent p-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-primary/20 font-bold text-sidebar-primary">Q</div><div><p className="text-sm font-semibold">QwithU</p><p className="text-xs text-sidebar-foreground/50">Rating 1,420</p></div><span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" /></div></div>
    </aside>
    {mobileOpen && <button className="fixed inset-0 z-30 bg-black/30 lg:hidden" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur md:px-9"><div className="flex items-center gap-3"><button className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button><span className="text-sm font-semibold text-muted-foreground">{title}</span></div><div className="flex items-center gap-3"><Button asChild size="sm" className="hidden rounded-lg sm:flex"><Link to="/new-game">+ <span className="ml-1">New game</span></Link></Button><button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Notifications"><Bell className="h-4 w-4" /></button><div className="hidden items-center gap-2 border-l border-border pl-3 text-sm sm:flex"><div className="grid h-8 w-8 place-items-center rounded-full bg-accent/20 font-bold text-accent-foreground">Q</div><span>QwithU</span></div></div></header><main className={`mx-auto max-w-[1500px] ${location.pathname.startsWith("/games/") ? "p-2 sm:p-5 md:p-9" : "p-5 md:p-9"}`}><Outlet /></main></div>
  </div>;
}
