import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

// Better Auth
import { auth } from './auth.js';

// Routes
import notesRoutes from './routes/notes.js';
import syncRoutes from './routes/sync.js';
import userRoutes from './routes/users.js';

// Middleware
import { rateLimitMiddleware } from './middleware/rateLimit.js';

// Type definitions for Hono context with Better Auth
type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const app = new Hono<{
  Variables: AuthVariables;
}>();

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
// CORS configuration for Better Auth
app.use('*', cors({
  origin: (origin: string | undefined) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    if (!origin) return undefined;
    if (allowedOrigins.includes(origin) || origin.startsWith('exp://') || origin.startsWith('granite://')) {
      return origin;
    }
    return undefined;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Rate limiting
app.use('*', rateLimitMiddleware);

// Better Auth session middleware - extract session for all routes
app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set('user', null);
    c.set('session', null);
  } else {
    c.set('user', session.user);
    c.set('session', session.session);
  }
  
  return next();
});

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount Better Auth handler
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

// Authentication middleware for protected routes
const requireAuth = async (c: any, next: any) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
};

// Protected routes - require authentication
app.use('/api/notes/*', requireAuth);
app.use('/api/sync/*', requireAuth);
app.use('/api/users/*', requireAuth);

app.route('/api/notes', notesRoutes);
app.route('/api/sync', syncRoutes);
app.route('/api/users', userRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  
  if (err instanceof HTTPException) {
    return c.json(
      { error: err.message },
      err.status
    );
  }
  
  return c.json(
    { error: 'Internal Server Error' },
    500
  );
});

// Start server
const port = parseInt(process.env.PORT || '8080');

console.log(`🚀 Granite API Server starting on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
