"use client"

import React, { useState } from 'react';
import { useModularStore } from '@/lib/store/modularStore';
import { LAYOUT_PRESETS, listLayoutPresets } from '@/lib/layout/presets';
import type { LayoutPresetDefinition } from '@/lib/layout/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CompositionOrderEditor } from './CompositionOrderEditor';
import { LayerControllerUI } from './LayerControllerUI';
import { SpatialRulesEditor } from './SpatialRulesEditor';

export function LayoutManagerPanel() {
  const [activeTab, setActiveTab] = useState<'order' | 'layers' | 'rules' | 'presets'>('order');

  const compositionConfig = useModularStore(state => state.compositionConfig);
  const loadLayoutPreset = useModularStore(state => state.loadLayoutPreset);
  const resetLayoutToDefault = useModularStore(state => state.resetLayoutToDefault);
  const clearLayout = useModularStore(state => state.clearLayout);

  const presets = listLayoutPresets();

  const handleApplyPreset = (presetId: string) => {
    loadLayoutPreset(presetId);
  };

  const handleResetToDefault = () => {
    resetLayoutToDefault();
  };

  const handleClearLayout = () => {
    clearLayout();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Action Bar */}
      <div className="flex items-center justify-end gap-2 px-6 py-3 border-b bg-muted/30">
        {compositionConfig && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearLayout}
          >
            Clear Layout
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetToDefault}
        >
          Reset to Default
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'order' | 'layers' | 'rules' | 'presets')}
          className="h-full flex flex-col"
        >
          <TabsList className="mx-6 mt-4 w-auto">
            <TabsTrigger value="order">Order</TabsTrigger>
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>

          {/* Order Tab */}
          <TabsContent value="order" className="flex-1 overflow-auto px-6 pb-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Define the rendering order of modules in the composition.
              </div>
              <CompositionOrderEditor />
            </div>
          </TabsContent>

          {/* Layers Tab */}
          <TabsContent value="layers" className="flex-1 overflow-auto px-6 pb-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Control z-index and layer visibility for overlapping elements.
              </div>
              <LayerControllerUI />
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="flex-1 overflow-auto px-6 pb-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Create spatial positioning rules between modules.
              </div>
              <SpatialRulesEditor />
            </div>
          </TabsContent>

          {/* Presets Tab */}
          <TabsContent value="presets" className="flex-1 overflow-auto px-6 pb-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Choose from pre-configured layout presets or customize your own.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presets.map((preset) => (
                  <Card
                    key={preset.id}
                    className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base group-hover:text-primary transition-colors">
                            {preset.name}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {preset.description}
                          </CardDescription>
                        </div>
                        {compositionConfig?.presetId === preset.id && (
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            Active
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button
                        size="sm"
                        variant={compositionConfig?.presetId === preset.id ? "secondary" : "outline"}
                        className="w-full"
                        onClick={() => handleApplyPreset(preset.id)}
                      >
                        {compositionConfig?.presetId === preset.id ? 'Applied' : 'Apply'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!compositionConfig && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      i
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-900">
                        No Layout Preset Active
                      </h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Modules are currently rendering in their default z-index order. Select a preset to apply custom composition.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {compositionConfig?.isCustom && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
                      !
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-amber-900">
                        Custom Configuration Active
                      </h4>
                      <p className="text-xs text-amber-700 mt-1">
                        You are using a custom layout configuration. Select a preset to reset or continue editing in the Order/Layers tabs.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default LayoutManagerPanel;
