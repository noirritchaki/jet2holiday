import { getAccessToken } from "@/utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    const recentRes = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!recentRes.ok) {
      console.error("Error from Spotify:", recentRes.status);
      return NextResponse.json({ error: "Spotify error" }, { status: 500 });
    }

    const recentData = await recentRes.json(); // ✅ parse the JSON

    console.log("recently-played response:", recentData);

    // If there are no items, send a helpful message
    if (!recentData.items || recentData.items.length === 0) {
      return NextResponse.json(
        { message: "No recently played tracks found" },
        { status: 200 }
      );
    }

    const lastTrack = recentData.items[0].track;

    const lastPlayed = {
      isPlaying: false,
      title: lastTrack.name,
      artist: lastTrack.artists.map((a) => a.name).join(", "),
      album: lastTrack.album.name,
      albumImage: lastTrack.album.images[0]?.url,
      songUrl: lastTrack.external_urls.spotify,
      playedAt: recentData.items[0].played_at, // optional
    };

    return NextResponse.json(lastPlayed, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
