import { Hono } from 'hono';

const sync = new Hono();

// Sync notes with server
sync.post('/', async (c) => {
  const user = c.get('user');
  // TODO: Implement sync for user.id
  return c.json({ 
    notes: [],
    deletedNoteIds: [],
    syncCursor: 'cursor-' + Date.now(),
    conflicts: [],
    userId: (user as any)?.id
  });
});

export default sync;
