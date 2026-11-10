import { ScanLine } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

const analyzerNav = [
  { to: "/analyzer", label: "Home", end: true },
  { to: "/analyzer/upload", label: "Upload", end: false },
  { to: "/analyzer/processing", label: "Processing", end: false },
  { to: "/analyzer/results", label: "Results", end: false },
];

export default function AnalyzerLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
          <Link to="/analyzer" className="flex items-center gap-2.5 font-extrabold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ScanLine className="h-4 w-4" />
            </span>
            Scrabble Analyzer
          </Link>
          <nav aria-label="Analyzer" className="flex gap-1 overflow-x-auto">
            {analyzerNav.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>
    </div>
  );
}
