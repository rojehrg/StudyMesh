"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

// Theme presets with HSL values
export interface ThemePreset {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  violet: {
    name: 'Violet',
    primary: '262 60% 50%',
    secondary: '262 20% 96%',
    accent: '262 60% 50%',
  },
  blue: {
    name: 'Blue',
    primary: '217 91% 60%',
    secondary: '217 20% 96%',
    accent: '217 91% 60%',
  },
  green: {
    name: 'Green',
    primary: '145 65% 42%',
    secondary: '145 20% 96%',
    accent: '145 65% 42%',
  },
  orange: {
    name: 'Orange',
    primary: '25 95% 53%',
    secondary: '25 20% 96%',
    accent: '25 95% 53%',
  },
  pink: {
    name: 'Pink',
    primary: '330 81% 60%',
    secondary: '330 20% 96%',
    accent: '330 81% 60%',
  },
};

export interface ThemeSettings {
  preset: string;
  primary?: string;
  secondary?: string;
  accent?: string;
}

interface ThemeCustomizationContextValue {
  themeSettings: ThemeSettings;
  loading: boolean;
  canCustomize: boolean;
  applyTheme: (settings: ThemeSettings) => void;
  saveTheme: (settings: ThemeSettings) => Promise<boolean>;
  resetTheme: () => void;
}

const ThemeCustomizationContext = createContext<ThemeCustomizationContextValue | null>(null);

export function ThemeCustomizationProvider({ children }: { children: ReactNode }) {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({ preset: 'violet' });
  const [loading, setLoading] = useState(true);
  const [canCustomize, setCanCustomize] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const supabase = createClient();

  // Apply theme to CSS variables
  const applyTheme = useCallback((settings: ThemeSettings) => {
    const preset = THEME_PRESETS[settings.preset] || THEME_PRESETS.violet;
    const primary = settings.primary || preset.primary;
    const secondary = settings.secondary || preset.secondary;
    const accent = settings.accent || preset.accent;

    // Apply to document root
    const root = document.documentElement;
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--secondary', secondary);
    root.style.setProperty('--accent', accent);

    // Also update ring color to match primary
    root.style.setProperty('--ring', primary);

    setThemeSettings(settings);
  }, []);

  // Load theme from organization
  const loadTheme = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      setOrganizationId(profile.organization_id);

      const { data: org } = await supabase
        .from('organizations')
        .select('theme_settings, subscription_plan, owner_id')
        .eq('id', profile.organization_id)
        .single();

      if (org) {
        // Check if user can customize (Pro+ plan and is owner)
        const isPro = ['pro', 'enterprise'].includes(org.subscription_plan || 'free');
        setCanCustomize(isPro && org.owner_id === user.id);

        // Apply theme settings if available
        const settings = (org.theme_settings as ThemeSettings) || { preset: 'violet' };
        applyTheme(settings);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, applyTheme]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Save theme to organization
  const saveTheme = useCallback(async (settings: ThemeSettings): Promise<boolean> => {
    if (!organizationId || !canCustomize) return false;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          theme_settings: settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', organizationId);

      if (error) {
        console.error('Error saving theme:', error);
        return false;
      }

      applyTheme(settings);
      return true;
    } catch (error) {
      console.error('Error saving theme:', error);
      return false;
    }
  }, [organizationId, canCustomize, supabase, applyTheme]);

  // Reset to default theme
  const resetTheme = useCallback(() => {
    // Reset CSS variables
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--secondary');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--ring');

    setThemeSettings({ preset: 'violet' });
  }, []);

  return (
    <ThemeCustomizationContext.Provider
      value={{
        themeSettings,
        loading,
        canCustomize,
        applyTheme,
        saveTheme,
        resetTheme,
      }}
    >
      {children}
    </ThemeCustomizationContext.Provider>
  );
}

export function useThemeCustomization() {
  const context = useContext(ThemeCustomizationContext);
  if (!context) {
    throw new Error('useThemeCustomization must be used within a ThemeCustomizationProvider');
  }
  return context;
}
