"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGalleryStore, selectRecentImages } from "@/lib/store/galleryStore";
import {
  ImageIcon,
  FolderOpen,
  Type,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const recentImages = useGalleryStore(selectRecentImages(6));
  const totalImages = useGalleryStore((state) => state.images.length);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome to ImageGen
        </h1>
        <p className="mt-2 text-slate-600">
          Create stunning images with custom styling and templates
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Images"
          value={totalImages}
          icon={<ImageIcon className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Templates"
          value="5"
          icon={<FolderOpen className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Custom Fonts"
          value="12"
          icon={<Type className="h-5 w-5" />}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/editor">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                New Image
              </Button>
            </Link>
            <Link href="/dashboard/gallery">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <ImageIcon className="mr-2 h-4 w-4" />
                View Gallery
              </Button>
            </Link>
            <Link href="/dashboard/templates">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <FolderOpen className="mr-2 h-4 w-4" />
                Browse Templates
              </Button>
            </Link>
            <Link href="/dashboard/fonts">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Type className="mr-2 h-4 w-4" />
                Upload Font
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Images */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Images</CardTitle>
          <Link href="/dashboard/gallery">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-slate-100 p-3 mb-4">
                <ImageIcon className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No images yet
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Create your first image to see it here
              </p>
              <Link href="/dashboard/editor">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Image
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border bg-slate-100"
                >
                  <Image
                    src={image.url}
                    alt={typeof image.formData.title === 'string' ? image.formData.title : 'Generated image'}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-sm font-medium text-white truncate">
                        {typeof image.formData.title === 'string'
                          ? image.formData.title
                          : image.formData.title?.text || image.formData.text1 || 'Imagem'}
                      </p>
                      <p className="text-xs text-white/80">
                        {new Date(image.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: "blue" | "purple" | "green";
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="h-20 bg-slate-200 rounded animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-200 rounded animate-pulse" />
        ))}
      </div>
      <div className="h-40 bg-slate-200 rounded animate-pulse" />
      <div className="h-96 bg-slate-200 rounded animate-pulse" />
    </div>
  );
}
