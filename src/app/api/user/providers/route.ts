import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserProviders, disconnectProvider, MeetingProvider } from "@/lib/meeting-providers";

/**
 * GET /api/user/providers
 *
 * Returns the user's connected meeting providers.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const providers = await getUserProviders(user.id);

    return NextResponse.json({
      success: true,
      providers
    });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }
}

/**
 * DELETE /api/user/providers
 *
 * Disconnects a meeting provider.
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await request.json();

    if (!provider || !['zoom', 'google_calendar'].includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const success = await disconnectProvider(user.id, provider as MeetingProvider);

    if (!success) {
      return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting provider:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
