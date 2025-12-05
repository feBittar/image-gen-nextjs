"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGalleryStore } from "@/lib/store/galleryStore";
import type { GalleryImage } from "@/lib/store/galleryStore";
import {
  Download,
  Heart,
  MoreVertical,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageCardProps {
  image: GalleryImage;
}

export function ImageCard({ image }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toggleFavorite = useGalleryStore((state) => state.toggleFavorite);
  const deleteImage = useGalleryStore((state) => state.deleteImage);
  const toggleSelection = useGalleryStore((state) => state.toggleImageSelection);
  const isSelected = useGalleryStore((state) =>
    state.selectedImages.has(image.id)
  );

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `image-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded");
    } catch (error) {
      toast.error("Failed to download image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(image.url);
    toast.success("URL copied to clipboard");
  };

  const handleDelete = () => {
    deleteImage(image.id);
    toast.success("Image deleted");
  };

  const title =
    typeof image.formData.title === "string"
      ? image.formData.title
      : image.formData.title?.text || image.formData.text1 || "Imagem";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md",
        isSelected && "ring-2 ring-blue-500"
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Image
          src={image.url}
          alt={title || "Generated image"}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />

        {/* Favorite Badge */}
        {image.favorite && (
          <div className="absolute left-2 top-2">
            <Badge variant="secondary" className="bg-white/90">
              <Heart className="mr-1 h-3 w-3 fill-red-500 text-red-500" />
              Favorite
            </Badge>
          </div>
        )}

        {/* Selection Checkbox */}
        <div className="absolute right-2 top-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelection(image.id)}
            className="h-5 w-5 cursor-pointer rounded border-2 border-white bg-white/90 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            onClick={handleDownload}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => toggleFavorite(image.id)}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                image.favorite && "fill-red-500 text-red-500"
              )}
            />
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-sm font-medium text-slate-900">
              {title || "Untitled"}
            </h3>
            <p className="text-xs text-slate-600">
              {new Date(image.timestamp).toLocaleDateString()}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyUrl}>
                <Copy className="mr-2 h-4 w-4" />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(image.url, "_blank")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in New Tab
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Template Badge */}
        <Badge variant="outline" className="text-xs">
          {image.template}
        </Badge>
      </div>
    </div>
  );
}
