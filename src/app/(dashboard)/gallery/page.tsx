"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageCard } from "@/components/gallery/ImageCard";
import { Filters } from "@/components/gallery/Filters";
import { useGalleryStore, selectFilteredImages } from "@/lib/store/galleryStore";
import { Trash2, Download, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function GalleryPage() {
  const [mounted, setMounted] = useState(false);
  const filteredImages = useGalleryStore(selectFilteredImages);
  const selectedImages = useGalleryStore((state) => state.selectedImages);
  const deleteImages = useGalleryStore((state) => state.deleteImages);
  const clearSelection = useGalleryStore((state) => state.clearSelection);
  const selectAll = useGalleryStore((state) => state.selectAll);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDeleteSelected = () => {
    if (selectedImages.size === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${selectedImages.size} image${
          selectedImages.size > 1 ? "s" : ""
        }?`
      )
    ) {
      deleteImages(Array.from(selectedImages));
      toast.success(`Deleted ${selectedImages.size} images`);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedImages.size === 0) return;

    const images = useGalleryStore
      .getState()
      .images.filter((img) => selectedImages.has(img.id));

    for (const image of images) {
      try {
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
        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error("Failed to download image:", error);
      }
    }

    toast.success(`Downloaded ${selectedImages.size} images`);
  };

  if (!mounted) {
    return <GallerySkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gallery</h1>
          <p className="mt-1 text-slate-600">
            {filteredImages.length} image{filteredImages.length !== 1 ? "s" : ""}
            {selectedImages.size > 0 && ` (${selectedImages.size} selected)`}
          </p>
        </div>

        {/* Selection Actions */}
        {selectedImages.size > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSelected}
            >
              <Download className="mr-2 h-4 w-4" />
              Download ({selectedImages.size})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedImages.size})
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Filters />

      {/* Select All */}
      {filteredImages.length > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectedImages.size === filteredImages.length ? clearSelection : selectAll}
          >
            {selectedImages.size === filteredImages.length
              ? "Deselect All"
              : "Select All"}
          </Button>
        </div>
      )}

      {/* Image Grid */}
      {filteredImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-slate-100 p-4 mb-4">
            <ImageIcon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-medium text-slate-900 mb-2">
            No images found
          </h3>
          <p className="text-slate-600 mb-6">
            Start creating images to see them here
          </p>
          <Link href="/dashboard/editor">
            <Button>Create Your First Image</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredImages.map((image) => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      )}
    </div>
  );
}

function GallerySkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-20 bg-slate-200 rounded animate-pulse" />
      <div className="h-16 bg-slate-200 rounded animate-pulse" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-square bg-slate-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
