"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  GraduationCap,
  PlusCircle,
  Wallet,
  Settings,
  HelpCircle,
  Zap,
  ChevronRight,
  ShieldAlert
} from "lucide-react";

interface SidebarProps {
  role: "learner" | "instructor";
  isAdmin?: boolean;
}

export const Sidebar = ({ role, isAdmin }: SidebarProps) => {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    ...(role === "learner" && !isAdmin ? [
      {
        label: "Browse Courses",
        icon: Search,
        href: "/courses",
        active: pathname === "/courses" || pathname.startsWith("/courses/"),
      }
    ] : []),
    {
      label: isAdmin ? "System Overview" : role === "instructor" ? "My Courses" : "My Learning",
      icon: GraduationCap,
      href: isAdmin ? "/admin" : role === "instructor" ? "/instructor/courses" : "/my-learning",
      active: pathname === "/admin" || pathname.startsWith(role === "instructor" ? "/instructor/courses" : "/my-learning"),
    },
    ...(!isAdmin && role === "instructor" ? [
      {
        label: "Create Course",
        icon: PlusCircle,
        href: "/instructor/courses/new",
        active: pathname === "/instructor/courses/new",
      },
      {
        label: "Earnings",
        icon: Wallet,
        href: "/instructor/earnings",
        active: pathname === "/instructor/earnings",
      }
    ] : [])
  ];

  return (
    <div className="h-full border-r border-border flex flex-col bg-card w-72 transition-colors duration-500">
      <div className="p-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground font-heading">EduEarn</span>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-4 space-y-2 mt-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${route.active
                ? "bg-accent text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
          >
            <route.icon className={`w-5 h-5 ${route.active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
            <span className="font-bold text-sm tracking-wide">{route.label}</span>
            {route.active && <ChevronRight className="w-4 h-4 ml-auto" />}
          </Link>
        ))}
      </div>

      {!isAdmin && (
        <div className="p-8 mt-auto border-t border-border space-y-2">
          <Link href="/settings" className="w-full flex items-center gap-4 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors group">
            <Settings className="w-4 h-4 group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
          </Link>
          <Link href="/help" className="w-full flex items-center gap-4 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors group">
            <HelpCircle className="w-4 h-4 group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest">Help Center</span>
          </Link>
        </div>
      )}
    </div>
  );
};
