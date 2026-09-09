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
    const existing = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: 'Xarajat topilmadi' }, { status: 404 });
    }

    const body = await req.json();
    const { amount, categoryId, description, date } = body;

    const updateData: any = {};
    if (amount !== undefined) updateData.amount = Number(amount);
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;

    const updated = await prisma.expense.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, expense: updated });
  } catch (error) {
    console.error('Expense update error:', error);
    return NextResponse.json({ error: 'Xarajatni yangilashda xatolik' }, { status: 500 });
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
    const existing = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: 'Xarajat topilmadi' }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Xarajat o‘chirildi' });
  } catch (error) {
    console.error('Expense delete error:', error);
    return NextResponse.json({ error: 'Xarajatni o‘chirishda xatolik' }, { status: 500 });
  }
}
