import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeUsername } from '@/lib/usernameValidator';

export async function GET(
  req: Request,
  props: { params: Promise<{ username: string }> }
) {
  try {
    const params = await props.params;
    const cleanUsername = sanitizeUsername(params.username);

    if (!cleanUsername) {
      return NextResponse.json({ error: 'Username kiritilmadi' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username: cleanUsername },
      include: {
        privacy: true,
        topikGoal: true,
        habits: { where: { archived: false } },
        goals: { where: { status: 'IN_PROGRESS' }, include: { milestones: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Bunday foydalanuvchi topilmadi' }, { status: 404 });
    }

    const privacy = user.privacy || {
      showEmail: false,
      showPhone: false,
      showLocation: true,
      showBirthday: false,
      showOccupation: true,
      showEducation: true,
      showStatistics: true,
      showGoals: true,
      showTopik: true,
      showDiscipline: true,
      showActivity: true,
    };

    // Calculate public stats if allowed
    let stats = null;
    if (privacy.showStatistics) {
      const completedTasks = await prisma.task.count({
        where: { userId: user.id, status: 'COMPLETED' },
      });
      const maxStreak = user.habits.length > 0 ? Math.max(...user.habits.map((h) => h.bestStreak)) : 0;

      stats = {
        completedTasks,
        bestStreak: maxStreak,
        activeHabitsCount: user.habits.length,
      };
    }

    const publicProfile = {
      username: user.username,
      name: user.name,
      displayName: user.displayName || user.name,
      avatar: user.avatar,
      coverImage: user.coverImage,
      coverPreset: user.coverPreset || 'midnight',
      bio: user.bio,
      joinedDate: user.createdAt,
      email: privacy.showEmail ? user.email : null,
      phone: privacy.showPhone ? user.phone : null,
      location: privacy.showLocation ? user.location : null,
      birthday: privacy.showBirthday ? user.birthday : null,
      occupation: privacy.showOccupation ? user.occupation : null,
      education: privacy.showEducation ? user.education : null,
      topikGoal: privacy.showTopik && user.topikGoal ? {
        targetLevel: user.topikGoal.targetLevel,
        targetScore: user.topikGoal.targetScore,
      } : null,
      goals: privacy.showGoals ? user.goals.map((g) => ({
        id: g.id,
        title: g.title,
        progress: g.progress,
        category: g.category,
      })) : null,
      statistics: stats,
    };

    return NextResponse.json({ profile: publicProfile });
  } catch (error) {
    console.error('Public profile fetch error:', error);
    return NextResponse.json({ error: 'Profilni yuklashda xatolik yuz berdi' }, { status: 500 });
  }
}
