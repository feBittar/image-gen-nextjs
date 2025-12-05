'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/editor/ColorPicker';
import { CarouselUploader } from '@/components/carousel/CarouselUploader';
import { SlidePreviewGrid, CarouselSlide } from '@/components/carousel/SlidePreviewGrid';
import { BatchProgress, SlideStatus } from '@/components/carousel/BatchProgress';
import { GeneratedGallery, GeneratedImage } from '@/components/carousel/GeneratedGallery';
import { Sparkles, Download, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';

export default function CarouselImportPage() {
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [carouselData, setCarouselData] = useState<any>(null);
  const [jsonText, setJsonText] = useState<string>('');
  const [inputMode, setInputMode] = useState<'file' | 'text'>('text');

  // Generation state
  const [highlightColor, setHighlightColor] = useState('#df6457');
  const [highlightColorSecondary, setHighlightColorSecondary] = useState('#ffffff');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideStatuses, setSlideStatuses] = useState<SlideStatus[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Card Gradient settings
  const [gradientColor, setGradientColor] = useState('#000000');
  const [gradientStartOpacity, setGradientStartOpacity] = useState(0.7);
  const [gradientMidOpacity, setGradientMidOpacity] = useState(0.4);
  const [gradientHeight, setGradientHeight] = useState(60);

  // Process JSON data (common function for both file and text input)
  const processJsonData = (text: string) => {
    setFileError('');
    setSlides([]);
    setGeneratedImages([]);
    setSlideStatuses([]);

    try {
      console.log('[CarouselImport] Parsing JSON...');
      const data = JSON.parse(text);
      console.log('[CarouselImport] Parsed data:', data);

      // Validate the JSON structure (supporting both new and legacy formats)
      const slides = data.carousel?.copy?.slides || data.carrossel?.slides;

      if (!slides || !Array.isArray(slides)) {
        const errorMsg = 'Invalid JSON format: expected { "carousel": { "copy": { "slides": [...] } } } or legacy format';
        console.error('[CarouselImport]', errorMsg);
        setFileError(errorMsg);
        return;
      }

      console.log(`[CarouselImport] Found ${slides.length} slides`);

      // Transform AI carousel data to preview slides
      const validatedSlides: CarouselSlide[] = slides.map((slide: any, index: number) => {
        // Validate required fields
        if (!slide.numero) {
          throw new Error(`Slide ${index + 1} is missing required field "numero"`);
        }
        const validEstilos = [
          'stack-img', 'stack-img-bg', 'stack-img reverse', 'stack-img-bg reverse',
          'ff_stack1', 'ff_stack1-b', 'ff_stack2', 'ff_stack2-b',
          'ff_capa'
        ];
        if (!slide.estilo || !validEstilos.includes(slide.estilo)) {
          throw new Error(`Slide ${index + 1} has invalid estilo: ${slide.estilo}`);
        }

        // Create preview slide with first two text fields
        // For ff_capa, use titulo field; for other templates use texto_1/texto_2
        const isFitFeedCapa = slide.estilo === 'ff_capa';
        const text1 = isFitFeedCapa ? (slide.titulo || slide.texto_1 || '') : (slide.texto_1 || '');
        const text2 = isFitFeedCapa ? '' : (slide.texto_2 || '');

        return {
          text1,
          text2,
          layout: slide.estilo,
          imageSrc: '',
          customImageUrl: '', // Initialize empty custom URL
        };
      });

      if (validatedSlides.length === 0) {
        setFileError('No valid slides found in the JSON file');
        return;
      }

      console.log(`[CarouselImport] Validated ${validatedSlides.length} slides successfully`);
      setSlides(validatedSlides);
      setCarouselData(data); // Store the original carousel data for transformation

      // Initialize slide statuses
      const initialStatuses: SlideStatus[] = validatedSlides.map((_, index) => ({
        slideNumber: index + 1,
        status: 'pending',
      }));
      setSlideStatuses(initialStatuses);

    } catch (error) {
      console.error('[CarouselImport] Error processing JSON:', error);
      if (error instanceof SyntaxError) {
        setFileError(`Invalid JSON syntax: ${error.message}`);
      } else if (error instanceof Error) {
        setFileError(error.message);
      } else {
        setFileError('Failed to parse JSON');
      }
      setSlides([]);
    }
  };

  // Handle custom image URL change for a specific slide
  const handleCustomImageChange = (slideIndex: number, imageUrl: string) => {
    setSlides(prevSlides => {
      const newSlides = [...prevSlides];
      newSlides[slideIndex] = {
        ...newSlides[slideIndex],
        customImageUrl: imageUrl
      };
      return newSlides;
    });
    console.log(`[CarouselImport] Custom image set for slide ${slideIndex + 1}:`, imageUrl);
  };

  // Handle file selection and parsing
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    try {
      const text = await file.text();
      processJsonData(text);
    } catch (error) {
      setFileError('Failed to read file');
      setSlides([]);
    }
  };

  // Handle JSON text input
  const handleJsonTextSubmit = () => {
    processJsonData(jsonText);
  };

  // Generate all carousel images
  const handleGenerate = async () => {
    if (slides.length === 0 || !carouselData) return;

    setIsGenerating(true);
    setCurrentSlide(0);
    setGeneratedImages([]);

    try {
      console.log('[Carousel] Step 1: Applying custom images and transforming carousel data...');

      // Apply custom image URLs to carousel data
      const modifiedCarouselData = JSON.parse(JSON.stringify(carouselData)); // Deep clone

      // Create or update photos array with custom URLs
      if (!modifiedCarouselData.carousel.photos) {
        modifiedCarouselData.carousel.photos = [];
      }

      slides.forEach((slide, index) => {
        if (slide.customImageUrl) {
          const slideNumber = index + 1;
          console.log(`[Carousel] Applying custom image for slide ${slideNumber}:`, slide.customImageUrl);

          // Find existing photo entry for this slide
          const existingPhotoIndex = modifiedCarouselData.carousel.photos.findIndex(
            (p: any) => p.slide === slideNumber
          );

          const customPhotoData = {
            photo: {
              src: {
                portrait: slide.customImageUrl,
                landscape: slide.customImageUrl,
                original: slide.customImageUrl,
              },
              dim: { width: 1080, height: 1350 },
              id: Date.now() + index,
              photographer: 'Custom',
              alt: `Custom image for slide ${slideNumber}`,
            },
            slide: slideNumber,
          };

          if (existingPhotoIndex >= 0) {
            // Replace existing photo
            modifiedCarouselData.carousel.photos[existingPhotoIndex] = customPhotoData;
          } else {
            // Add new photo entry
            modifiedCarouselData.carousel.photos.push(customPhotoData);
          }
        }
      });

      console.log('[Carousel] Modified carousel data with custom images:', modifiedCarouselData);

      // Step 1: Transform carousel JSON to layouts
      const transformResponse = await fetch('/api/transform-carousel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...modifiedCarouselData,
          highlightColor: highlightColor,
          highlightColorSecondary: highlightColorSecondary,
          cardGradient: {
            color: gradientColor,
            startOpacity: gradientStartOpacity,
            midOpacity: gradientMidOpacity,
            height: gradientHeight,
            direction: 'to top'
          }
        }),
      });

      if (!transformResponse.ok) {
        const error = await transformResponse.json();
        throw new Error(error.error || 'Failed to transform carousel data');
      }

      const transformResult = await transformResponse.json();
      console.log(`[Carousel] Transformed ${transformResult.count} layouts`);

      // Step 2: Generate images from layouts
      console.log('[Carousel] Step 2: Generating images...');

      const generateResponse = await fetch('/api/generate-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          layouts: transformResult.layouts,
        }),
      });

      if (!generateResponse.ok) {
        const error = await generateResponse.json();
        throw new Error(error.error || 'Failed to generate images');
      }

      const generateResult = await generateResponse.json();
      console.log(`[Carousel] Generated ${generateResult.results.length} images`);

      // Step 3: Process results and update UI
      const newGeneratedImages: GeneratedImage[] = [];

      for (let i = 0; i < generateResult.results.length; i++) {
        const result = generateResult.results[i];
        const slideNumber = i + 1;
        const slide = slides[i];

        // Update current progress
        setCurrentSlide(slideNumber);

        if (result.success && result.url) {
          // Success - use the URL directly
          const imageUrl = result.url;

          // Update status to completed
          setSlideStatuses((prev) =>
            prev.map((s) =>
              s.slideNumber === slideNumber ? { ...s, status: 'completed' } : s
            )
          );

          // Add to generated images
          const generatedImage: GeneratedImage = {
            slideNumber,
            imageUrl,
            status: 'success',
            text1: slide.text1,
          };
          newGeneratedImages.push(generatedImage);
        } else {
          // Error
          const errorMessage = result.error || 'Unknown error';

          // Update status to error
          setSlideStatuses((prev) =>
            prev.map((s) =>
              s.slideNumber === slideNumber
                ? { ...s, status: 'error', error: errorMessage }
                : s
            )
          );

          // Add error to generated images
          const errorImage: GeneratedImage = {
            slideNumber,
            imageUrl: '',
            status: 'error',
            error: errorMessage,
            text1: slide.text1,
          };
          newGeneratedImages.push(errorImage);
        }

        setGeneratedImages([...newGeneratedImages]);
      }

      console.log('[Carousel] Generation complete!');

    } catch (error) {
      console.error('[Carousel] Error during generation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Mark all slides as error
      setSlideStatuses((prev) =>
        prev.map((s) => ({ ...s, status: 'error', error: errorMessage }))
      );

      setFileError(`Generation failed: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download all images as ZIP
  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);

    try {
      const zip = new JSZip();
      const successfulImages = generatedImages.filter((img) => img.status === 'success');

      // Fetch all images and add to ZIP
      for (const image of successfulImages) {
        const response = await fetch(image.imageUrl);
        const blob = await response.blob();
        zip.file(`carousel-slide-${image.slideNumber}.png`, blob);
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carousel-images-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error creating ZIP:', error);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const canGenerate = slides.length > 0 && !isGenerating;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-blue-600" />
          Carousel Import
        </h1>
        <p className="mt-2 text-slate-600">
          Upload a JSON file with carousel data to generate Instagram-style carousel images
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Upload & Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Import JSON Data</CardTitle>
              <CardDescription>
                Upload a file or paste JSON containing your carousel slides
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Toggle between file and text */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setInputMode('text')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    inputMode === 'text'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Paste JSON
                </button>
                <button
                  onClick={() => setInputMode('file')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    inputMode === 'file'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload File
                </button>
              </div>

              {/* File upload mode */}
              {inputMode === 'file' && (
                <CarouselUploader
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  error={fileError}
                />
              )}

              {/* Text input mode */}
              {inputMode === 'text' && (
                <div className="space-y-3">
                  <textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder='Paste your JSON here...'
                    className="w-full h-64 px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <Button
                    onClick={handleJsonTextSubmit}
                    className="w-full"
                    disabled={!jsonText.trim()}
                  >
                    Load JSON
                  </Button>
                  {fileError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm text-red-700">{fileError}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings Card */}
          {slides.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Customization</CardTitle>
                <CardDescription>
                  Adjust the highlight color for your carousel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorPicker
                  label="Cor de Destaque (Light)"
                  color={highlightColor}
                  onChange={setHighlightColor}
                  disabled={isGenerating}
                />

                <ColorPicker
                  label="Cor de Destaque (Dark -b)"
                  color={highlightColorSecondary}
                  onChange={setHighlightColorSecondary}
                  disabled={isGenerating}
                />

                {/* Card Gradient Controls */}
                <div className="space-y-3 pt-2 border-t">
                  <h4 className="text-sm font-medium text-slate-700">Card Gradient Overlay</h4>

                  <ColorPicker
                    label="Gradient Color"
                    color={gradientColor}
                    onChange={setGradientColor}
                    disabled={isGenerating}
                  />

                  <div className="space-y-2">
                    <label className="text-sm text-slate-600">
                      Start Opacity: {gradientStartOpacity.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={gradientStartOpacity}
                      onChange={(e) => setGradientStartOpacity(parseFloat(e.target.value))}
                      disabled={isGenerating}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-600">
                      Mid Opacity: {gradientMidOpacity.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={gradientMidOpacity}
                      onChange={(e) => setGradientMidOpacity(parseFloat(e.target.value))}
                      disabled={isGenerating}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-600">
                      Height: {gradientHeight}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={gradientHeight}
                      onChange={(e) => setGradientHeight(parseInt(e.target.value))}
                      disabled={isGenerating}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Carousel
                      </>
                    )}
                  </Button>
                </div>

                {slides.length > 0 && !isGenerating && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      This will generate {slides.length} image{slides.length !== 1 ? 's' : ''}.
                      The process may take a few minutes.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Preview & Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Slide Preview */}
          {slides.length > 0 && (
            <SlidePreviewGrid
              slides={slides}
              onCustomImageChange={handleCustomImageChange}
            />
          )}

          {/* Progress Indicator */}
          {(isGenerating || slideStatuses.some(s => s.status !== 'pending')) && (
            <BatchProgress
              currentSlide={currentSlide}
              totalSlides={slides.length}
              slideStatuses={slideStatuses}
              isGenerating={isGenerating}
            />
          )}

          {/* Generated Gallery */}
          {generatedImages.length > 0 && (
            <GeneratedGallery
              images={generatedImages}
              onDownloadAll={handleDownloadAll}
              isDownloadingAll={isDownloadingAll}
            />
          )}

          {/* Empty State */}
          {slides.length === 0 && !selectedFile && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-slate-100 p-4 mb-4">
                  <Download className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No carousel data loaded
                </h3>
                <p className="text-sm text-slate-600 max-w-md">
                  Upload a JSON file to get started. Your slides will appear here for preview.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Info Box */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">JSON Format Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-slate-700">
            Your JSON file should follow the AI carousel format with{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-200 text-xs font-mono">carousel.photos</code> and{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-200 text-xs font-mono">carousel.copy.slides</code>:
          </p>
          <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs overflow-x-auto">
{`{
  "carousel": {
    "photos": [
      {
        "photo": {
          "src": { "original": "https://..." },
          "dim": { "width": 4160, "height": 6240 },
          "photographer": "Name",
          "alt": "Description"
        },
        "slide": 1
      }
    ],
    "copy": {
      "slides": [
        {
          "numero": 1,
          "estilo": "stack-img" | "stack-img-bg" | "ff_stack1" | "ff_stack1-b" | "ff_stack2" | "ff_stack2-b",
          "texto_1": "Main text (optional)",
          "texto_2": "Secondary text (optional)",
          "texto_3": "Third text (optional)",
          "texto_4": "Fourth text (optional)",
          "texto_5": "Fifth text (optional)",
          "destaques": {
            "texto_1": ["word to highlight"]
          }
        }
      ]
    }
  }
}`}
          </pre>
          <p className="text-xs text-slate-600 mt-2">
            • Photos are matched to slides by the <code className="px-1 py-0.5 rounded bg-slate-200 font-mono">slide</code> number<br />
            • <strong>stack-img</strong>: white text with bold highlights<br />
            • <strong>stack-img-bg</strong>: colored text with colored highlights
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
