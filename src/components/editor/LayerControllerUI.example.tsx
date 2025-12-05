/**
 * LayerControllerUI Example Usage
 *
 * This file demonstrates how to integrate the LayerControllerUI component
 * into different layout scenarios.
 */

"use client";

import * as React from "react";
import { LayerControllerUI } from "./LayerControllerUI";
import { ModuleSidebar } from "./ModuleSidebar";
import { useModularStore } from "@/lib/store/modularStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// ============================================================================
// EXAMPLE 1: Standalone Layer Controller
// ============================================================================

export function StandaloneLayerControllerExample() {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Layer Control</CardTitle>
          <CardDescription>
            Manage z-index and visibility of enabled modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <LayerControllerUI />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Tabbed Layout Manager
// ============================================================================

export function TabbedLayoutManagerExample() {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Layout Manager</CardTitle>
          <CardDescription>
            Control composition order, layers, and spatial rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="layers" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="layers">Layers</TabsTrigger>
              <TabsTrigger value="order">Render Order</TabsTrigger>
              <TabsTrigger value="rules">Spatial Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="layers" className="h-[500px] mt-4">
              <LayerControllerUI />
            </TabsContent>

            <TabsContent value="order" className="h-[500px] mt-4">
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Render Order Editor (CompositionOrderEditor component)
              </div>
            </TabsContent>

            <TabsContent value="rules" className="h-[500px] mt-4">
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Spatial Rules Editor (SpatialRulesEditor component)
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Split Panel with Module Sidebar
// ============================================================================

export function SplitPanelExample() {
  const enabledModules = useModularStore((state) => state.getCurrentSlideEnabledModules());
  const toggleModule = useModularStore((state) => state.toggleModule);

  const handleModuleToggle = (moduleId: string, enabled: boolean) => {
    toggleModule(moduleId, enabled);
  };

  return (
    <div className="flex h-screen">
      {/* Left: Module Toggle Sidebar */}
      <div className="w-80 border-r">
        <ModuleSidebar
          enabledModules={enabledModules}
          onModuleToggle={handleModuleToggle}
        />
      </div>

      {/* Right: Layer Controller */}
      <div className="w-96 border-r">
        <LayerControllerUI />
      </div>

      {/* Main: Preview/Editor Area */}
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-semibold mb-2">Preview Area</p>
          <p className="text-sm">
            Your modular template preview would render here
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Collapsible Sidebar Layout
// ============================================================================

export function CollapsibleSidebarExample() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="flex h-screen">
      {/* Collapsible Layer Controller Sidebar */}
      {sidebarOpen && (
        <div className="w-96 border-r">
          <LayerControllerUI />
        </div>
      )}

      {/* Main Content with Toggle */}
      <div className="flex-1 flex flex-col">
        <header className="border-b p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-3 py-2 rounded border hover:bg-muted"
          >
            {sidebarOpen ? "Hide" : "Show"} Layers
          </button>
          <h1 className="text-lg font-semibold">Modular Editor</h1>
        </header>

        <main className="flex-1 flex items-center justify-center bg-muted/30">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-semibold mb-2">Editor Area</p>
            <p className="text-sm">
              Toggle the sidebar to access layer controls
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Minimal Integration
// ============================================================================

export function MinimalIntegrationExample() {
  return (
    <div className="h-screen p-8">
      <div className="h-full max-w-md mx-auto border rounded-lg overflow-hidden">
        <LayerControllerUI />
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: With Store Actions Demo
// ============================================================================

export function StoreActionsDemoExample() {
  const compositionConfig = useModularStore((state) => state.compositionConfig);
  const enabledModules = useModularStore((state) => state.getCurrentSlideEnabledModules());
  const setLayerOverride = useModularStore((state) => state.setLayerOverride);
  const resetLayerOverrides = useModularStore((state) => state.resetLayerOverrides);

  const handleSetCustomZIndex = () => {
    // Example: Set text fields to z-index 100
    setLayerOverride("textFields", 100);
  };

  const handleResetOverrides = () => {
    resetLayerOverrides();
  };

  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-2 gap-8">
        {/* Layer Controller */}
        <Card>
          <CardHeader>
            <CardTitle>Layer Controller</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <LayerControllerUI />
            </div>
          </CardContent>
        </Card>

        {/* Debug Info & Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Store Debug Info</CardTitle>
            <CardDescription>Current state and available actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enabled Modules */}
            <div>
              <h3 className="font-semibold mb-2">Enabled Modules:</h3>
              <div className="text-sm text-muted-foreground">
                {enabledModules.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {enabledModules.map((id) => (
                      <li key={id}>{id}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic">No modules enabled</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Z-Index Overrides */}
            <div>
              <h3 className="font-semibold mb-2">Z-Index Overrides:</h3>
              <div className="text-sm text-muted-foreground">
                {compositionConfig?.zIndexOverrides &&
                Object.keys(compositionConfig.zIndexOverrides).length > 0 ? (
                  <ul className="list-disc list-inside">
                    {Object.entries(compositionConfig.zIndexOverrides).map(
                      ([moduleId, zIndex]) => (
                        <li key={moduleId}>
                          {moduleId}: {zIndex}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="italic">No overrides applied</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <h3 className="font-semibold mb-2">Actions:</h3>
              <button
                onClick={handleSetCustomZIndex}
                className="w-full px-3 py-2 text-sm rounded border hover:bg-muted"
              >
                Set textFields z-index to 100
              </button>
              <button
                onClick={handleResetOverrides}
                className="w-full px-3 py-2 text-sm rounded border hover:bg-muted"
              >
                Reset All Overrides
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Responsive Layout
// ============================================================================

export function ResponsiveLayoutExample() {
  return (
    <div className="min-h-screen">
      {/* Desktop: Side-by-side */}
      <div className="hidden lg:flex h-screen">
        <div className="w-96 border-r">
          <LayerControllerUI />
        </div>
        <div className="flex-1 flex items-center justify-center bg-muted/30">
          <p className="text-muted-foreground">Main Editor Area</p>
        </div>
      </div>

      {/* Mobile: Stacked */}
      <div className="lg:hidden">
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Layer Control</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <LayerControllerUI />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/30">
                <p className="text-muted-foreground">Main Editor Area</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
