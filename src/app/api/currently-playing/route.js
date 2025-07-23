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

import { NextResponse } from "next/server";
import fetch from "node-fetch";

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

  //spotify requires an access token so that it can call its apis
  //these tokens can expire so we need a refresh token
  //we send a post request with our client id, etc
  //spotify then responds to that with a fresh access token
  //that access token is then returned

  const data = await response.json();
  return data.access_token;
}
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

    if (nowPlayingRes.status === 204 || nowPlayingRes.status > 400) {
      return NextResponse.json({ isPlaying: false });
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

    return NextResponse.json(currentlyPlaying, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

//this sends the currently playing object as a json otherwise we send 500 error

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

//this will start the server
