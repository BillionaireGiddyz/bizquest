const CANONICAL_ORIGIN = 'https://bizquest-eight.vercel.app';
const CANONICAL_HOST = 'bizquest-eight.vercel.app';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

export default function middleware(request: Request) {
  const url = new URL(request.url);

  if (!LOCAL_HOSTS.has(url.hostname) && url.hostname !== CANONICAL_HOST) {
    return Response.redirect(
      `${CANONICAL_ORIGIN}${url.pathname}${url.search}${url.hash}`,
      308,
    );
  }

  return;
}

export const config = {
  matcher: '/:path*',
};
