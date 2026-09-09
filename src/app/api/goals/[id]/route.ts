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
    const existing = await prisma.goal.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: 'Maqsad topilmadi' }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, progress, status, priority, targetDate, toggleMilestoneId } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;
    if (progress !== undefined) updateData.progress = Number(progress);

    // If toggling a milestone
    if (toggleMilestoneId) {
      const milestone = await prisma.milestone.findUnique({
        where: { id: toggleMilestoneId },
      });
      if (milestone && milestone.goalId === id) {
        const nextState = !milestone.isCompleted;
        await prisma.milestone.update({
          where: { id: toggleMilestoneId },
          data: {
            isCompleted: nextState,
            completedAt: nextState ? new Date() : null,
          },
        });

        // Recalculate goal progress from all milestones
        const allMilestones = await prisma.milestone.findMany({
          where: { goalId: id },
        });
        const completedCount = allMilestones.filter((m) =>
          m.id === toggleMilestoneId ? nextState : m.isCompleted
        ).length;
        updateData.progress = Math.round((completedCount / allMilestones.length) * 100);
      }
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: updateData,
      include: { milestones: true },
    });

    return NextResponse.json({ success: true, goal: updated });
  } catch (error) {
    console.error('Goal update error:', error);
    return NextResponse.json({ error: 'Maqsadni yangilashda xatolik' }, { status: 500 });
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
    const existing = await prisma.goal.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: 'Maqsad topilmadi' }, { status: 404 });
    }

    await prisma.goal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Maqsad o‘chirildi' });
  } catch (error) {
    console.error('Goal delete error:', error);
    return NextResponse.json({ error: 'Maqsadni o‘chirishda xatolik' }, { status: 500 });
  }
}
