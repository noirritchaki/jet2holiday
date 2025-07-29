import { getAccessToken } from "@/utils";
import { NextResponse } from "next/server";
import fetch from "node-fetch";

// Add multiple playlist IDs here
const playlistIds = [
  "72Eerd2B9wnZqG7stP1yFB",
  "7Hh16NYofoNIv06XKcoljJ",
  "68Yh5dWmNpMTFLn06jQcvV",
  "6HG1nm6Ok5K3e6Xkt1TPih",
  "0VHz6SbTFL5JncBFEhYcFj",
];

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    // Step 1: Pick a random playlist
    const randomPlaylistId =
      playlistIds[Math.floor(Math.random() * playlistIds.length)];

    // Step 2: Fetch playlist metadata to get total track count
    const metadataRes = await fetch(
      `https://api.spotify.com/v1/playlists/${randomPlaylistId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!metadataRes.ok) {
      const errorText = await metadataRes.text();
      console.error(
        "Failed to fetch playlist metadata:",
        metadataRes.status,
        errorText
      );
      throw new Error("Failed to fetch playlist metadata");
    }

    const metadata = await metadataRes.json();
    const totalTracks = metadata.tracks.total;

    // Step 3: Pick a random offset
    const randomOffset = Math.floor(Math.random() * totalTracks);

    // Step 4: Fetch one track at that offset
    const trackRes = await fetch(
      `https://api.spotify.com/v1/playlists/${randomPlaylistId}/tracks?limit=1&offset=${randomOffset}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!trackRes.ok) {
      throw new Error("Failed to fetch track");
    }

    const trackData = await trackRes.json();
    const track = trackData.items?.[0]?.track;

    if (!track) {
      throw new Error("No track found at offset");
    }

    const randomSong = {
      title: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      album: track.album.name,
      albumImage: track.album.images?.[0]?.url,
      songUrl: track.external_urls.spotify,
      playlist: playlistName,
    };

    return new NextResponse(JSON.stringify(randomSong), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching random song:", error.message);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
