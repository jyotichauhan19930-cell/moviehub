// worker/index.js

const TMDB_BASE = "https://api.themoviedb.org/3";

export default {
  async fetch(request, env, ctx) {

    const url = new URL(request.url);

    const cache = caches.default;

    let response = await cache.match(request);

    if (response) {
      return response;
    }

    let apiUrl = "";

    switch (true) {

      case url.pathname === "/api/trending":
        apiUrl = `${TMDB_BASE}/trending/movie/week?api_key=${env.TMDB_API_KEY}`;
        break;

      case url.pathname === "/api/popular":
        apiUrl = `${TMDB_BASE}/movie/popular?api_key=${env.TMDB_API_KEY}`;
        break;

      case url.pathname === "/api/upcoming":
        apiUrl = `${TMDB_BASE}/movie/upcoming?api_key=${env.TMDB_API_KEY}`;
        break;

      case url.pathname === "/api/top-rated":
        apiUrl = `${TMDB_BASE}/movie/top_rated?api_key=${env.TMDB_API_KEY}`;
        break;

      default:

        if (url.pathname.startsWith("/api/movie/")) {

          const parts = url.pathname.split("/");

          const id = parts[3];

          if (parts.length === 4) {

            apiUrl = `${TMDB_BASE}/movie/${id}?api_key=${env.TMDB_API_KEY}&append_to_response=videos,credits,images`;

          }

          else if (parts[4] === "similar") {

            apiUrl = `${TMDB_BASE}/movie/${id}/similar?api_key=${env.TMDB_API_KEY}`;

          }

          else if (parts[4] === "cast") {

            apiUrl = `${TMDB_BASE}/movie/${id}/credits?api_key=${env.TMDB_API_KEY}`;

          }

          else if (parts[4] === "trailer") {

            apiUrl = `${TMDB_BASE}/movie/${id}/videos?api_key=${env.TMDB_API_KEY}`;

          }

        }

        else if (url.pathname === "/api/search") {

          const q = url.searchParams.get("q");

          apiUrl = `${TMDB_BASE}/search/movie?api_key=${env.TMDB_API_KEY}&query=${encodeURIComponent(q)}`;

        }

    }

    if (!apiUrl) {

      return new Response("Not Found", { status: 404 });

    }

    const tmdb = await fetch(apiUrl);

    response = new Response(await tmdb.text(), {

      headers: {

        "Content-Type": "application/json",

        "Cache-Control": "public,max-age=3600"

      }

    });

    ctx.waitUntil(cache.put(request, response.clone()));

    return response;

  }

}
