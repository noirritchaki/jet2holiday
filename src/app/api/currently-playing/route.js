// // index.js
// import express, { application } from "express";
// import fetch from "node-fetch";
// import dotenv from "dotenv";
// dotenv.config();

// what's happening here?
// creating an http server with express
// node fetch allows me to call the spotify api
// dotenv loads my env file
// dotenv.config this will read my env file

// const app = express();
// const port = 3000;

import { getAccessToken } from "@/utils";
import { NextResponse } from "next/server";
import fetch from "node-fetch";

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    const nowPlayingRes = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store", // ensures fresh data
      }
    );
    console.log(
      `---------------------------------`,
      JSON.stringify(nowPlayingRes, null, 2)
    );
    if (nowPlayingRes.status === 204 || nowPlayingRes.status > 400) {
      return new NextResponse(JSON.stringify({ isPlaying: false }), {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // 👈 allow frontend
          "Access-Control-Allow-Methods": "GET", // 👈 specify methods
          "Content-Type": "application/json",
        },
      });
    }

    const song = await nowPlayingRes.json();
    const item = song.item;

    const currentlyPlaying = {
      isPlaying: song.is_playing,
      title: item.name,
      artist: item.artists.map((a) => a.name).join(", "),
      album: item.album.name,
      albumImage: item.album.images[0]?.url,
      songUrl: item.external_urls.spotify,
    };

    return new NextResponse(JSON.stringify(currentlyPlaying), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // 👈 allow frontend
        "Access-Control-Allow-Methods": "GET", // 👈 specify methods
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Handle preflight OPTIONS request
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

//this sends the currently playing object as a json otherwise we send 500 error

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

//this will start the server
