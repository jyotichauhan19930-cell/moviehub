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
        const { videoId, youtubeUrl, title, description } = data;

        if (!videoId || !youtubeUrl) {
            return new Response(JSON.stringify({ success: false, error: 'Video ID and URL required' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const trailers = await env.TRAILERS.get('list', 'json') || [];

        const newTrailer = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
            title: title || 'Untitled Movie',
            youtubeUrl: youtubeUrl,
            description: description || '',
            thumbnail: 'https://img.youtube.com/vi/' + videoId + '/maxresdefault.jpg',
            videoId: videoId,
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
    const { env } = context;
    const url = new URL(context.request.url);
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

// ─── YOUTUBE TITLE FETCH ──────────────────────────────────────────────────
export async function onRequestYoutube(context) {
    const url = new URL(context.request.url);
    const videoId = url.searchParams.get('videoId');
    
    if (!videoId) {
        return new Response(JSON.stringify({ error: 'Video ID required' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // YouTube oEmbed API (no API key required)
        const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (!res.ok) {
            return new Response(JSON.stringify({ error: 'Video not found' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const data = await res.json();
        return new Response(JSON.stringify({ title: data.title }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
