'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Download,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Settings2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Code2,
  Trash2,
  Save,
  FileJson,
} from 'lucide-react';
import { useModularStore, useIsCarouselMode, useSlidesCount } from '@/lib/store/modularStore';
import { listPresets } from '@/lib/presets';
import { ModuleSidebar } from '@/components/editor/ModuleSidebar';
import { ModularFormBuilder } from '@/components/editor/ModularFormBuilder';
import { PresetSelector } from '@/components/editor/PresetSelector';
import { LayoutManagerPanel } from '@/components/editor/LayoutManagerPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface GeneratedImage {
  url: string;
  filename: string;
  timestamp: number;
}

type OutputFormat = 'png' | 'jpeg' | 'webp';

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ModularEditorPage() {
  // Store state
  const slides = useModularStore((state) => state.slides);
  const freeImage = useModularStore((state) => state.freeImage);
  const currentPresetId = useModularStore((state) => state.currentPresetId);
  const isDirty = useModularStore((state) => state.isDirty);
  const validationErrors = useModularStore((state) => state.validationErrors);
  const loadPreset = useModularStore((state) => state.loadPreset);
  const toggleModule = useModularStore((state) => state.toggleModule);
  const resetToPreset = useModularStore((state) => state.resetToPreset);
  const validateModules = useModularStore((state) => state.validateModules);
  const getComposedData = useModularStore((state) => state.getComposedData);
  const markClean = useModularStore((state) => state.markClean);
  const getCurrentSlideEnabledModules = useModularStore((state) => state.getCurrentSlideEnabledModules);
  const compositionConfig = useModularStore((state) => state.compositionConfig);

  // Computed value: check if we have any modules enabled
  const hasModulesEnabled = React.useMemo(() => {
    return slides.some(slide => slide.enabledModules.length > 0);
  }, [slides]);
  const isCarouselMode = useIsCarouselMode();
  const slidesCount = useSlidesCount();

  // Local UI state
  const [mounted, setMounted] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [quality, setQuality] = useState(100);
  const [showPreview, setShowPreview] = useState(false);
  const [htmlPreviewUrl, setHtmlPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [showLayoutManager, setShowLayoutManager] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Get available presets
  const presets = listPresets();

  // Prevent hydration mismatch by waiting for client-side mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Load default preset on mount
  React.useEffect(() => {
    if (!currentPresetId && presets.length > 0) {
      // Load 'minimal' preset by default, or first available preset
      const defaultPreset = presets.find((p) => p.id === 'minimal') || presets[0];
      loadPreset(defaultPreset);
    }
  }, [currentPresetId, presets, loadPreset]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle preset selection
   */
  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      loadPreset(preset);
      setShowPresetDialog(false);
      setError(null);
    }
  };

  /**
   * Handle module toggle
   */
  const handleModuleToggle = (moduleId: string, enabled: boolean) => {
    toggleModule(moduleId, enabled);
  };

  /**
   * Handle generate button click
   */
  const handleGenerate = async () => {
    // Validate modules first
    const isValid = validateModules();
    if (!isValid) {
      setError('Please fix validation errors before generating');
      return;
    }

    // Check if at least one module is enabled in at least one slide
    const hasEnabledModules = slides.some(slide => slide.enabledModules.length > 0);
    if (!hasEnabledModules) {
      setError('Please enable at least one module in at least one slide');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Build request payload
      const payload: any = {
        presetId: currentPresetId,
        outputOptions: {
          format: outputFormat,
          quality,
        },
        compositionConfig: compositionConfig || undefined,
      };

      // Determine mode: carousel (2+ slides) or single slide
      if (isCarouselMode) {
        console.log('[Modular Editor] Building carousel payload');
        console.log('  - Slides:', slidesCount);
        console.log('  - Free image enabled:', freeImage.enabled);

        // Carousel mode: send slides array with independent data
        payload.slides = slides.map(slide => ({
          id: slide.id,
          enabledModules: slide.enabledModules,
          data: slide.data,
        }));

        // Only include freeImage if enabled
        if (freeImage.enabled) {
          payload.freeImage = freeImage;
        }

        console.log('[Modular Editor] Carousel payload:', {
          slideCount: payload.slides.length,
          freeImageEnabled: freeImage.enabled,
        });
      } else {
        // Single slide mode: use first slide's data (backward compatible)
        console.log('[Modular Editor] Building single slide payload');

        const firstSlide = slides[0];
        payload.enabledModules = firstSlide.enabledModules;
        payload.moduleData = firstSlide.data;

        console.log('[Modular Editor] Single slide payload:', {
          enabledModules: payload.enabledModules,
          modules: Object.keys(payload.moduleData),
        });
      }

      // Call API
      const response = await fetch('/api/generate-modular', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate image');
      }

      // Add generated images to gallery
      const newImages: GeneratedImage[] = result.images.map(
        (url: string, index: number) => ({
          url,
          filename: result.filenames[index],
          timestamp: Date.now(),
        })
      );

      setGeneratedImages((prev) => [...newImages, ...prev]);
      setHtmlPreviewUrl(result.htmlUrl || null);
      markClean();

      console.log('[Modular Editor] Generated images:', newImages);
    } catch (err) {
      console.error('[Modular Editor] Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle reset to preset
   */
  const handleReset = () => {
    resetToPreset();
    setError(null);
  };

  /**
   * Handle clear all generated images
   */
  const handleClearAll = () => {
    setGeneratedImages([]);
    setHtmlPreviewUrl(null);
  };

  /**
   * Handle download image
   */
  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Handle export current configuration as JSON
   */
  const handleExportJSON = () => {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      presetId: currentPresetId,
      slides: slides.map(slide => ({
        id: slide.id,
        enabledModules: slide.enabledModules,
        data: slide.data,
      })),
      freeImage,
      compositionConfig,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `modular-config-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Handle import configuration from JSON
   */
  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle file selection for JSON import
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      // Validate basic structure
      if (!importedData.version || !importedData.slides) {
        throw new Error('Invalid JSON format: missing required fields');
      }

      // Load preset if specified
      if (importedData.presetId) {
        const preset = presets.find((p) => p.id === importedData.presetId);
        if (preset) {
          loadPreset(preset);
        }
      }

      // Import slides data
      const importSlides = useModularStore.getState().importSlides;
      if (importedData.slides && Array.isArray(importedData.slides)) {
        importSlides(importedData.slides);
      }

      // Import composition config if present
      if (importedData.compositionConfig) {
        const setCompositionConfig = useModularStore.getState().setCompositionConfig;
        setCompositionConfig(importedData.compositionConfig);
      }

      // Import free image config if present
      if (importedData.freeImage) {
        const updateFreeImage = useModularStore.getState().updateFreeImage;
        updateFreeImage(importedData.freeImage);
      }

      setError(null);
      console.log('[Modular Editor] Configuration imported successfully');
    } catch (err) {
      console.error('[Modular Editor] Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import JSON file');
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const currentPreset = presets.find((p) => p.id === currentPresetId);

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6 gap-4">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold leading-none">Modular Editor</h1>
              <p className="text-xs text-muted-foreground">
                Build custom social media graphics
              </p>
            </div>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Current Preset Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Preset:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPresetDialog(true)}
              className="gap-2"
            >
              <Settings2 className="h-4 w-4" />
              {currentPreset?.name || 'None'}
            </Button>
            {isDirty && (
              <Badge variant="outline" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Modified
              </Badge>
            )}
          </div>

          <div className="flex-1" />

          {/* Layout Manager Toggle */}
          <Button
            variant={showLayoutManager ? "default" : "outline"}
            size="sm"
            onClick={() => setShowLayoutManager(!showLayoutManager)}
            className="gap-2"
          >
            <Settings2 className="h-4 w-4" />
            Layout Manager
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Import/Export JSON Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportJSON}
            className="gap-2"
            title="Import configuration from JSON"
          >
            <FileJson className="h-4 w-4" />
            Import JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="gap-2"
            title="Export current configuration as JSON"
          >
            <FileJson className="h-4 w-4" />
            Export JSON
          </Button>

          {/* Hidden file input for JSON import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <Separator orientation="vertical" className="h-8" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isDirty && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            )}

            {htmlPreviewUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(htmlPreviewUrl, '_blank')}
                className="gap-2"
              >
                <Code2 className="h-4 w-4" />
                View HTML
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Module Toggles */}
        <div className="w-80 flex-shrink-0 border-r">
          {mounted ? (
            <ModuleSidebar
              enabledModules={getCurrentSlideEnabledModules()}
              onModuleToggle={handleModuleToggle}
              isCarouselMode={isCarouselMode}
            />
          ) : (
            <div className="p-4 space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded" />
              <div className="h-64 bg-muted animate-pulse rounded" />
            </div>
          )}
        </div>

        {/* Center - Form Builder */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="m-4 mb-0 rounded-b-none">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationErrors.map((err, idx) => (
                    <div key={idx} className="text-sm">
                      {err}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="m-4 mb-0 rounded-b-none">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form Builder */}
          <div className="flex-1 overflow-hidden">
            {mounted ? (
              <ModularFormBuilder />
            ) : (
              <div className="flex items-center justify-center h-full p-8">
                <div className="h-16 w-96 bg-muted animate-pulse rounded" />
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="flex-shrink-0 border-t bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Format Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Format:</span>
                <Select
                  value={outputFormat}
                  onValueChange={(value) => setOutputFormat(value as OutputFormat)}
                >
                  <SelectTrigger className="w-24 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quality Selector (for JPEG) */}
              {outputFormat === 'jpeg' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Quality:</span>
                  <Select
                    value={quality.toString()}
                    onValueChange={(value) => setQuality(parseInt(value))}
                  >
                    <SelectTrigger className="w-20 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="90">90</SelectItem>
                      <SelectItem value="80">80</SelectItem>
                      <SelectItem value="70">70</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex-1" />

              {/* Module Count and Carousel Status */}
              {mounted && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-2">
                    <Settings2 className="h-3 w-3" />
                    {getCurrentSlideEnabledModules().length} modules enabled
                  </Badge>
                  {isCarouselMode && (
                    <Badge variant="outline" className="gap-2">
                      <ImageIcon className="h-3 w-3" />
                      {slidesCount} slides
                    </Badge>
                  )}
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !hasModulesEnabled}
                size="lg"
                className="gap-2 min-w-[160px]"
                suppressHydrationWarning
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4" />
                    Generate {isCarouselMode ? 'Carousel' : 'Image'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Preview & Gallery */}
        <div className="w-96 flex-shrink-0 border-l flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Generated Images</h3>
                <Badge variant="outline">
                  {generatedImages.length}
                </Badge>
              </div>
              {generatedImages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearAll}
                  title="Clear all"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Image Gallery */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {generatedImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No images generated yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure modules and click Generate
                  </p>
                </div>
              ) : (
                generatedImages.map((image, index) => (
                  <Card key={`${image.timestamp}-${index}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium truncate">
                          {image.filename}
                        </CardTitle>
                        <Badge variant="secondary" className="ml-2 flex-shrink-0">
                          New
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Preview Image */}
                      <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.filename}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleDownload(image.url, image.filename)}
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Success Indicator */}
          {generatedImages.length > 0 && (
            <div className="flex-shrink-0 border-t p-4 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Last generated {new Date(generatedImages[0].timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preset Selection Dialog */}
      <Dialog open={showPresetDialog} onOpenChange={setShowPresetDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] p-0 bg-white">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Choose a Preset</DialogTitle>
            <DialogDescription>
              Select a starting point for your design. You can customize it further after selection.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6">
            <PresetSelector
              selectedPresetId={currentPresetId}
              onPresetSelect={handlePresetSelect}
              hasUnsavedChanges={isDirty}
              presets={presets}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Layout Manager Dialog */}
      <Dialog open={showLayoutManager} onOpenChange={setShowLayoutManager}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col bg-white">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Layout Manager
            </DialogTitle>
            <DialogDescription>
              Control the composition, ordering, and layering of your modules
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <LayoutManagerPanel />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
