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
    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: 'Vazifa topilmadi' }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      description,
      priority,
      status,
      category,
      estimatedMinutes,
      actualMinutes,
      startTime,
      endTime,
      scheduledDate,
      isFixed,
      skippedReason,
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category;
    if (estimatedMinutes !== undefined) updateData.estimatedMinutes = Number(estimatedMinutes);
    if (actualMinutes !== undefined) updateData.actualMinutes = Number(actualMinutes);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (isFixed !== undefined) updateData.isFixed = Boolean(isFixed);
    if (skippedReason !== undefined) updateData.skippedReason = skippedReason;
    if (scheduledDate !== undefined) updateData.scheduledDate = new Date(scheduledDate);

    if (status !== undefined) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      } else if (status === 'PENDING' || status === 'IN_PROGRESS') {
        updateData.completedAt = null;
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Task update error:', error);
    return NextResponse.json({ error: 'Vazifani yangilashda xatolik yuz berdi' }, { status: 500 });
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
    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: 'Vazifa topilmadi' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Vazifa o‘chirildi' });
  } catch (error) {
    console.error('Task delete error:', error);
    return NextResponse.json({ error: 'Vazifani o‘chirishda xatolik yuz berdi' }, { status: 500 });
  }
}
