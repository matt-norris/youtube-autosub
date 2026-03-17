import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId");
  const pageToken = searchParams.get("pageToken");

  if (!channelId) {
    return NextResponse.json({ error: "Missing channelId" }, { status: 400 });
  }

  try {
    const allSubs = [];
    let nextPageToken = pageToken || null;

    // Fetch all pages (or just the requested page if pageToken is provided)
    do {
      const url = new URL("https://www.googleapis.com/youtube/v3/subscriptions");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("channelId", channelId);
      url.searchParams.set("maxResults", "50");
      if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      const data = await response.json();

      if (!response.ok) {
        // Subscriptions might be private
        if (response.status === 403) {
          return NextResponse.json(
            { error: "This channel's subscriptions are private" },
            { status: 403 }
          );
        }
        return NextResponse.json(
          { error: data.error?.message || "YouTube API error" },
          { status: response.status }
        );
      }

      const subs = data.items.map((item) => ({
        channelId: item.snippet.resourceId.channelId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.default?.url,
      }));

      allSubs.push(...subs);
      nextPageToken = data.nextPageToken || null;
    } while (nextPageToken);

    return NextResponse.json({ subscriptions: allSubs, total: allSubs.length });
  } catch (error) {
    console.error("Channel subs error:", error);
    return NextResponse.json({ error: "Failed to fetch channel subscriptions" }, { status: 500 });
  }
}
