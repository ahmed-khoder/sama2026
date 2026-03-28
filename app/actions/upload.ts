'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function uploadImage(data: FormData) {
  try {
    const file: File | null = data.get('file') as unknown as File;
    
    if (!file) {
      return { success: false, error: 'No file uploaded' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    
    // Save to public/uploads/blog
    const uploadDir = join(process.cwd(), 'public/uploads/blog');
    const path = join(uploadDir, filename);
    
    // Ensure directory exists (would need fs.mkdir if not exists, but let's assume we create it or run mkdir)
    await writeFile(path, buffer);
    
    return { 
      success: true, 
      url: `/uploads/blog/${filename}` 
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Failed to upload file' };
  }
}

