"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Activity,
  Settings,
  BarChart3,
  Shield,
  TestTube,
  Database,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Transactions",
    href: "/admin/transactions",
    icon: CreditCard,
  },
  {
    name: "Behavioral Sessions",
    href: "/admin/behavioral-sessions",
    icon: Activity,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Security",
    href: "/admin/security",
    icon: Shield,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

const testingNavigation = [
  {
    name: "Transaction Testing",
    href: "/transactions",
    icon: Database,
  },
  {
    name: "Session Testing",
    href: "/sessions",
    icon: TestTube,
  },
];

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ onClose, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("pb-12 min-h-screen bg-sidebar border-r border-sidebar-border", className)}>
      <div className="space-y-6 py-6">
        <div className="px-6">
          <h2 className="text-xl font-bold tracking-tight text-sidebar-foreground">
            Fraud Detection
          </h2>
        </div>
        <div className="px-3">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="px-3">
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="text-sm font-semibold text-sidebar-foreground/80 uppercase tracking-wider">
              Testing
            </h3>
            <Badge variant="secondary" className="text-xs">
              Dev
            </Badge>
          </div>
          <div className="space-y-2">
            {testingNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}