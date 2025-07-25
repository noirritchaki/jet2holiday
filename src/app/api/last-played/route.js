import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { formatDistanceToNow } from "date-fns";

async function getAccessToken() {
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    }),
  });
  const data = await response.json();
  return data.access_token;
}

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    console.log(`---------------tgyvyfvtyvyv`, accessToken);

    const recentRes = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      }
    );

    if (!recentRes.ok) {
      console.error("Spotify error:", recentRes.status);
      return NextResponse.json({ error: "Spotify error" }, { status: 500 });
    }

    const recentData = await recentRes.json();

    if (!recentData.items || recentData.items.length === 0) {
      return NextResponse.json(
        { message: "No recently played tracks found" },
        { status: 200 }
      );
    }

    const lastItem = recentData.items[0];
    const lastTrack = lastItem.track;

    //using date-fns to get relative time
    const relativeTime = formatDistanceToNow(new Date(lastItem.played_at), {
      addSuffix: true, // e.g. "5 minutes ago"
    });

    const lastPlayed = {
      isPlaying: false,
      title: lastTrack.name,
      artist: lastTrack.artists.map((a) => a.name).join(", "),
      album: lastTrack.album.name,
      albumImage: lastTrack.album.images[0]?.url,
      songUrl: lastTrack.external_urls.spotify,
      playedAt: relativeTime, // 👈 human-readable
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
