"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  path: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data.templates || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load templates:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <TemplatesSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Templates</h1>
        <p className="mt-2 text-slate-600">
          Browse and preview available templates for image generation
        </p>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-slate-100 p-4 mb-4">
            <FolderOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-medium text-slate-900 mb-2">
            No templates found
          </h3>
          <p className="text-slate-600">
            Templates will appear here once available
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                {/* Template Preview */}
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <FolderOpen className="h-12 w-12 text-slate-400" />
                </div>

                {/* Template Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{template.name}</h3>
                    <p className="text-sm text-slate-600">{template.id}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{template.path}</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/preview/${template.id}?title=Sample Title&subtitle=Sample Subtitle`}
                      target="_blank"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </Link>
                    <Link href="/dashboard/editor" className="flex-1">
                      <Button size="sm" className="w-full">
                        Use Template
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplatesSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-20 bg-slate-200 rounded animate-pulse" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 bg-slate-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
