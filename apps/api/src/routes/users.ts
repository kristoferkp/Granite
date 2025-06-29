import { Hono } from 'hono';

const users = new Hono();

// Get user profile
users.get('/profile', async (c) => {
  const user = c.get('user');
  
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  });
});

// Update user preferences
users.put('/preferences', async (c) => {
  const user = c.get('user');
  // TODO: Implement update preferences with user.id
  return c.json({ 
    message: 'Preferences updated',
    userId: user.id 
  });
});

export default users;
