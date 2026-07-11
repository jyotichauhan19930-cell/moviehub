const API_BASE = "/api";

async function request(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error(error);
        return null;
    }
}

// Trending Movies
export async function getTrendingMovies() {
    return await request("/trending");
}

// Popular Movies
export async function getPopularMovies() {
    return await request("/popular");
}

// Upcoming Movies
export async function getUpcomingMovies() {
    return await request("/upcoming");
}

// Top Rated Movies
export async function getTopRatedMovies() {
    return await request("/top-rated");
}

// Movie Details
export async function getMovie(id) {
    return await request(`/movie/${id}`);
}

// Similar Movies
export async function getSimilarMovies(id) {
    return await request(`/movie/${id}/similar`);
}

// Cast
export async function getMovieCast(id) {
    return await request(`/movie/${id}/cast`);
}

// Trailer
export async function getMovieTrailer(id) {
    return await request(`/movie/${id}/trailer`);
}

// Search
export async function searchMovies(query) {
    return await request(`/search?q=${encodeURIComponent(query)}`);
}
