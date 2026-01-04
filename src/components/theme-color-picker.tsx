"use client";

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { THEME_PRESETS, type ThemeSettings } from '@/contexts/theme-customization-context';
import { toast } from 'sonner';

interface ThemeColorPickerProps {
  currentSettings: ThemeSettings;
  onPreview: (settings: ThemeSettings) => void;
  onSave: (settings: ThemeSettings) => Promise<boolean>;
  disabled?: boolean;
}

export function ThemeColorPicker({
  currentSettings,
  onPreview,
  onSave,
  disabled = false,
}: ThemeColorPickerProps) {
  const [selectedPreset, setSelectedPreset] = useState(currentSettings.preset || 'violet');
  const [saving, setSaving] = useState(false);

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    onPreview({ preset });
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave({ preset: selectedPreset });
    setSaving(false);

    if (success) {
      toast.success('Theme saved');
    } else {
      toast.error('Failed to save theme');
    }
  };

  const presetEntries = Object.entries(THEME_PRESETS);

  return (
    <div className="space-y-4">
      <Label className="text-sm text-muted-foreground">Color Theme</Label>

      <div className="grid grid-cols-5 gap-2">
        {presetEntries.map(([key, preset]) => {
          const isSelected = selectedPreset === key;
          // Convert HSL to a preview color
          const hsl = preset.primary.split(' ');
          const previewColor = `hsl(${hsl[0]}, ${hsl[1]}, ${hsl[2]})`;

          return (
            <button
              key={key}
              type="button"
              onClick={() => handlePresetChange(key)}
              disabled={disabled}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-muted/50 hover:bg-muted'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div
                className="w-8 h-8 rounded-full shadow-sm"
                style={{ backgroundColor: previewColor }}
              />
              <span className="text-xs font-medium">{preset.name}</span>
              {isSelected && (
                <div className="absolute top-1 right-1">
                  <Check className="w-3 h-3 text-primary" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!disabled && selectedPreset !== currentSettings.preset && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetChange(currentSettings.preset || 'violet')}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Theme'}
          </Button>
        </div>
      )}

      {disabled && (
        <p className="text-xs text-muted-foreground">
          Theme customization is available on Pro and Enterprise plans.
        </p>
      )}
    </div>
  );
}
