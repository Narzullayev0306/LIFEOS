import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { validateUsername } from '@/lib/usernameValidator';
import { calculateProfileCompletion } from '@/lib/profileCompletion';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      displayName: true,
      username: true,
      avatar: true,
      coverImage: true,
      coverPreset: true,
      bio: true,
      occupation: true,
      education: true,
      location: true,
      birthday: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      settings: true,
      privacy: true,
      timeSchedule: true,
      topikGoal: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
  }

  // Calculate completion
  const completion = calculateProfileCompletion({
    name: user.name,
    displayName: user.displayName,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    occupation: user.occupation,
    education: user.education,
    location: user.location,
    birthday: user.birthday,
    hasTopikGoal: Boolean(user.topikGoal),
  });

  return NextResponse.json({ user, completion });
}

export async function PUT(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      displayName,
      username,
      avatar,
      coverImage,
      coverPreset,
      bio,
      occupation,
      education,
      location,
      birthday,
      phone,
      password,
      currentPassword,
      settings,
      privacy,
      timeSchedule,
    } = body;

    const updateData: {
      name?: string;
      displayName?: string | null;
      username?: string | null;
      avatar?: string | null;
      coverImage?: string | null;
      coverPreset?: string | null;
      bio?: string | null;
      occupation?: string | null;
      education?: string | null;
      location?: string | null;
      birthday?: string | null;
      phone?: string | null;
      passwordHash?: string;
    } = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ error: 'Ism bo‘sh bo‘lishi mumkin emas' }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (displayName !== undefined) {
      updateData.displayName = displayName ? displayName.trim() : null;
    }

    if (username !== undefined) {
      if (username && username.trim()) {
        const usernameCheck = validateUsername(username);
        if (!usernameCheck.isValid) {
          return NextResponse.json({ error: usernameCheck.error }, { status: 400 });
        }

        // Check uniqueness
        const existing = await prisma.user.findFirst({
          where: {
            username: usernameCheck.sanitized,
            NOT: { id: session.id },
          },
        });

        if (existing) {
          return NextResponse.json({ error: 'Bu username allaqachon band qilingan' }, { status: 400 });
        }

        updateData.username = usernameCheck.sanitized;
      } else {
        updateData.username = null;
      }
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    if (coverImage !== undefined) {
      updateData.coverImage = coverImage;
    }

    if (coverPreset !== undefined) {
      updateData.coverPreset = coverPreset;
    }

    if (bio !== undefined) {
      updateData.bio = bio ? bio.trim() : null;
    }

    if (occupation !== undefined) {
      updateData.occupation = occupation ? occupation.trim() : null;
    }

    if (education !== undefined) {
      updateData.education = education ? education.trim() : null;
    }

    if (location !== undefined) {
      updateData.location = location ? location.trim() : null;
    }

    if (birthday !== undefined) {
      updateData.birthday = birthday ? birthday.trim() : null;
    }

    if (phone !== undefined) {
      updateData.phone = phone ? phone.trim() : null;
    }

    // Password change check
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak' }, { status: 400 });
      }

      if (currentPassword) {
        const currentUser = await prisma.user.findUnique({
          where: { id: session.id },
          select: { passwordHash: true },
        });

        if (currentUser) {
          const isMatch = await verifyPassword(currentPassword, currentUser.passwordHash);
          if (!isMatch) {
            return NextResponse.json({ error: 'Joriy parol noto‘g‘ri kiritildi' }, { status: 400 });
          }
        }
      }

      updateData.passwordHash = await hashPassword(password);
    }

    // Execute user update
    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        username: true,
        avatar: true,
        coverImage: true,
        coverPreset: true,
        bio: true,
        occupation: true,
        education: true,
        location: true,
        birthday: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Update settings
    if (settings) {
      await prisma.userSettings.upsert({
        where: { userId: session.id },
        update: {
          timezone: settings.timezone,
          locale: settings.locale,
          theme: settings.theme,
          accentColor: settings.accentColor,
          uiDensity: settings.uiDensity,
          reducedMotion: settings.reducedMotion,
          currency: settings.currency,
          dashboardWidgetsJson: settings.dashboardWidgetsJson,
          notificationsEnabled: settings.notificationsEnabled,
          taskReminders: settings.taskReminders,
          studyReminders: settings.studyReminders,
          habitReminders: settings.habitReminders,
          expenseReminders: settings.expenseReminders,
          reviewReminders: settings.reviewReminders,
        },
        create: {
          userId: session.id,
          timezone: settings.timezone || 'Asia/Tashkent',
          locale: settings.locale || 'uz-UZ',
          theme: settings.theme || 'dark',
          accentColor: settings.accentColor || 'indigo',
          uiDensity: settings.uiDensity || 'comfortable',
          reducedMotion: Boolean(settings.reducedMotion),
          currency: settings.currency || 'UZS',
          dashboardWidgetsJson: settings.dashboardWidgetsJson || '[]',
        },
      });
    }

    // Update privacy
    if (privacy) {
      await prisma.profilePrivacy.upsert({
        where: { userId: session.id },
        update: {
          showEmail: privacy.showEmail ?? false,
          showPhone: privacy.showPhone ?? false,
          showLocation: privacy.showLocation ?? true,
          showBirthday: privacy.showBirthday ?? false,
          showOccupation: privacy.showOccupation ?? true,
          showEducation: privacy.showEducation ?? true,
          showStatistics: privacy.showStatistics ?? true,
          showGoals: privacy.showGoals ?? true,
          showTopik: privacy.showTopik ?? true,
          showDiscipline: privacy.showDiscipline ?? true,
          showActivity: privacy.showActivity ?? true,
        },
        create: {
          userId: session.id,
          showEmail: privacy.showEmail ?? false,
          showPhone: privacy.showPhone ?? false,
          showLocation: privacy.showLocation ?? true,
          showBirthday: privacy.showBirthday ?? false,
          showOccupation: privacy.showOccupation ?? true,
          showEducation: privacy.showEducation ?? true,
          showStatistics: privacy.showStatistics ?? true,
          showGoals: privacy.showGoals ?? true,
          showTopik: privacy.showTopik ?? true,
          showDiscipline: privacy.showDiscipline ?? true,
          showActivity: privacy.showActivity ?? true,
        },
      });
    }

    // Update timeSchedule
    if (timeSchedule) {
      await prisma.timeSchedule.upsert({
        where: { userId: session.id },
        update: {
          wakeTime: timeSchedule.wakeTime,
          sleepTime: timeSchedule.sleepTime,
          workStartTime: timeSchedule.workStartTime,
          workEndTime: timeSchedule.workEndTime,
          studyStartTime: timeSchedule.studyStartTime,
          studyEndTime: timeSchedule.studyEndTime,
        },
        create: {
          userId: session.id,
          wakeTime: timeSchedule.wakeTime || '06:30',
          sleepTime: timeSchedule.sleepTime || '23:00',
          workStartTime: timeSchedule.workStartTime || '09:00',
          workEndTime: timeSchedule.workEndTime || '18:00',
          studyStartTime: timeSchedule.studyStartTime || '19:30',
          studyEndTime: timeSchedule.studyEndTime || '21:30',
        },
      });
    }

    // Fetch refreshed complete state
    const fullUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        username: true,
        avatar: true,
        coverImage: true,
        coverPreset: true,
        bio: true,
        occupation: true,
        education: true,
        location: true,
        birthday: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        settings: true,
        privacy: true,
        timeSchedule: true,
        topikGoal: true,
      },
    });

    const completion = calculateProfileCompletion({
      name: fullUser?.name,
      displayName: fullUser?.displayName,
      username: fullUser?.username,
      avatar: fullUser?.avatar,
      bio: fullUser?.bio,
      occupation: fullUser?.occupation,
      education: fullUser?.education,
      location: fullUser?.location,
      birthday: fullUser?.birthday,
      hasTopikGoal: Boolean(fullUser?.topikGoal),
    });

    return NextResponse.json({
      success: true,
      message: 'Profil va sozlamalar muvaffaqiyatli saqlandi',
      user: fullUser,
      completion,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Profilni saqlashda xatolik yuz berdi' }, { status: 500 });
  }
}
