'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SpecialPositionSelectorProps {
  position: string;
  padding: number;
  onPositionChange: (value: string) => void;
  onPaddingChange: (value: number) => void;
}

export function SpecialPositionSelector({
  position,
  padding,
  onPositionChange,
  onPaddingChange,
}: SpecialPositionSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Special Position</Label>
        <Select value={position || 'none'} onValueChange={onPositionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (Custom)</SelectItem>
            <SelectItem value="top-left">Top Left</SelectItem>
            <SelectItem value="top-right">Top Right</SelectItem>
            <SelectItem value="bottom-left">Bottom Left</SelectItem>
            <SelectItem value="bottom-right">Bottom Right</SelectItem>
          </SelectContent>
        </Select>
        {position && position !== 'none' && (
          <p className="text-xs text-muted-foreground">
            Element will be automatically positioned in the {position.replace('-', ' ')} corner
          </p>
        )}
      </div>

      {position && position !== 'none' && (
        <div className="space-y-2">
          <Label>Padding (Proportional %)</Label>
          <Input
            type="number"
            min={0}
            max={20}
            step={0.5}
            value={padding || 8}
            onChange={(e) => onPaddingChange(parseFloat(e.target.value) || 0)}
          />
          <p className="text-xs text-muted-foreground">
            Distance from card edges (scales with card size)
          </p>
        </div>
      )}
    </div>
  );
}
