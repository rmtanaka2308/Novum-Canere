// src/app/api/lrclib/route.ts
export async function GET(req: Request) {
  const url = new URL(req.url);

  const track = url.searchParams.get("track_name") ?? "";

  const artist = url.searchParams.get("artist_name") ?? "";

  const album = url.searchParams.get("album_name") ?? "";

  const duration = url.searchParams.get("duration") ?? "";

  if (!track || !artist) {
    return new Response(
      JSON.stringify({ error: "track_name and artist_name are required" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const q = new URLSearchParams();
  q.set("track_name", track);
  q.set("artist_name", artist);
  if (album) q.set("album_name", album);
  if (duration) q.set("duration", duration);
  const query = `https://lrclib.net/api/search?${q.toString()}`
  const sRes = await fetch(query);
  if (!sRes.ok) {
    return new Response(
      JSON.stringify({ error: "LRCLIB search failed", status: sRes.status }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  const list = await sRes.json();

  return new Response(JSON.stringify(list), {
    headers: { "content-type": "application/json" },
  });
}
