"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGalleryStore } from "@/lib/store/galleryStore";
import type { SortOption } from "@/lib/store/galleryStore";
import { Search, SlidersHorizontal, Heart, X } from "lucide-react";

const TEMPLATES = [
  { value: "all", label: "All Templates" },
  { value: "bullets-cards", label: "Bullets Cards" },
  { value: "default", label: "Default" },
  { value: "social-post", label: "Social Post" },
  { value: "sandwich", label: "Sandwich" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "template", label: "By Template" },
  { value: "favorite", label: "Favorites First" },
];

export function Filters() {
  const searchQuery = useGalleryStore((state) => state.filters.searchQuery);
  const templateFilter = useGalleryStore((state) => state.filters.templateFilter);
  const showFavoritesOnly = useGalleryStore(
    (state) => state.filters.showFavoritesOnly
  );
  const sortBy = useGalleryStore((state) => state.sortBy);

  const setSearchQuery = useGalleryStore((state) => state.setSearchQuery);
  const setTemplateFilter = useGalleryStore((state) => state.setTemplateFilter);
  const toggleFavoritesOnly = useGalleryStore(
    (state) => state.toggleFavoritesOnly
  );
  const setSortBy = useGalleryStore((state) => state.setSortBy);
  const clearFilters = useGalleryStore((state) => state.clearFilters);

  const hasActiveFilters = searchQuery || templateFilter || showFavoritesOnly;

  return (
    <div className="space-y-4">
      {/* Search and Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Template Filter */}
        <Select
          value={templateFilter || "all"}
          onValueChange={(value) =>
            setTemplateFilter(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATES.map((template) => (
              <SelectItem key={template.value} value={template.value}>
                {template.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          size="sm"
          onClick={toggleFavoritesOnly}
        >
          <Heart
            className={`mr-2 h-4 w-4 ${
              showFavoritesOnly ? "fill-current" : ""
            }`}
          />
          Favorites Only
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
