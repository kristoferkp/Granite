import { Context, Next } from 'hono';

interface AuthContext extends Context {
  user?: {
    userId: string;
    email: string;
  };
}

export async function authMiddleware(c: AuthContext, next: Next) {
  const authorization = c.req.header('Authorization');
  
  if (!authorization) {
    return c.json({ error: 'No token provided' }, 401);
  }
  
  const token = authorization.replace('Bearer ', '');
  
  // Mock authentication for now
  if (token === 'mock-jwt-token' || token === 'mock-refreshed-token') {
    c.user = {
      userId: 'mock-user-id',
      email: 'test@example.com',
    };
    await next();
  } else {
    return c.json({ error: 'Invalid token' }, 401);
  }
}
