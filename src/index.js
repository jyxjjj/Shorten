function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

async function sha256Hex(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (request.method === 'POST') {
            switch (url.pathname) {
                case '/shorten':
                    const data = await request.json();
                    const longUrl = data.url;
                    if (!longUrl || !isValidUrl(longUrl)) {
                        return Response.json({ error: 'Invalid URL' }, { status: 400 });
                    }
                    const hash = await sha256Hex(longUrl);
                    const shortCode = hash.slice(0, 8);
                    await env.Shorten.put(shortCode, longUrl);
                    return Response.json({ url: shortCode });
                default:
                    return new Response('404 Not Found', { status: 404 });
            }
        }
        if (request.method === 'GET') {
            switch (url.pathname) {
                case '/':
                    return env.ASSET.fetch(request);
                case '/count':
                    break;
                default:
                    const path = url.pathname.slice(1);
                    if (!path) {
                        return new Response('400 Bad Request', { status: 400 });
                    }
                    const longUrl = await env.Shorten.get(path);
                    if (!longUrl) {
                        return new Response('404 Not Found', { status: 404 });
                    }
                    const currentCount = await env.Shorten.get(`${path}_count`);
                    const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
                    await env.Shorten.put(`${path}_count`, newCount.toString());
                    return Response.redirect(longUrl, 302);
            }
        }
        return new Response('Method Not Allowed', { status: 405 });
    }
};
