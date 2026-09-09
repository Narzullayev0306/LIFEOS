import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.habit.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: 'Odat topilmadi' }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, category, frequency, color, archived } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (color !== undefined) updateData.color = color;
    if (archived !== undefined) updateData.archived = Boolean(archived);

    const habit = await prisma.habit.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, habit });
  } catch (error) {
    console.error('Habit update error:', error);
    return NextResponse.json({ error: 'Odatni yangilashda xatolik' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.habit.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: 'Odat topilmadi' }, { status: 404 });
    }

    await prisma.habit.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Odat o‘chirildi' });
  } catch (error) {
    console.error('Habit delete error:', error);
    return NextResponse.json({ error: 'Odatni o‘chirishda xatolik' }, { status: 500 });
  }
}
