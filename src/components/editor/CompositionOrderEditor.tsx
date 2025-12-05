'use client';

import React, { useEffect, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModularStore } from '@/lib/store/modularStore';
import { getModule } from '@/lib/modules/registry';
import type { RenderOrderItem } from '@/lib/layout/types';
import { cn } from '@/lib/utils';

/**
 * Structural modules that define the base canvas/container
 * These should NOT be in the render order
 */
const STRUCTURAL_MODULES = ['viewport', 'card'];

/**
 * Overlay modules that sit on top of the content structure
 * These should NOT be in the render order (controlled by z-index in Layers tab)
 */
const OVERLAY_MODULES = ['corners', 'logo', 'freeText', 'svgElements', 'arrowBottomText'];

/**
 * Content modules that are part of the main content flow
 * ONLY these should appear in the render order
 */
const CONTENT_MODULES = ['textFields', 'contentImage', 'bullets', 'imageTextBox'];

/**
 * Check if a module is a content module (not structural or overlay)
 */
function isContentModule(moduleId: string): boolean {
  return CONTENT_MODULES.includes(moduleId);
}

/**
 * SortableItem component for drag & drop
 */
interface SortableItemProps {
  item: RenderOrderItem;
  index: number;
  total: number;
}

function SortableItem({ item, index, total }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id || item.moduleId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get module info
  const moduleInfo = getModule(item.moduleId);
  const displayName = moduleInfo?.name || item.moduleId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-4 border-2 rounded-lg bg-background transition-all',
        isDragging && 'opacity-50 shadow-lg border-primary z-50',
        !isDragging && 'hover:border-primary/40 hover:bg-accent/50'
      )}
    >
      {/* Drag Handle */}
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-6 w-6" />
      </button>

      {/* Order Badge */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
        {index + 1}
      </div>

      {/* Module Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-base truncate">{displayName}</div>
        <div className="text-xs text-muted-foreground">{item.moduleId}</div>
      </div>

      {/* Position Info */}
      <div className="text-xs text-muted-foreground">
        {index === 0 && 'First (Bottom Layer)'}
        {index === total - 1 && 'Last (Top Layer)'}
        {index > 0 && index < total - 1 && `Position ${index + 1}`}
      </div>
    </div>
  );
}

/**
 * CompositionOrderEditor component
 */
export function CompositionOrderEditor() {
  const compositionConfig = useModularStore((state) => state.compositionConfig);
  const updateRenderOrder = useModularStore((state) => state.updateRenderOrder);
  const setCompositionConfig = useModularStore((state) => state.setCompositionConfig);
  const enabledModules = useModularStore((state) => state.getCurrentSlideEnabledModules());

  // Auto-initialize compositionConfig if not set
  useEffect(() => {
    if (!compositionConfig && enabledModules.length > 0) {
      console.log('[CompositionOrderEditor] Auto-initializing render order');

      // Create initial render order from enabled CONTENT modules only (exclude structural)
      const contentModules = enabledModules.filter(isContentModule);
      const initialOrder: RenderOrderItem[] = contentModules.map((moduleId, index) => ({
        id: `${moduleId}-${index}`,
        moduleId,
      }));

      // Set composition config
      setCompositionConfig({
        renderOrder: initialOrder,
        isCustom: false,
      });
    }
  }, [compositionConfig, enabledModules, setCompositionConfig]);

  // Generate items with unique IDs (filter out structural modules)
  const items = useMemo(() => {
    if (!compositionConfig?.renderOrder || compositionConfig.renderOrder.length === 0) {
      return [];
    }

    // Filter to only show content modules (exclude viewport, card, etc)
    return compositionConfig.renderOrder
      .filter((item) => isContentModule(item.moduleId))
      .map((item, index) => ({
        ...item,
        id: item.id || `${item.moduleId}-${index}`,
      }));
  }, [compositionConfig]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const reorderedItems = arrayMove(items, oldIndex, newIndex);
      updateRenderOrder(reorderedItems);
    }
  };

  const handleReset = () => {
    // Reset to default order (alphabetical by module name, content modules only)
    const contentModules = enabledModules.filter(isContentModule);
    const defaultOrder: RenderOrderItem[] = [...contentModules]
      .sort()
      .map((moduleId, index) => ({
        id: `${moduleId}-${index}`,
        moduleId,
      }));

    updateRenderOrder(defaultOrder);
  };

  // Loading state while initializing
  if (!compositionConfig && enabledModules.length > 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Initializing render order...</p>
        </div>
      </div>
    );
  }

  // Get content modules only
  const contentModules = enabledModules.filter(isContentModule);

  // No content modules enabled (only structural/overlay modules)
  if (contentModules.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-2">No content modules enabled</p>
        <p className="text-sm text-muted-foreground mb-4">
          Enable content modules to configure their render order
        </p>
        <div className="max-w-md mx-auto space-y-2">
          <div className="text-xs bg-green-50 border border-green-200 rounded p-3 text-left">
            <strong className="text-green-900">Content Modules (shown here):</strong>
            <div className="text-green-700 mt-1">textFields, contentImage, bullets, imageTextBox</div>
          </div>
          {enabledModules.length > 0 && (
            <div className="text-xs bg-blue-50 border border-blue-200 rounded p-3 text-left">
              <strong className="text-blue-900">Not shown:</strong>
              <div className="text-blue-700 mt-1">
                • Structural: viewport, card (define the canvas)<br />
                • Overlay: corners, logo, freeText, svgElements, arrowBottomText (controlled in Layers tab)
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // No items in render order (shouldn't happen with auto-init, but fallback)
  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-2">No render order configured</p>
        <p className="text-sm text-muted-foreground">
          The render order is empty. Try resetting or reloading.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Render Order</h3>
          <p className="text-sm text-muted-foreground">
            Drag modules to change the order they appear in the final image
          </p>
        </div>
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Order
        </Button>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
        <p className="text-sm text-blue-900">
          <strong>How it works:</strong> Items at the <strong>top</strong> render first (behind),
          items at the <strong>bottom</strong> render last (in front). Drag items up or down to reorder.
        </p>
        <p className="text-xs text-blue-700 border-t border-blue-200 pt-2">
          <strong>Only content modules shown:</strong> textFields, contentImage, bullets, imageTextBox<br />
          <strong>Not shown:</strong> Structural (viewport, card) and Overlay modules (corners, logo, etc.) -
          use the Layers tab to control their z-index.
        </p>
      </div>

      {/* Sortable List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id || item.moduleId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {items.map((item, index) => (
              <SortableItem
                key={item.id || item.moduleId}
                item={item}
                index={index}
                total={items.length}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Footer Info */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md space-y-1">
        <p>
          <strong>Total modules:</strong> {items.length}
        </p>
        <p>
          <strong>Tip:</strong> Hold and drag the grip icon to reorder modules
        </p>
      </div>
    </div>
  );
}
