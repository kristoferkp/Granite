import { Context, Next } from 'hono';

// Simple in-memory rate limiting (use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export async function rateLimitMiddleware(c: Context, next: Next) {
  const ip = c.req.header('x-forwarded-for') || 
            c.req.header('x-real-ip') || 
            'unknown';
  
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
  
  const now = Date.now();
  const resetTime = now + windowMs;
  
  const current = requestCounts.get(ip);
  
  if (!current || now > current.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime });
    await next();
    return;
  }
  
  if (current.count >= maxRequests) {
    return c.json({ 
      error: 'Too many requests',
      retryAfter: Math.ceil((current.resetTime - now) / 1000)
    }, 429);
  }
  
  current.count++;
  await next();
}
