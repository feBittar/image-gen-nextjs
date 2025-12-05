"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ImageIcon,
  Palette,
  FolderOpen,
  Type,
  Film,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Editor",
    href: "/dashboard/editor",
    icon: Palette,
  },
  {
    name: "Carousel Import",
    href: "/dashboard/carousel-import",
    icon: Film,
  },
  {
    name: "Gallery",
    href: "/dashboard/gallery",
    icon: ImageIcon,
  },
  {
    name: "Templates",
    href: "/dashboard/templates",
    icon: FolderOpen,
  },
  {
    name: "Fonts",
    href: "/dashboard/fonts",
    icon: Type,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r bg-white",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <ImageIcon className="h-6 w-6 text-blue-600" />
        <span className="text-xl font-bold">ImageGen</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-medium">Need help?</p>
          <p className="mt-1">Check out our documentation</p>
        </div>
      </div>
    </aside>
  );
}
