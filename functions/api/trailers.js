// ─── GET TRAILERS ──────────────────────────────────────────────────────────
export async function onRequestGet(context) {
    const { env } = context;
    try {
        const trailers = await env.TRAILERS.get('list', 'json') || [];
        return new Response(JSON.stringify({ trailers }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ trailers: [], error: e.message }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// ─── POST TRAILER ──────────────────────────────────────────────────────────
export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const data = await request.json();
        const { title, youtubeUrl, year = '', genre = '' } = data;

        if (!title || !youtubeUrl) {
            return new Response(JSON.stringify({ success: false, error: 'Title and YouTube URL required' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Extract YouTube video ID
        let videoId = null;
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([^&]+)/,
            /(?:youtu\.be\/)([^?]+)/,
            /(?:youtube\.com\/embed\/)([^?]+)/
        ];
        for (const pattern of patterns) {
            const match = youtubeUrl.match(pattern);
            if (match) { videoId = match[1]; break; }
        }

        if (!videoId) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid YouTube URL' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const trailers = await env.TRAILERS.get('list', 'json') || [];

        const newTrailer = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
            title,
            youtubeUrl,
            year,
            genre,
            thumbnail: 'https://img.youtube.com/vi/' + videoId + '/maxresdefault.jpg',
            videoId,
            views: 0,
            createdAt: new Date().toISOString()
        };

        trailers.unshift(newTrailer);
        await env.TRAILERS.put('list', JSON.stringify(trailers));

        return new Response(JSON.stringify({ success: true, trailer: newTrailer }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// ─── VIEW COUNT ────────────────────────────────────────────────────────────
export async function onRequestPostView(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.pathname.split('/')[3];
    
    try {
        const trailers = await env.TRAILERS.get('list', 'json') || [];
        const index = trailers.findIndex(t => t.id === id);
        if (index !== -1) {
            trailers[index].views = (trailers[index].views || 0) + 1;
            await env.TRAILERS.put('list', JSON.stringify(trailers));
        }
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
