import { supabase, supabaseServer } from '@/lib/supabase-server';

// GET /api/notes/[id] - Get a specific note
export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const { data: note, error } = await supabaseServer
      .from('notes')
      .select('*')
      .eq('id', params.id)
      .eq('userId', user.id)
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ note });
  } catch (error) {
    console.error('Error fetching note:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/notes/[id] - Update a note
export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
    const updateData: any = { updatedAt: new Date().toISOString() };
    
    if (body.title) updateData.title = body.title;
    if (body.storagePath) updateData.storagePath = body.storagePath;
    if (body.iv) updateData.iv = body.iv;

    const { data: note, error } = await supabaseServer
      .from('notes')
      .update(updateData)
      .eq('id', params.id)
      .eq('userId', user.id)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ note });
  } catch (error) {
    console.error('Error updating note:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    // First get the note to find storage path for cleanup
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('storagePath')
      .eq('id', params.id)
      .eq('userId', user.id)
      .single();

    if (fetchError) {
      return Response.json({ error: 'Note not found' }, { status: 404 });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('notes')
      .remove([note.storagePath]);

    if (storageError) {
      console.error('Failed to delete file from storage:', storageError);
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', params.id)
      .eq('userId', user.id);

    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    return Response.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
