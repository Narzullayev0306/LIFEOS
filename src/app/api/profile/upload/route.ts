import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getStorageProvider } from '@/lib/storage';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_COVER_SIZE = 8 * 1024 * 1024;  // 8 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    let buffer: Buffer;
    let mimeType: string;
    let type: 'avatar' | 'cover' = 'avatar';
    let originalFilename = 'image';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const uploadType = formData.get('type') as string | null;

      if (!file) {
        return NextResponse.json({ error: 'Fayl tanlanmagan' }, { status: 400 });
      }

      if (uploadType === 'cover') {
        type = 'cover';
      }

      mimeType = file.type;
      originalFilename = file.name || 'upload';
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      // JSON with base64 data payload
      const body = await req.json();
      const { data, type: bodyType, mime, filename } = body;

      if (!data || typeof data !== 'string') {
        return NextResponse.json({ error: 'Rasm ma’lumotlari topilmadi' }, { status: 400 });
      }

      if (bodyType === 'cover') {
        type = 'cover';
      }

      if (data.startsWith('data:')) {
        const matches = data.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return NextResponse.json({ error: 'Noto‘g‘ri rasm formati' }, { status: 400 });
        }
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        mimeType = mime || 'image/jpeg';
        buffer = Buffer.from(data, 'base64');
      }
      originalFilename = filename || 'upload';
    }

    // Validation
    if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
      return NextResponse.json(
        { error: 'Faqat JPEG, PNG, WebP yoki GIF formatidagi rasmlar qabul qilinadi' },
        { status: 400 }
      );
    }

    const maxSize = type === 'cover' ? MAX_COVER_SIZE : MAX_AVATAR_SIZE;
    if (buffer.length > maxSize) {
      const maxMb = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        { error: `Rasm hajmi ${maxMb}MB dan oshmasligi kerak` },
        { status: 400 }
      );
    }

    const storage = getStorageProvider();
    const folder = type === 'cover' ? 'covers' : 'avatars';

    // Get current user to replace existing image if needed
    const currentUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: { avatar: true, coverImage: true },
    });

    const oldUrl = type === 'cover' ? currentUser?.coverImage : currentUser?.avatar;

    const fileUrl = await storage.replace(oldUrl, {
      buffer,
      mimeType,
      originalFilename,
      folder,
    });

    // Update user record
    if (type === 'cover') {
      await prisma.user.update({
        where: { id: session.id },
        data: { coverImage: fileUrl },
      });
    } else {
      await prisma.user.update({
        where: { id: session.id },
        data: { avatar: fileUrl },
      });
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      type,
      message: `${type === 'cover' ? 'Muqova' : 'Avatar'} muvaffaqiyatli yuklandi`,
    });
  } catch (error) {
    console.error('Profile upload error:', error);
    return NextResponse.json({ error: 'Rasm yuklashda xatolik yuz berdi' }, { status: 500 });
  }
}
