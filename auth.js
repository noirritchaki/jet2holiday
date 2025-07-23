import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 8888;

const redirect_uri = "http://localhost:8888/callback"; //replace with my redirect uri from Spotify

// 👇 scopes you need (add more if needed later)
const scopes = ["user-read-playback-state", "user-read-currently-playing"].join(
  " "
);

// Step 1: Redirect user to Spotify login
app.get("/login", (req, res) => {
  const queryParams = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: redirect_uri,
  });

  res.redirect(
    "https://accounts.spotify.com/authorize?" + queryParams.toString()
  );
});

// Step 2: Spotify redirects back to /callback with a ?code=
app.get("/callback", async (req, res) => {
  const code = req.query.code || null;

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
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();

  console.log("--- COPY THESE ---");
  console.log("access_token:", data.access_token);
  console.log("refresh_token:", data.refresh_token);
  console.log("-----------------");

  res.send(`
    <h1>Tokens received!</h1>
    <p><strong>Refresh token:</strong></p>
    <pre>${data.refresh_token}</pre>
    <p>Copy this and add it to your .env as SPOTIFY_REFRESH_TOKEN</p>
  `);
});

// Start the server
app.listen(port, () => {
  console.log(`Auth server running on http://localhost:${port}`);
  console.log(`Visit http://localhost:${port}/login`);
});
