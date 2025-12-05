"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LayerController } from "@/lib/layout/LayerController";
import { useModularStore } from "@/lib/store/modularStore";
import { getModule } from "@/lib/modules/registry";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GripVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Layers,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface LayerItem {
  id: string;
  moduleId: string;
  displayName: string;
  zIndex: number;
  visible: boolean;
  locked?: boolean;
}

// ============================================================================
// SORTABLE LAYER ITEM
// ============================================================================

interface SortableLayerItemProps {
  layer: LayerItem;
  onZIndexChange: (moduleId: string, zIndex: number) => void;
  onVisibilityToggle: (moduleId: string, visible: boolean) => void;
  onMoveUp: (moduleId: string) => void;
  onMoveDown: (moduleId: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

function SortableLayerItem({
  layer,
  onZIndexChange,
  onVisibilityToggle,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: SortableLayerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [zIndexInput, setZIndexInput] = React.useState(layer.zIndex.toString());

  // Sync input with layer zIndex when it changes externally
  React.useEffect(() => {
    setZIndexInput(layer.zIndex.toString());
  }, [layer.zIndex]);

  const handleZIndexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZIndexInput(e.target.value);
  };

  const handleZIndexInputBlur = () => {
    const parsed = parseInt(zIndexInput, 10);
    if (!isNaN(parsed)) {
      onZIndexChange(layer.moduleId, parsed);
    } else {
      // Revert to current value if invalid
      setZIndexInput(layer.zIndex.toString());
    }
  };

  const handleZIndexInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleZIndexInputBlur();
      e.currentTarget.blur();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border-2 p-3 transition-all bg-background",
        isDragging
          ? "border-[#E64A19] shadow-lg opacity-50 z-50"
          : "border-border hover:border-[#E64A19]/40"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "cursor-grab active:cursor-grabbing text-muted-foreground hover:text-[#E64A19] transition-colors",
            layer.locked && "opacity-30 cursor-not-allowed"
          )}
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Module Name */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">
            {layer.displayName}
          </div>
          <div className="text-xs text-muted-foreground">
            {layer.moduleId}
          </div>
        </div>

        {/* Z-Index Input */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground whitespace-nowrap">
            Z-Index:
          </label>
          <input
            type="number"
            value={zIndexInput}
            onChange={handleZIndexInputChange}
            onBlur={handleZIndexInputBlur}
            onKeyDown={handleZIndexInputKeyDown}
            className={cn(
              "w-16 h-8 px-2 text-sm rounded border-2 border-border bg-background text-foreground",
              "focus:outline-none focus:border-[#E64A19] transition-colors"
            )}
          />
          <Badge className="h-6 px-2 text-xs bg-[#E64A19]/10 text-[#E64A19] border border-[#E64A19]/30">
            {layer.zIndex}
          </Badge>
        </div>

        {/* Visibility Toggle */}
        <button
          onClick={() => onVisibilityToggle(layer.moduleId, !layer.visible)}
          className={cn(
            "p-2 rounded-md transition-colors",
            layer.visible
              ? "text-foreground hover:bg-muted"
              : "text-muted-foreground hover:bg-muted"
          )}
          title={layer.visible ? "Hide layer" : "Show layer"}
        >
          {layer.visible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </button>

        {/* Move Up/Down Buttons */}
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => onMoveUp(layer.moduleId)}
            disabled={isFirst || layer.locked}
            className={cn(
              "p-1 rounded transition-colors",
              isFirst || layer.locked
                ? "text-muted-foreground/30 cursor-not-allowed"
                : "text-muted-foreground hover:text-[#E64A19] hover:bg-muted"
            )}
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => onMoveDown(layer.moduleId)}
            disabled={isLast || layer.locked}
            className={cn(
              "p-1 rounded transition-colors",
              isLast || layer.locked
                ? "text-muted-foreground/30 cursor-not-allowed"
                : "text-muted-foreground hover:text-[#E64A19] hover:bg-muted"
            )}
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Locked Badge */}
      {layer.locked && (
        <div className="absolute -top-2 -left-2">
          <Badge className="h-5 px-2 text-[10px] font-bold bg-amber-500 hover:bg-amber-500 text-white border-0 shadow-md">
            LOCKED
          </Badge>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface LayerControllerUIProps {
  className?: string;
}

export function LayerControllerUI({ className }: LayerControllerUIProps) {
  const compositionConfig = useModularStore((state) => state.compositionConfig);
  const enabledModules = useModularStore((state) => state.getCurrentSlideEnabledModules());
  const setLayerOverride = useModularStore((state) => state.setLayerOverride);
  const resetLayerOverrides = useModularStore(
    (state) => state.resetLayerOverrides
  );

  // Initialize LayerController
  const layerController = React.useMemo(() => {
    const controller = new LayerController(
      compositionConfig?.zIndexOverrides || {}
    );
    controller.initializeLayers(enabledModules);
    return controller;
  }, [compositionConfig?.zIndexOverrides, enabledModules]);

  // Get layers in visual order (highest z-index = top of list)
  const [layers, setLayers] = React.useState<LayerItem[]>(() => {
    const layerConfigs = layerController.getLayersVisualOrder();
    return layerConfigs.map((layer, index) => ({
      id: `layer-${layer.moduleId}-${index}`,
      moduleId: layer.moduleId,
      displayName: layer.displayName || layer.moduleId,
      zIndex: layer.zIndex,
      visible: layer.visible,
      locked: layer.locked,
    }));
  });

  // Update layers when composition config or enabled modules change
  React.useEffect(() => {
    const layerConfigs = layerController.getLayersVisualOrder();
    setLayers(
      layerConfigs.map((layer, index) => ({
        id: `layer-${layer.moduleId}-${index}`,
        moduleId: layer.moduleId,
        displayName: layer.displayName || layer.moduleId,
        zIndex: layer.zIndex,
        visible: layer.visible,
        locked: layer.locked,
      }))
    );
  }, [compositionConfig?.zIndexOverrides, enabledModules, layerController]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLayers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        // Move in array (visual order)
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Recalculate z-index based on new visual order
        // Higher index in visual array = higher z-index
        const updates: Array<{ moduleId: string; zIndex: number }> = [];
        newItems.forEach((item, index) => {
          const newZIndex = (newItems.length - 1 - index) * 10;
          item.zIndex = newZIndex;
          updates.push({ moduleId: item.moduleId, zIndex: newZIndex });
        });

        // Apply z-index updates to store after state update
        setTimeout(() => {
          updates.forEach(({ moduleId, zIndex }) => {
            setLayerOverride(moduleId, zIndex);
          });
        }, 0);

        return newItems;
      });
    }
  };

  // Handle z-index change
  const handleZIndexChange = (moduleId: string, zIndex: number) => {
    setLayerOverride(moduleId, zIndex);
    setLayers((items) =>
      items
        .map((item) =>
          item.moduleId === moduleId ? { ...item, zIndex } : item
        )
        .sort((a, b) => b.zIndex - a.zIndex) // Re-sort by z-index (desc)
    );
  };

  // Handle visibility toggle
  const handleVisibilityToggle = (moduleId: string, visible: boolean) => {
    layerController.setVisibility(moduleId, visible);
    setLayers((items) =>
      items.map((item) =>
        item.moduleId === moduleId ? { ...item, visible } : item
      )
    );
  };

  // Handle move up (increase z-index in visual order)
  const handleMoveUp = (moduleId: string) => {
    setLayers((items) => {
      const currentIndex = items.findIndex((item) => item.moduleId === moduleId);
      if (currentIndex === 0) return items; // Already at top

      // Swap with previous item
      const newItems = [...items];
      [newItems[currentIndex - 1], newItems[currentIndex]] = [
        newItems[currentIndex],
        newItems[currentIndex - 1],
      ];

      // Recalculate z-index
      const updates: Array<{ moduleId: string; zIndex: number }> = [];
      newItems.forEach((item, index) => {
        const newZIndex = (newItems.length - 1 - index) * 10;
        item.zIndex = newZIndex;
        updates.push({ moduleId: item.moduleId, zIndex: newZIndex });
      });

      // Apply z-index updates to store after state update
      setTimeout(() => {
        updates.forEach(({ moduleId, zIndex }) => {
          setLayerOverride(moduleId, zIndex);
        });
      }, 0);

      return newItems;
    });
  };

  // Handle move down (decrease z-index in visual order)
  const handleMoveDown = (moduleId: string) => {
    setLayers((items) => {
      const currentIndex = items.findIndex((item) => item.moduleId === moduleId);
      if (currentIndex === items.length - 1) return items; // Already at bottom

      // Swap with next item
      const newItems = [...items];
      [newItems[currentIndex], newItems[currentIndex + 1]] = [
        newItems[currentIndex + 1],
        newItems[currentIndex],
      ];

      // Recalculate z-index
      const updates: Array<{ moduleId: string; zIndex: number }> = [];
      newItems.forEach((item, index) => {
        const newZIndex = (newItems.length - 1 - index) * 10;
        item.zIndex = newZIndex;
        updates.push({ moduleId: item.moduleId, zIndex: newZIndex });
      });

      // Apply z-index updates to store after state update
      setTimeout(() => {
        updates.forEach(({ moduleId, zIndex }) => {
          setLayerOverride(moduleId, zIndex);
        });
      }, 0);

      return newItems;
    });
  };

  // Handle reset all
  const handleResetAll = () => {
    resetLayerOverrides();
    // Re-initialize layers from defaults
    const layerConfigs = layerController.getLayersVisualOrder();
    setLayers(
      layerConfigs.map((layer, index) => ({
        id: `layer-${layer.moduleId}-${index}`,
        moduleId: layer.moduleId,
        displayName: layer.displayName || layer.moduleId,
        zIndex: layerController.getDefaultZIndex(layer.moduleId),
        visible: layer.visible,
        locked: layer.locked,
      }))
    );
  };

  if (enabledModules.length === 0) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="flex items-center justify-center h-full text-center p-8">
          <div>
            <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No modules enabled. Enable modules to manage layers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-[#E64A19]/20 p-4 bg-gradient-to-r from-[#E64A19]/5 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#E64A19]" />
            <h2 className="text-lg font-bold text-[#E64A19]">Layer Control</h2>
          </div>
          <Button
            onClick={handleResetAll}
            variant="outline"
            size="sm"
            className="h-8 border-[#E64A19]/30 hover:bg-[#E64A19]/10 hover:border-[#E64A19]"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset All
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Drag to reorder, edit z-index, or toggle visibility
        </p>
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={layers.map((layer) => layer.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {layers.map((layer, index) => (
                  <SortableLayerItem
                    key={layer.id}
                    layer={layer}
                    onZIndexChange={handleZIndexChange}
                    onVisibilityToggle={handleVisibilityToggle}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    isFirst={index === 0}
                    isLast={index === layers.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="flex-shrink-0 border-t p-4 bg-muted/30">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Tip:</strong> Higher z-index values appear on top. Drag
            items to reorder visually.
          </p>
          <div className="flex items-center gap-1">
            <Badge className="h-4 px-1.5 text-[9px] bg-[#E64A19]/10 text-[#E64A19] border border-[#E64A19]/30">
              {layers.length}
            </Badge>
            layer{layers.length !== 1 ? "s" : "" } total
          </div>
        </div>
      </div>
    </div>
  );
}
