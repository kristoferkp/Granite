import { supabase, supabaseServer } from '@/lib/supabase-server';

// GET /api/notes - Get all notes for authenticated user
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return Response.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return Response.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Get notes metadata for user
    const { data: notes, error } = await supabaseServer
      .from('notes')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notes - Create a new note
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return Response.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return Response.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    const body = await request.json();
    const { title, storagePath, iv } = body;

    if (!title || !storagePath || !iv) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert note metadata
    const { data: note, error } = await supabaseServer
      .from('notes')
      .insert({
        userId: user.id,
        title,
        storagePath,
        iv,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ note });
  } catch (error) {
    console.error('Error creating note:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
