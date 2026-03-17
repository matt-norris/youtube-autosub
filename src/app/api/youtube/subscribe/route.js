import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { channelIds } = body;

  if (!channelIds || !Array.isArray(channelIds) || channelIds.length === 0) {
    return NextResponse.json({ error: "Missing or empty channelIds array" }, { status: 400 });
  }

  const results = [];
  const DELAY_MS = 250; // Throttle to avoid rate limits

  for (let i = 0; i < channelIds.length; i++) {
    const channelId = channelIds[i];

    try {
      const response = await fetch(
        "https://www.googleapis.com/youtube/v3/subscriptions?part=snippet",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            snippet: {
              resourceId: {
                kind: "youtube#channel",
                channelId: channelId,
              },
            },
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        results.push({ channelId, success: true });
      } else {
        // Check for already subscribed
        const reason = data.error?.errors?.[0]?.reason;
        if (reason === "subscriptionDuplicate") {
          results.push({ channelId, success: true, skipped: true, reason: "Already subscribed" });
        } else {
          results.push({
            channelId,
            success: false,
            error: data.error?.message || "Unknown error",
          });
        }
      }
    } catch (error) {
      results.push({ channelId, success: false, error: error.message });
    }

    // Throttle between requests
    if (i < channelIds.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const skipped = results.filter((r) => r.skipped).length;

  return NextResponse.json({
    results,
    summary: { total: channelIds.length, succeeded, failed, skipped },
  });
}
