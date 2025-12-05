"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Type, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Font {
  name: string;
  path: string;
}

export default function FontsPage() {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    try {
      const response = await fetch("/api/fonts");
      const data = await response.json();
      setFonts(data.fonts || []);
    } catch (error) {
      console.error("Failed to load fonts:", error);
      toast.error("Failed to load fonts");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [".ttf", ".otf", ".woff", ".woff2"];
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf("."));

    if (!validTypes.includes(fileExt)) {
      toast.error("Invalid file type. Please upload a .ttf, .otf, .woff, or .woff2 file");
      return;
    }

    const formData = new FormData();
    formData.append("font", file);

    setUploading(true);

    try {
      const response = await fetch("/api/fonts/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Font uploaded successfully");
        loadFonts();
      } else {
        toast.error(data.error || "Failed to upload font");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload font");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  if (loading) {
    return <FontsSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Fonts</h1>
        <p className="mt-2 text-slate-600">
          Upload and manage custom fonts for your images
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Upload Font</h3>
              <p className="text-sm text-slate-600">
                Supported formats: .ttf, .otf, .woff, .woff2
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-1"
              />
              <Button disabled={uploading}>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fonts List */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Available Fonts ({fonts.length})
        </h2>

        {fonts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
              <Type className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No custom fonts uploaded
            </h3>
            <p className="text-slate-600">
              Upload your first font to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fonts.map((font, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Type className="h-5 w-5 text-slate-400 flex-shrink-0" />
                        <h3 className="font-semibold text-slate-900 truncate">
                          {font.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 truncate">
                        {font.path}
                      </p>

                      {/* Font Preview */}
                      <div
                        className="mt-3 p-3 bg-slate-50 rounded border text-center"
                        style={{ fontFamily: font.name }}
                      >
                        <p className="text-lg">The quick brown fox</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FontsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-20 bg-slate-200 rounded animate-pulse" />
      <div className="h-32 bg-slate-200 rounded animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 bg-slate-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
