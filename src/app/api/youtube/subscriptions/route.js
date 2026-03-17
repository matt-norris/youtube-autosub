import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allSubs = [];
    let nextPageToken = null;

    do {
      const url = new URL("https://www.googleapis.com/youtube/v3/subscriptions");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("mine", "true");
      url.searchParams.set("maxResults", "50");
      if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      const data = await response.json();

      if (!response.ok) {
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
    console.error("My subs error:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}
