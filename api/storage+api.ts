import { supabase } from '@/lib/supabase-server';

// POST /api/storage/upload - Upload encrypted content to Supabase Storage
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
    const { encryptedContent, fileName } = body;

    if (!encryptedContent || !fileName) {
      return Response.json({ error: 'Missing encrypted content or filename' }, { status: 400 });
    }

    // Upload encrypted content to Supabase Storage
    const filePath = `${user.id}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('notes')
      .upload(filePath, JSON.stringify(encryptedContent), {
        contentType: 'application/json',
      });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ storagePath: data.path });
  } catch (error) {
    console.error('Error uploading to storage:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/storage/download - Download encrypted content from Supabase Storage
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

    const url = new URL(request.url);
    const storagePath = url.searchParams.get('path');

    if (!storagePath) {
      return Response.json({ error: 'Missing storage path' }, { status: 400 });
    }

    // Verify the path belongs to the authenticated user
    if (!storagePath.startsWith(`${user.id}/`)) {
      return Response.json({ error: 'Unauthorized access to file' }, { status: 403 });
    }

    // Download encrypted content from Supabase Storage
    const { data, error } = await supabase.storage
      .from('notes')
      .download(storagePath);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const encryptedContent = await data.text();
    
    return Response.json({ encryptedContent: JSON.parse(encryptedContent) });
  } catch (error) {
    console.error('Error downloading from storage:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
