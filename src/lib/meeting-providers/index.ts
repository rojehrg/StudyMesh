/**
 * Meeting Provider Service
 *
 * Handles creating meetings via Zoom API.
 */

import { createClient } from "@/lib/supabase/server";
import { decryptToken, encryptToken } from "@/lib/encryption";
import { createLogger } from "@/lib/logger";

const log = createLogger({ service: 'meetings' });

export type MeetingProvider = 'zoom' | 'custom';

export interface MeetingDetails {
  title: string;
  description?: string;
  startTime: Date;
  durationMinutes: number;
}

export interface CreatedMeeting {
  provider: MeetingProvider;
  meetingLink: string;
  providerMeetingId: string;
  hostUrl?: string; // For Zoom host controls
}

interface ProviderCredentials {
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
}

/**
 * Get user's provider credentials and refresh if needed
 */
async function getProviderCredentials(
  userId: string,
  provider: MeetingProvider
): Promise<ProviderCredentials | null> {
  const supabase = await createClient();

  const { data: creds } = await supabase
    .from('user_provider_credentials')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single();

  if (!creds || !creds.access_token) {
    log.info('No credentials found', { userId, provider });
    return null;
  }

  const accessToken = decryptToken(creds.access_token);
  if (!accessToken) {
    log.error('Failed to decrypt access token', { userId, provider });
    return null;
  }

  // Check if token is expired (with 5 minute buffer)
  const expiresAt = creds.token_expires_at ? new Date(creds.token_expires_at) : null;
  const isExpired = expiresAt && expiresAt.getTime() < Date.now() + 5 * 60 * 1000;

  if (isExpired && creds.refresh_token) {
    log.info('Token expired, refreshing', { userId, provider });
    const refreshToken = decryptToken(creds.refresh_token);

    if (refreshToken) {
      const newTokens = await refreshProviderToken(provider, refreshToken);
      if (newTokens) {
        // Update stored tokens
        const newExpiresAt = new Date(Date.now() + (newTokens.expiresIn || 3600) * 1000);
        await supabase
          .from('user_provider_credentials')
          .update({
            access_token: encryptToken(newTokens.accessToken),
            refresh_token: newTokens.refreshToken ? encryptToken(newTokens.refreshToken) : creds.refresh_token,
            token_expires_at: newExpiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('provider', provider);

        return {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken || refreshToken,
          tokenExpiresAt: newExpiresAt,
        };
      }
    }
  }

  return {
    accessToken,
    refreshToken: creds.refresh_token ? decryptToken(creds.refresh_token) || undefined : undefined,
    tokenExpiresAt: expiresAt || undefined,
  };
}

/**
 * Refresh OAuth token for a provider
 */
async function refreshProviderToken(
  provider: MeetingProvider,
  refreshToken: string
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number } | null> {
  try {
    if (provider === 'zoom') {
      const clientId = process.env.ZOOM_CLIENT_ID!;
      const clientSecret = process.env.ZOOM_CLIENT_SECRET!;

      const response = await fetch('https://zoom.us/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        log.error('Failed to refresh Zoom token', { status: response.status });
        return null;
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    }

    return null;
  } catch (error: any) {
    log.error('Token refresh failed', { provider, error: error.message });
    return null;
  }
}

/**
 * Create a Zoom meeting
 */
export async function createZoomMeeting(
  userId: string,
  meeting: MeetingDetails
): Promise<CreatedMeeting | null> {
  const creds = await getProviderCredentials(userId, 'zoom');
  if (!creds) {
    log.error('No Zoom credentials', { userId });
    return null;
  }

  try {
    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creds.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: meeting.title,
        type: 2, // Scheduled meeting
        start_time: meeting.startTime.toISOString(),
        duration: meeting.durationMinutes,
        agenda: meeting.description || '',
        settings: {
          join_before_host: true,
          waiting_room: false,
          mute_upon_entry: false,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      log.error('Failed to create Zoom meeting', { status: response.status, error });
      return null;
    }

    const data = await response.json();

    log.info('Zoom meeting created', { userId, meetingId: data.id });

    return {
      provider: 'zoom',
      meetingLink: data.join_url,
      providerMeetingId: String(data.id),
      hostUrl: data.start_url,
    };
  } catch (error: any) {
    log.error('Zoom API error', { userId, error: error.message });
    return null;
  }
}


/**
 * Get user's connected providers
 */
export async function getUserProviders(userId: string): Promise<{
  zoom: boolean;
  zoomEmail?: string;
}> {
  const supabase = await createClient();

  const { data: creds } = await supabase
    .from('user_provider_credentials')
    .select('provider, provider_email')
    .eq('user_id', userId);

  const result = {
    zoom: false,
    zoomEmail: undefined as string | undefined,
  };

  if (creds) {
    for (const cred of creds) {
      if (cred.provider === 'zoom') {
        result.zoom = true;
        result.zoomEmail = cred.provider_email || undefined;
      }
    }
  }

  return result;
}

/**
 * Disconnect a provider
 */
export async function disconnectProvider(userId: string, provider: MeetingProvider): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('user_provider_credentials')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider);

  if (error) {
    log.error('Failed to disconnect provider', { userId, provider, error: error.message });
    return false;
  }

  log.info('Provider disconnected', { userId, provider });
  return true;
}
