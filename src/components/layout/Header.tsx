"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuToggle, showMenuButton = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Image Generator
          </h1>
          <p className="text-xs text-slate-600">
            Create beautiful graphics in seconds
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Add user menu or other actions here */}
      </div>
    </header>
  );
}
