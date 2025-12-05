"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useModularStore } from "@/lib/store/modularStore";
import { listModules } from "@/lib/modules/registry";
import type { SpatialRule, SpatialRuleType } from "@/lib/layout/types";
import {
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label,
} from "@/components/ui";

// ============================================================================
// TYPES
// ============================================================================

interface FormData {
  type: SpatialRuleType;
  target: string;
  reference: string;
  reference2: string;
  description: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SpatialRulesEditor() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    type: "before",
    target: "",
    reference: "",
    reference2: "",
    description: "",
  });

  // Store
  const compositionConfig = useModularStore((state) => state.compositionConfig);
  const addSpatialRule = useModularStore((state) => state.addSpatialRule);
  const removeSpatialRule = useModularStore((state) => state.removeSpatialRule);
  const enabledModules = useModularStore((state) => state.getCurrentSlideEnabledModules());

  // Get available modules
  const allModules = listModules();
  const availableModules = allModules.filter((m) =>
    enabledModules.includes(m.id)
  );

  // Get existing rules
  const spatialRules = compositionConfig?.spatialRules || [];

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleOpenDialog = () => {
    // Reset form
    setFormData({
      type: "before",
      target: "",
      reference: "",
      reference2: "",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleAddRule = () => {
    // Validation
    if (!formData.target) {
      alert("Please select a target module");
      return;
    }

    if (formData.type !== "wrap" && !formData.reference) {
      alert("Please select a reference module");
      return;
    }

    if (formData.type === "between" && !formData.reference2) {
      alert("Please select a second reference module for 'between' rule");
      return;
    }

    if (formData.target === formData.reference) {
      alert("Target and reference must be different modules");
      return;
    }

    if (
      formData.type === "between" &&
      (formData.target === formData.reference2 ||
        formData.reference === formData.reference2)
    ) {
      alert("All modules in a 'between' rule must be different");
      return;
    }

    // Create rule
    const newRule: SpatialRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: formData.type,
      target: formData.target,
      reference: formData.type !== "wrap" ? formData.reference : undefined,
      reference2:
        formData.type === "between" ? formData.reference2 : undefined,
      description: formData.description || undefined,
    };

    addSpatialRule(newRule);
    handleCloseDialog();
  };

  const handleRemoveRule = (ruleId: string) => {
    removeSpatialRule(ruleId);
  };

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getModuleName = (moduleId: string): string => {
    const module = allModules.find((m) => m.id === moduleId);
    return module?.name || moduleId;
  };

  const getRuleDescription = (rule: SpatialRule): string => {
    if (rule.description) {
      return rule.description;
    }

    const targetName = getModuleName(rule.target);
    const referenceName = rule.reference
      ? getModuleName(rule.reference)
      : "N/A";
    const reference2Name = rule.reference2
      ? getModuleName(rule.reference2)
      : "N/A";

    switch (rule.type) {
      case "before":
        return `Place "${targetName}" before "${referenceName}"`;
      case "after":
        return `Place "${targetName}" after "${referenceName}"`;
      case "between":
        return `Place "${targetName}" between "${referenceName}" and "${reference2Name}"`;
      case "wrap":
        return `Wrap "${targetName}" in container`;
      default:
        return "Unknown rule";
    }
  };

  const getBadgeColor = (type: SpatialRuleType): string => {
    switch (type) {
      case "before":
        return "bg-blue-500 text-white hover:bg-blue-600";
      case "after":
        return "bg-green-500 text-white hover:bg-green-600";
      case "between":
        return "bg-purple-500 text-white hover:bg-purple-600";
      case "wrap":
        return "bg-orange-500 text-white hover:bg-orange-600";
      default:
        return "bg-gray-500 text-white hover:bg-gray-600";
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Spatial Rules</h3>
          <p className="text-sm text-muted-foreground">
            Define positioning relationships between modules
          </p>
        </div>
        <Button onClick={handleOpenDialog} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="space-y-2">
        {spatialRules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No spatial rules defined</p>
            <p className="text-xs mt-1">
              Click &quot;Add Rule&quot; to create positioning relationships
            </p>
          </div>
        ) : (
          spatialRules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border hover:bg-secondary/70 transition-colors"
            >
              <Badge className={getBadgeColor(rule.type)}>
                {rule.type.toUpperCase()}
              </Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {getRuleDescription(rule)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRule(rule.id)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Add Rule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>Add Spatial Rule</DialogTitle>
            <DialogDescription>
              Define how modules should be positioned relative to each other.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Rule Type */}
            <div className="space-y-2">
              <Label htmlFor="rule-type">Rule Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  handleFormChange("type", value as SpatialRuleType)
                }
              >
                <SelectTrigger id="rule-type">
                  <SelectValue placeholder="Select rule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Before</SelectItem>
                  <SelectItem value="after">After</SelectItem>
                  <SelectItem value="between">Between</SelectItem>
                  <SelectItem value="wrap">Wrap</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.type === "before" &&
                  "Position target module before reference"}
                {formData.type === "after" &&
                  "Position target module after reference"}
                {formData.type === "between" &&
                  "Position target module between two references"}
                {formData.type === "wrap" &&
                  "Wrap target module in a container"}
              </p>
            </div>

            {/* Target Module */}
            <div className="space-y-2">
              <Label htmlFor="target-module">Target Module</Label>
              <Select
                value={formData.target}
                onValueChange={(value) => handleFormChange("target", value)}
              >
                <SelectTrigger id="target-module">
                  <SelectValue placeholder="Select target module" />
                </SelectTrigger>
                <SelectContent>
                  {availableModules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The module to be positioned
              </p>
            </div>

            {/* Reference Module (for before, after, between) */}
            {formData.type !== "wrap" && (
              <div className="space-y-2">
                <Label htmlFor="reference-module">Reference Module</Label>
                <Select
                  value={formData.reference}
                  onValueChange={(value) =>
                    handleFormChange("reference", value)
                  }
                >
                  <SelectTrigger id="reference-module">
                    <SelectValue placeholder="Select reference module" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModules
                      .filter((m) => m.id !== formData.target)
                      .map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The module to position relative to
                </p>
              </div>
            )}

            {/* Reference 2 Module (only for between) */}
            {formData.type === "between" && (
              <div className="space-y-2">
                <Label htmlFor="reference2-module">Second Reference</Label>
                <Select
                  value={formData.reference2}
                  onValueChange={(value) =>
                    handleFormChange("reference2", value)
                  }
                >
                  <SelectTrigger id="reference2-module">
                    <SelectValue placeholder="Select second reference" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModules
                      .filter(
                        (m) =>
                          m.id !== formData.target &&
                          m.id !== formData.reference
                      )
                      .map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The second boundary for positioning
                </p>
              </div>
            )}

            {/* Description (optional) */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="e.g., Position logo above title"
                value={formData.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
              />
              <p className="text-xs text-muted-foreground">
                Optional custom description for this rule
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleAddRule}>Add Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
