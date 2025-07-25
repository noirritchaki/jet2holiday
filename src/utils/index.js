export async function getAccessToken() {
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
