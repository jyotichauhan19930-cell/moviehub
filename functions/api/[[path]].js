export async function onRequest(context) {

  const { request, env } = context;

  const url = new URL(request.url);

  const TMDB = "https://api.themoviedb.org/3";

  let endpoint = "";

  switch (url.pathname) {

    case "/api/trending":
      endpoint = "/trending/movie/week";
      break;

    case "/api/popular":
      endpoint = "/movie/popular";
      break;

    case "/api/upcoming":
      endpoint = "/movie/upcoming";
      break;

    case "/api/top-rated":
      endpoint = "/movie/top_rated";
      break;

    default:
      return new Response("API Not Found", { status: 404 });

  }

  const response = await fetch(
    `${TMDB}${endpoint}?api_key=${env.TMDB_API_KEY}`
  );

  return new Response(await response.text(), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public,max-age=3600"
    }
  });

}
