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
    const existing = await prisma.income.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: 'Daromad topilmadi' }, { status: 404 });
    }

    const body = await req.json();
    const { source, amount, description, date } = body;

    const updateData: any = {};
    if (source !== undefined) updateData.source = source.trim();
    if (amount !== undefined) updateData.amount = Number(amount);
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;

    const updated = await prisma.income.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, income: updated });
  } catch (error) {
    console.error('Income update error:', error);
    return NextResponse.json({ error: 'Daromadni yangilashda xatolik' }, { status: 500 });
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
    const existing = await prisma.income.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: 'Daromad topilmadi' }, { status: 404 });
    }

    await prisma.income.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Daromad o‘chirildi' });
  } catch (error) {
    console.error('Income delete error:', error);
    return NextResponse.json({ error: 'Daromadni o‘chirishda xatolik' }, { status: 500 });
  }
}
