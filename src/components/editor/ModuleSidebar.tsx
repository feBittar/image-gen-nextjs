"use client";

import * as React from "react";
import {
  listModules,
  getModulesByCategory,
  checkDependencies,
  checkConflicts,
} from "@/lib/modules/registry";
import { ModuleCategory } from "@/lib/modules/types";
import { cn } from "@/lib/utils";
import {
  getModuleInstances,
  getBaseModuleId,
  getInstanceDisplayNumber,
} from "@/lib/modules/moduleInstanceUtils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronRight, Image as ImageIcon, Plus, X } from "lucide-react";
import { FreeImageForm } from "@/components/editor/FreeImageForm";
import { useModularStore } from "@/lib/store/modularStore";

// ============================================================================
// PROPS INTERFACE
// ============================================================================

export interface ModuleSidebarProps {
  /** List of currently enabled module IDs */
  enabledModules: string[];

  /** Callback when a module is toggled on/off */
  onModuleToggle: (moduleId: string, enabled: boolean) => void;

  /** Optional callback to scroll to module form when clicking module name */
  onModuleSelect?: (moduleId: string) => void;

  /** Whether in carousel mode (2+ slides) - shows free image section */
  isCarouselMode?: boolean;

  /** Optional className for styling */
  className?: string;
}

// ============================================================================
// CATEGORY METADATA
// ============================================================================

const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  layout: "Layout",
  content: "Content",
  overlay: "Overlay",
  special: "Special",
};

const CATEGORY_DESCRIPTIONS: Record<ModuleCategory, string> = {
  layout: "Base structure and viewport settings",
  content: "Text, images, and main content elements",
  overlay: "Decorative elements and overlays",
  special: "Advanced modules with special behaviors",
};

const CATEGORY_ORDER: ModuleCategory[] = ["layout", "content", "overlay", "special"];

// ============================================================================
// MODULE ITEM COMPONENT
// ============================================================================

interface ModuleItemProps {
  moduleId: string;
  moduleName: string;
  moduleDescription: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  hasWarnings: boolean;
  warningMessages: string[];
  onToggle: (enabled: boolean) => void;
  onSelect?: () => void;
}

// Orange-red accent color for this page
const ACCENT_COLOR = "#E64A19"; // Burnt orange-red

function ModuleItem({
  moduleId,
  moduleName,
  moduleDescription,
  icon: Icon,
  enabled,
  hasWarnings,
  warningMessages,
  onToggle,
  onSelect,
}: ModuleItemProps) {
  return (
    <div
      className={cn(
        "group relative rounded-lg border-2 p-3 transition-all bg-background",
        enabled
          ? "border-[#E64A19]"
          : "border-border hover:border-[#E64A19]/40"
      )}
    >
      {/* Main row: icon, name, switch */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "mt-0.5 flex-shrink-0 transition-colors",
            enabled ? "text-[#E64A19]" : "text-muted-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Name and description */}
        <div className="flex-1 min-w-0">
          <button
            onClick={onSelect}
            className={cn(
              "text-sm font-medium text-left transition-colors",
              onSelect && "hover:text-[#E64A19] cursor-pointer",
              enabled ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {moduleName}
          </button>
          <p
            className={cn(
              "text-xs mt-0.5 line-clamp-2",
              enabled ? "text-muted-foreground" : "text-muted-foreground/70"
            )}
          >
            {moduleDescription}
          </p>
        </div>

        {/* Toggle switch - Custom styled with orange-red and visible thumb */}
        <div
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={cn(
            "relative flex-shrink-0 h-7 w-12 rounded-full cursor-pointer transition-colors border-2",
            enabled
              ? "bg-[#E64A19] border-[#E64A19]"
              : "bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600"
          )}
        >
          {/* Thumb (the circle) */}
          <div
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200",
              enabled ? "translate-x-[22px]" : "translate-x-0.5"
            )}
          />
        </div>
      </div>

      {/* Warnings (dependencies/conflicts) */}
      {hasWarnings && enabled && (
        <div className="mt-2 pt-2 border-t border-[#E64A19]/30">
          {warningMessages.map((warning, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-500"
            >
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Enabled badge */}
      {enabled && (
        <div className="absolute -top-2 -right-2">
          <Badge
            className="h-5 px-2 text-[10px] font-bold bg-[#E64A19] hover:bg-[#E64A19] text-white border-0 shadow-md"
          >
            ON
          </Badge>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MULTI-INSTANCE MODULE ITEM COMPONENT
// ============================================================================

interface MultiInstanceModuleItemProps {
  moduleId: string;
  moduleName: string;
  moduleDescription: string;
  icon: React.ComponentType<{ className?: string }>;
  instances: string[];
  onAddInstance: () => void;
  onRemoveInstance: (instanceId: string) => void;
  onSelect?: (instanceId: string) => void;
}

function MultiInstanceModuleItem({
  moduleId,
  moduleName,
  moduleDescription,
  icon: Icon,
  instances,
  onAddInstance,
  onRemoveInstance,
  onSelect,
}: MultiInstanceModuleItemProps) {
  const hasInstances = instances.length > 0;

  return (
    <div className="space-y-2">
      {/* Module header */}
      <div
        className={cn(
          "group relative rounded-lg border-2 p-3 transition-all bg-background",
          hasInstances
            ? "border-[#E64A19]"
            : "border-border hover:border-[#E64A19]/40"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "mt-0.5 flex-shrink-0 transition-colors",
              hasInstances ? "text-[#E64A19]" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Name and description */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">
              {moduleName}
            </div>
            <p className="text-xs mt-0.5 text-muted-foreground line-clamp-2">
              {moduleDescription}
            </p>
          </div>

          {/* Add button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onAddInstance}
            className="h-7 w-7 p-0 text-[#E64A19] hover:bg-[#E64A19]/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Instance count badge */}
        {hasInstances && (
          <div className="absolute -top-2 -right-2">
            <Badge
              className="h-5 px-2 text-[10px] font-bold bg-[#E64A19] hover:bg-[#E64A19] text-white border-0 shadow-md"
            >
              {instances.length}
            </Badge>
          </div>
        )}
      </div>

      {/* Instance list */}
      {hasInstances && (
        <div className="pl-8 space-y-1">
          {instances.map((instanceId) => {
            const displayNumber = getInstanceDisplayNumber(instanceId);
            return (
              <div
                key={instanceId}
                className="flex items-center gap-2 p-2 rounded border border-[#E64A19]/30 bg-[#E64A19]/5"
              >
                <button
                  onClick={() => onSelect?.(instanceId)}
                  className="flex-1 text-left text-sm hover:text-[#E64A19] transition-colors"
                >
                  Instance #{displayNumber}
                </button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveInstance(instanceId)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CATEGORY SECTION COMPONENT
// ============================================================================

interface CategorySectionProps {
  category: ModuleCategory;
  enabledModules: string[];
  onModuleToggle: (moduleId: string, enabled: boolean) => void;
  onModuleSelect?: (moduleId: string) => void;
}

function CategorySection({
  category,
  enabledModules,
  onModuleToggle,
  onModuleSelect,
}: CategorySectionProps) {
  const modules = getModulesByCategory(category);

  if (modules.length === 0) return null;

  const enabledCount = modules.filter((m) =>
    enabledModules.includes(m.id)
  ).length;

  return (
    <AccordionItem value={category} className="border-b border-[#E64A19]/20">
      <AccordionTrigger className="py-3 hover:no-underline hover:text-[#E64A19]">
        <div className="flex items-center justify-between w-full pr-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              {CATEGORY_LABELS[category]}
            </span>
            <Badge
              className={cn(
                "h-5 px-1.5 text-[10px] border",
                enabledCount > 0
                  ? "bg-[#E64A19]/10 text-[#E64A19] border-[#E64A19]/30"
                  : "bg-muted text-muted-foreground border-border"
              )}
            >
              {enabledCount}/{modules.length}
            </Badge>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-4">
        <p className="text-xs text-muted-foreground mb-3 px-1">
          {CATEGORY_DESCRIPTIONS[category]}
        </p>
        <div className="space-y-2">
          {modules.map((module) => {
            // Check if this is a multi-instance module
            if (module.allowMultipleInstances) {
              const instances = getModuleInstances(module.id, enabledModules);
              const addModuleInstance = useModularStore((state) => state.addModuleInstance);
              const removeModuleInstance = useModularStore((state) => state.removeModuleInstance);

              return (
                <MultiInstanceModuleItem
                  key={module.id}
                  moduleId={module.id}
                  moduleName={module.name}
                  moduleDescription={module.description}
                  icon={module.icon}
                  instances={instances}
                  onAddInstance={() => addModuleInstance(module.id)}
                  onRemoveInstance={(instanceId) => removeModuleInstance(instanceId)}
                  onSelect={onModuleSelect}
                />
              );
            }

            // Regular single-instance module
            const enabled = enabledModules.includes(module.id);
            const missingDeps = enabled
              ? checkDependencies(module.id, enabledModules)
              : [];
            const conflicts = enabled
              ? checkConflicts(module.id, enabledModules)
              : [];
            const hasWarnings = missingDeps.length > 0 || conflicts.length > 0;

            const warningMessages: string[] = [];
            if (missingDeps.length > 0) {
              warningMessages.push(
                `Requires: ${missingDeps.join(", ")}`
              );
            }
            if (conflicts.length > 0) {
              warningMessages.push(
                `Conflicts with: ${conflicts.join(", ")}`
              );
            }

            return (
              <ModuleItem
                key={module.id}
                moduleId={module.id}
                moduleName={module.name}
                moduleDescription={module.description}
                icon={module.icon}
                enabled={enabled}
                hasWarnings={hasWarnings}
                warningMessages={warningMessages}
                onToggle={(checked) => onModuleToggle(module.id, checked)}
                onSelect={
                  onModuleSelect
                    ? () => onModuleSelect(module.id)
                    : undefined
                }
              />
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ============================================================================
// MAIN SIDEBAR COMPONENT
// ============================================================================

export function ModuleSidebar({
  enabledModules,
  onModuleToggle,
  onModuleSelect,
  isCarouselMode = false,
  className,
}: ModuleSidebarProps) {
  const totalModules = listModules().length;
  const enabledCount = enabledModules.length;

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r bg-background",
        className
      )}
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-[#E64A19]/20 p-4 bg-gradient-to-r from-[#E64A19]/5 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-[#E64A19]">Modules</h2>
          <Badge className="text-xs bg-[#E64A19] hover:bg-[#E64A19] text-white border-0">
            {enabledCount}/{totalModules} active
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Toggle modules on/off to customize your template
        </p>
      </div>

      {/* Module categories */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Accordion
            type="multiple"
            defaultValue={CATEGORY_ORDER}
            className="space-y-2"
          >
            {CATEGORY_ORDER.map((category) => (
              <CategorySection
                key={category}
                category={category}
                enabledModules={enabledModules}
                onModuleToggle={onModuleToggle}
                onModuleSelect={onModuleSelect}
              />
            ))}
          </Accordion>

          {/* Free Image Section - Only visible in carousel mode */}
          {isCarouselMode && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <ImageIcon className="h-4 w-4 text-[#E64A19]" />
                  <h3 className="text-sm font-semibold text-[#E64A19]">
                    Imagem Livre (Carrossel)
                  </h3>
                </div>
                <FreeImageForm />
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer help text */}
      <div className="flex-shrink-0 border-t p-4 bg-muted/30">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            Click module names to jump to their settings. Toggle switches to
            enable/disable modules.
          </p>
        </div>
      </div>
    </div>
  );
}
