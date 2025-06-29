import { Hono } from 'hono';

const notes = new Hono();

// Get all notes for authenticated user
notes.get('/', async (c) => {
  const user = c.get('user');
  // TODO: Implement get notes for user.id
  return c.json({ 
    notes: [],
    userId: (user as any)?.id 
  });
});

// Create a new note
notes.post('/', async (c) => {
  const user = c.get('user');
  // TODO: Implement create note for user.id
  return c.json({ 
    message: 'Note created',
    userId: (user as any)?.id 
  }, 201);
});

// Update a note
notes.put('/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  // TODO: Implement update note for user.id
  return c.json({ 
    message: `Note ${id} updated`,
    userId: (user as any)?.id 
  });
});

// Delete a note
notes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  // TODO: Implement delete note for user.id
  return c.json({ 
    message: `Note ${id} deleted`,
    userId: (user as any)?.id 
  });
});

export default notes;
