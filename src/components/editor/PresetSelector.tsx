'use client';

import * as React from 'react';
import { Check, Grid3x3, List, Package, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplatePreset } from '@/lib/modules/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// ============================================================================
// TYPES
// ============================================================================

export interface PresetSelectorProps {
  /** Currently selected preset ID (null if custom/none) */
  selectedPresetId: string | null;

  /** Callback when a preset is selected */
  onPresetSelect: (presetId: string) => void;

  /** Whether there are unsaved changes in the current configuration */
  hasUnsavedChanges?: boolean;

  /** Array of available presets to display */
  presets: TemplatePreset[];

  /** Optional className for the container */
  className?: string;
}

type ViewMode = 'grid' | 'list';

interface PendingSelection {
  presetId: string;
  preset: TemplatePreset;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PresetSelector({
  selectedPresetId,
  onPresetSelect,
  hasUnsavedChanges = false,
  presets,
  className,
}: PresetSelectorProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [pendingSelection, setPendingSelection] = React.useState<PendingSelection | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  /**
   * Handle preset card click
   * Shows confirmation dialog if there are unsaved changes
   */
  const handlePresetClick = (preset: TemplatePreset) => {
    // If clicking the already selected preset, do nothing
    if (preset.id === selectedPresetId) {
      return;
    }

    // If there are unsaved changes, show confirmation dialog
    if (hasUnsavedChanges) {
      setPendingSelection({ presetId: preset.id, preset });
      setDialogOpen(true);
    } else {
      // Otherwise, directly select the preset
      onPresetSelect(preset.id);
    }
  };

  /**
   * Confirm preset change (from dialog)
   */
  const handleConfirmChange = () => {
    if (pendingSelection) {
      onPresetSelect(pendingSelection.presetId);
      setPendingSelection(null);
      setDialogOpen(false);
    }
  };

  /**
   * Cancel preset change
   */
  const handleCancelChange = () => {
    setPendingSelection(null);
    setDialogOpen(false);
  };

  return (
    <>
      <div className={cn('flex flex-col gap-4', className)}>
        {/* Header with view mode toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Choose a Preset</h3>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Preset cards/list */}
        <ScrollArea className="h-[calc(100vh-16rem)]">
          {presets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">No presets available</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {presets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  isSelected={preset.id === selectedPresetId}
                  onClick={() => handlePresetClick(preset)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {presets.map((preset) => (
                <PresetListItem
                  key={preset.id}
                  preset={preset}
                  isSelected={preset.id === selectedPresetId}
                  onClick={() => handlePresetClick(preset)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Unsaved Changes
            </DialogTitle>
            <DialogDescription>
              You have unsaved changes in your current configuration. Switching to a
              different preset will discard these changes.
            </DialogDescription>
          </DialogHeader>

          {pendingSelection && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-2">
                Switch to preset:
              </p>
              <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/30">
                <div className="flex-1">
                  <p className="font-medium">{pendingSelection.preset.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {pendingSelection.preset.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelChange}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmChange}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================================================
// PRESET CARD (Grid View)
// ============================================================================

interface PresetCardProps {
  preset: TemplatePreset;
  isSelected: boolean;
  onClick: () => void;
}

function PresetCard({ preset, isSelected, onClick }: PresetCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]',
        isSelected && 'ring-2 ring-primary shadow-md'
      )}
      onClick={onClick}
    >
      {/* Thumbnail or placeholder */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 rounded-t-lg overflow-hidden">
        {preset.thumbnail ? (
          <img
            src={preset.thumbnail}
            alt={`${preset.name} preview`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1.5">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-base">{preset.name}</CardTitle>
        <CardDescription className="text-xs line-clamp-2">
          {preset.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1">
          {preset.defaultModules.slice(0, 3).map((moduleId) => (
            <Badge key={moduleId} variant="secondary" className="text-xs px-2 py-0">
              {moduleId}
            </Badge>
          ))}
          {preset.defaultModules.length > 3 && (
            <Badge variant="outline" className="text-xs px-2 py-0">
              +{preset.defaultModules.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PRESET LIST ITEM (List View)
// ============================================================================

interface PresetListItemProps {
  preset: TemplatePreset;
  isSelected: boolean;
  onClick: () => void;
}

function PresetListItem({ preset, isSelected, onClick }: PresetListItemProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary shadow-sm'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4 p-4">
        {/* Thumbnail or placeholder */}
        <div className="relative w-24 h-32 flex-shrink-0 bg-gradient-to-br from-muted to-muted/50 rounded-md overflow-hidden">
          {preset.thumbnail ? (
            <img
              src={preset.thumbnail}
              alt={`${preset.name} preview`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}

          {/* Selected indicator */}
          {isSelected && (
            <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full p-1">
              <Check className="h-3 w-3" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-base mb-1">{preset.name}</h4>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {preset.description}
          </p>

          {/* Module badges */}
          <div className="flex flex-wrap gap-1.5">
            {preset.defaultModules.map((moduleId) => (
              <Badge key={moduleId} variant="secondary" className="text-xs px-2 py-0.5">
                {moduleId}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
