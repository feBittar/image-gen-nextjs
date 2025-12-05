"use client";

import { FormBuilder } from "@/components/editor/FormBuilder";
import { PreviewPanel } from "@/components/editor/PreviewPanel";

export default function EditorPage() {
  return (
    <div className="h-full overflow-hidden">
      <div className="grid h-full grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Left Column - Form Builder */}
        <div className="overflow-y-auto">
          <FormBuilder />
        </div>

        {/* Right Column - Preview Panel (Sticky on desktop) */}
        <div className="overflow-y-auto lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}
