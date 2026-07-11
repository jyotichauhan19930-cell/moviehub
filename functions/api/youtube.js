export async function onRequestGet(context) {
    const url = new URL(context.request.url);
    const videoId = url.searchParams.get('videoId');
    
    if (!videoId) {
        return new Response(JSON.stringify({ error: 'Video ID required' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // YouTube oEmbed API (free, no API key)
        const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (!res.ok) {
            return new Response(JSON.stringify({ error: 'Video not found' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const data = await res.json();
        return new Response(JSON.stringify({ title: data.title, author: data.author_name }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}  
