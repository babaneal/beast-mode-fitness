import { Link, useLocation } from "wouter";
import { useTheme } from "@/lib/theme";
import {
  Dumbbell,
  UtensilsCrossed,
  ShoppingCart,
  Trophy,
  LayoutDashboard,
  Sun,
  Moon,
  Menu,
  CalendarDays,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/prs", label: "PR Tracker", icon: Trophy },
  { href: "/meals", label: "Meal Plans", icon: UtensilsCrossed },
  { href: "/grocery", label: "Grocery List", icon: ShoppingCart },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-sidebar border-r border-sidebar-border
          flex flex-col transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          {/* Logo SVG */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            aria-label="Beast Mode logo"
            className="shrink-0"
          >
            <rect width="32" height="32" rx="8" fill="hsl(24, 95%, 53%)" />
            <path
              d="M8 22V10h3v4.5h2.5L16 10h3.5l-3.5 5.5L20 22h-3.5l-2-4.5H11V22H8Z"
              fill="white"
              fillRule="evenodd"
            />
            <rect x="21" y="10" width="3" height="12" rx="1.5" fill="white" />
          </svg>
          <div>
            <h1 className="text-base font-bold text-sidebar-foreground tracking-tight leading-none">
              BEAST MODE
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Fitness Tracker</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors cursor-pointer
                    ${
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }
                  `}
                >
                  <item.icon className="w-4.5 h-4.5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            data-testid="button-theme-toggle"
            className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            data-testid="button-mobile-menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-bold text-sm tracking-tight">BEAST MODE</span>
        </div>
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
