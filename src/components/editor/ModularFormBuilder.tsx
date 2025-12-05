'use client';

import * as React from 'react';
import { useModularStore, useIsCarouselMode, useCurrentSlideIndex } from '@/lib/store/modularStore';
import { getModule, sortModulesByZIndex } from '@/lib/modules/registry';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SlideTabBar } from '@/components/editor/SlideTabBar';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface ModularFormBuilderProps {
  className?: string;
}

/**
 * ModularFormBuilder - Renders forms for all enabled modules in a tab interface
 *
 * Features:
 * - Renders forms only for enabled modules
 * - Tab interface for easy navigation
 * - Forms get/set data via useModularStore
 * - Shows validation errors from module schemas
 * - Modules ordered by z-index for logical flow
 * - Multi-slide support with shared modules (viewport, card)
 * - FreeImageForm section for carousel mode (2+ slides)
 */
export function ModularFormBuilder({ className }: ModularFormBuilderProps) {
  // Store state
  const currentSlideIndex = useCurrentSlideIndex();
  const slides = useModularStore((state) => state.slides);
  const isCarouselMode = useIsCarouselMode();
  const validationErrors = useModularStore((state) => state.validationErrors);
  const activeModuleTab = useModularStore((state) => state.activeModuleTab);
  const setActiveModuleTab = useModularStore((state) => state.setActiveModuleTab);
  const updateSlideModule = useModularStore((state) => state.updateCurrentSlideModule);

  // Get current slide
  const currentSlide = React.useMemo(() => {
    if (!slides || slides.length === 0) return null;
    if (currentSlideIndex < 0 || currentSlideIndex >= slides.length) return null;
    return slides[currentSlideIndex];
  }, [slides, currentSlideIndex]);

  // Get enabled modules for current slide (all modules are per-slide now)
  const enabledModules = React.useMemo(() => {
    if (!currentSlide) return [];
    return currentSlide.enabledModules || [];
  }, [currentSlide]);

  // Get module definitions for enabled modules
  const enabledModuleDefinitions = React.useMemo(() => {
    const modules = enabledModules
      .map((id) => getModule(id))
      .filter((m): m is NonNullable<typeof m> => m !== undefined);

    // Sort by z-index for logical flow (background to foreground)
    return sortModulesByZIndex(modules);
  }, [enabledModules]);

  // Set initial active tab if none selected
  React.useEffect(() => {
    if (enabledModuleDefinitions.length > 0 && !activeModuleTab) {
      setActiveModuleTab(enabledModuleDefinitions[0].id);
    }
  }, [enabledModuleDefinitions, activeModuleTab, setActiveModuleTab]);

  // If no modules enabled, show empty state
  if (enabledModuleDefinitions.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-full p-8', className)}>
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Nenhum Módulo Ativado</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Ative módulos no painel de configuração para começar a criar seu design.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Helper: Get the correct data source for a module (always from current slide)
  const getModuleDataSource = (moduleId: string): Record<string, any> => {
    if (!currentSlide) return {};
    return currentSlide.data[moduleId] || {};
  };

  // Helper: Update module data (always updates current slide)
  const updateModuleInCorrectLocation = (moduleId: string, data: Partial<any>): void => {
    updateSlideModule(moduleId, data);
  };

  // Create mock watch/setValue functions for form integration
  const createFormProps = (moduleId: string) => {
    // Helper to get nested value from object using path like "corners.0.type"
    const getNestedValue = (obj: any, path: string): any => {
      const parts = path.split('.');
      let current = obj;
      for (const part of parts) {
        if (current === undefined || current === null) return undefined;
        // Handle array access (numeric keys)
        if (Array.isArray(current) && /^\d+$/.test(part)) {
          current = current[parseInt(part, 10)];
        } else {
          current = current[part];
        }
      }
      return current;
    };

    // Helper to set nested value in object (mutates)
    const setNestedValue = (obj: any, path: string, value: any): void => {
      const parts = path.split('.');
      let current = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const nextPart = parts[i + 1];

        // If next part is numeric, ensure current[part] is an array
        if (/^\d+$/.test(nextPart)) {
          if (!Array.isArray(current[part])) {
            current[part] = [];
          }
        } else if (!current[part] || typeof current[part] !== 'object') {
          current[part] = {};
        }

        // Handle array access
        if (Array.isArray(current) && /^\d+$/.test(part)) {
          current = current[parseInt(part, 10)];
        } else {
          current = current[part];
        }
      }

      const lastPart = parts[parts.length - 1];
      if (Array.isArray(current) && /^\d+$/.test(lastPart)) {
        current[parseInt(lastPart, 10)] = value;
      } else {
        current[lastPart] = value;
      }
    };

    return {
      // watch function - returns field value or entire module data
      watch: ((field?: string) => {
        const data = getModuleDataSource(moduleId);

        if (!field) {
          // Return form data with module data nested under module ID
          // This matches how CardForm expects: watch('card') returns card data
          return { [moduleId]: data };
        }

        // If field is just module ID, check if there's a nested property with same name first
        // This handles modules like svgElements where data = {svgElements: [...]}
        if (field === moduleId) {
          const nestedValue = getNestedValue(data, field);
          if (nestedValue !== undefined) {
            return nestedValue;
          }
          return data;
        }

        // Get nested value from module data directly
        // Fields like "corners.0.type" should access data.corners[0].type
        return getNestedValue(data, field);
      }) as any,

      // setValue function - updates module data in store
      setValue: ((field: string, value: any) => {
        // If field equals moduleId, replace entire module data
        // This handles: setValue('viewport', {...viewportData})
        if (field === moduleId) {
          updateModuleInCorrectLocation(moduleId, value);
          return;
        }

        const currentData = getModuleDataSource(moduleId);

        // Deep clone and set nested value
        const nestedData = JSON.parse(JSON.stringify(currentData));
        setNestedValue(nestedData, field, value);
        updateModuleInCorrectLocation(moduleId, nestedData);
      }) as any,

      // Optional fieldPrefix for compatibility
      fieldPrefix: moduleId,
    };
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Slide Tab Bar - Always visible */}
      <SlideTabBar />

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mx-4 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validationErrors.map((error, index) => (
                <div key={index} className="text-sm">
                  {error}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Module Tabs */}
      <Tabs
        value={activeModuleTab || enabledModuleDefinitions[0]?.id}
        onValueChange={setActiveModuleTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Tab List */}
        <div className="border-b px-4 pt-4">
          <ScrollArea className="w-full">
            <TabsList className="w-full justify-start">
              {enabledModuleDefinitions.map((module) => {
                const Icon = module.icon;
                return (
                  <TabsTrigger
                    key={module.id}
                    value={module.id}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{module.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </ScrollArea>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-hidden">
          {enabledModuleDefinitions.map((module) => {
            const FormComponent = module.FormComponent;
            const formProps = createFormProps(module.id);

            return (
              <TabsContent
                key={module.id}
                value={module.id}
                className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col"
              >
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-4 py-6">
                    {/* Module Description */}
                    <div className="text-sm text-muted-foreground">
                      {module.description}
                    </div>

                    {/* Module Form */}
                    <FormComponent {...formProps} />
                  </div>
                </ScrollArea>
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
    </div>
  );
}
