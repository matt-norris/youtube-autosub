import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { channelIds } = body;

    if (!channelIds || !Array.isArray(channelIds) || channelIds.length === 0) {
      return NextResponse.json({ error: "Missing channelIds" }, { status: 400 });
    }

    // Resolve channel IDs to get details
    const ids = channelIds.join(",");
    const url = new URL("https://www.googleapis.com/youtube/v3/channels");
    url.searchParams.set("part", "snippet,statistics");
    url.searchParams.set("id", ids);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Failed to resolve channels" },
        { status: response.status }
      );
    }

    const channels = data.items.map((item) => ({
      channelId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.default?.url,
      subscriberCount: item.statistics.subscriberCount,
      videoCount: item.statistics.videoCount,
    }));

    return NextResponse.json({ channels });
  } catch (error) {
    console.error("Resolve error:", error);
    return NextResponse.json({ error: "Failed to resolve channels" }, { status: 500 });
  }
}
