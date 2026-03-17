import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "channel");
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", "10");

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "YouTube API error" }, { status: response.status });
    }

    const channels = data.items.map((item) => ({
      channelId: item.snippet.channelId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.default?.url,
    }));

    return NextResponse.json({ channels });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search channels" }, { status: 500 });
  }
}
