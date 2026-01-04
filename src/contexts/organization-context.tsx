"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Organization {
  id: string;
  name: string;
  inviteCode: string;
  isOwner: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
}

interface OrganizationContextValue {
  organization: Organization | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  hasOrganization: boolean;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const loadOrganization = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setOrganization(null);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        setOrganization(null);
        setLoading(false);
        return;
      }

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, invite_code, owner_id, subscription_plan, subscription_status')
        .eq('id', profile.organization_id)
        .single();

      if (orgError || !org) {
        setError('Failed to load organization');
        setOrganization(null);
        setLoading(false);
        return;
      }

      setOrganization({
        id: org.id,
        name: org.name,
        inviteCode: org.invite_code,
        isOwner: org.owner_id === user.id,
        subscriptionPlan: org.subscription_plan || 'free',
        subscriptionStatus: org.subscription_status || 'inactive',
      });
      setError(null);
    } catch (err) {
      setError('Failed to load organization');
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadOrganization();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadOrganization();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadOrganization, supabase.auth]);

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        loading,
        error,
        refresh: loadOrganization,
        hasOrganization: !!organization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
