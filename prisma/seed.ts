import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting LIFEOS database seed...');

  // 1. Create or update Demo User
  const passwordHash = await bcrypt.hash('LifeOS2026!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@lifeos.local' },
    update: {
      username: 'azizbek',
      displayName: 'Azizbek',
      coverPreset: 'aurora',
      bio: 'LIFEOS foydalanuvchisi. Dasturlash, koreys tili (TOPIK 5) va intizomli hayot tarzi ixlosmandi.',
      occupation: 'Software Engineer & Language Enthusiast',
      education: 'Toshkent Axborot Texnologiyalari Universiteti',
      location: 'Toshkent, O‘zbekiston',
      birthday: '2001-03-06',
      phone: '+998 90 123 45 67',
    },
    create: {
      email: 'demo@lifeos.local',
      name: 'Azizbek Narzullayev',
      username: 'azizbek',
      displayName: 'Azizbek',
      coverPreset: 'aurora',
      bio: 'LIFEOS foydalanuvchisi. Dasturlash, koreys tili (TOPIK 5) va intizomli hayot tarzi ixlosmandi.',
      occupation: 'Software Engineer & Language Enthusiast',
      education: 'Toshkent Axborot Texnologiyalari Universiteti',
      location: 'Toshkent, O‘zbekiston',
      birthday: '2001-03-06',
      phone: '+998 90 123 45 67',
      passwordHash,
      privacy: {
        create: {
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
        },
      },
      settings: {
        create: {
          timezone: 'Asia/Tashkent',
          locale: 'uz-UZ',
          theme: 'dark',
          accentColor: 'indigo',
          uiDensity: 'comfortable',
          reducedMotion: false,
          currency: 'UZS',
          dashboardWidgetsJson: '[]',
          onboardingCompleted: true,
          taskReminders: true,
          studyReminders: true,
          habitReminders: true,
          expenseReminders: true,
        },
      },
      timeSchedule: {
        create: {
          wakeTime: '06:30',
          sleepTime: '23:00',
          workStartTime: '09:00',
          workEndTime: '18:00',
          studyStartTime: '19:30',
          studyEndTime: '21:30',
          fixedBlocksJson: JSON.stringify([
            { title: 'Ish vaqti (Work)', startTime: '09:00', endTime: '18:00', days: [1, 2, 3, 4, 5] },
            { title: 'Kechki sport (Gym)', startTime: '18:30', endTime: '19:30', days: [1, 3, 5] },
          ]),
        },
      },
      topikGoal: {
        create: {
          targetLevel: 5,
          targetScore: 210,
          currentScore: 160,
          examDate: new Date('2026-10-18T09:00:00Z'),
          dailyVocabTarget: 25,
          dailyStudyMinutes: 90,
        },
      },
    },
  });

  console.log(`👤 User initialized: ${user.email} (${user.id})`);

  // 2. Default Expense Categories
  const categories = [
    { name: "Oziq-ovqat va Kafe", icon: "utensils", color: "#10b981" },
    { name: "Transport va Yo'l", icon: "car", color: "#3b82f6" },
    { name: "Ta'lim va Kitoblar", icon: "book-open", color: "#8b5cf6" },
    { name: "Uy va Kommunal", icon: "home", color: "#f59e0b" },
    { name: "Salomatlik va Sport", icon: "activity", color: "#ec4899" },
    { name: "Ko'ngilochar", icon: "film", color: "#6366f1" },
    { name: "Boshqa xarajatlar", icon: "tag", color: "#64748b" },
  ];

  for (const cat of categories) {
    await prisma.expenseCategory.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: cat.name,
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      },
    });
  }

  // 3. Current Month Budget & Expenses
  const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-03"
  await prisma.budget.upsert({
    where: {
      userId_month: {
        userId: user.id,
        month: currentMonth,
      },
    },
    update: {},
    create: {
      userId: user.id,
      month: currentMonth,
      amount: 4500000, // 4.5M UZS
    },
  });

  const foodCat = await prisma.expenseCategory.findFirst({
    where: { userId: user.id, name: "Oziq-ovqat va Kafe" },
  });

  if (foodCat) {
    const today = new Date().toISOString().slice(0, 10);
    const existingExpense = await prisma.expense.findFirst({
      where: { userId: user.id, description: "Tushlik va qahva" },
    });
    if (!existingExpense) {
      await prisma.expense.create({
        data: {
          userId: user.id,
          categoryId: foodCat.id,
          amount: 65000,
          date: today,
          description: "Tushlik va qahva",
        },
      });
    }
  }

  // Sample Income
  const existingIncome = await prisma.income.findFirst({
    where: { userId: user.id, source: "Oylik maosh" },
  });
  if (!existingIncome) {
    await prisma.income.create({
      data: {
        userId: user.id,
        source: "Oylik maosh",
        amount: 8000000,
        date: new Date().toISOString().slice(0, 10),
        description: "Asosiy ish oyligi",
      },
    });
  }

  // 4. TOPIK Vocabulary Database (Rich bilingual dataset)
  const vocabList = [
    {
      korean: '경제적',
      uzbek: 'iqtisodiy, tejamkor',
      hanja: '經濟的',
      pos: 'noun',
      level: 4,
      exampleKo: '이 방법은 시간과 비용 면에서 매우 경제적이다.',
      exampleUz: 'Bu usul vaqt va xarajat jihatidan juda tejamkordir.',
      category: 'ACADEMIC',
    },
    {
      korean: '극복하다',
      uzbek: 'yengmoq, yengib o‘tmoq',
      hanja: '克服--',
      pos: 'verb',
      level: 4,
      exampleKo: '어려운 환경을 극복하고 성공을 거두었다.',
      exampleUz: 'Qiyin sharoitlarni yengib o‘tib, muvaffaqiyatga erishdi.',
      category: 'SOCIETY',
    },
    {
      korean: '기여하다',
      uzbek: 'hissa qo‘shmoq',
      hanja: '寄與--',
      pos: 'verb',
      level: 5,
      exampleKo: '과학 기술의 발전은 인류의 번영에 크게 기여했다.',
      exampleUz: 'Ilm-fan va texnika taraqqiyoti insoniyat farovonligiga katta hissa qo‘shdi.',
      category: 'ACADEMIC',
    },
    {
      korean: '바람직하다',
      uzbek: 'maqsadga muvofiq, ma’qul',
      pos: 'adjective',
      level: 4,
      exampleKo: '문제 해결을 위해서는 대화를 통한 접근이 바람직하다.',
      exampleUz: 'Muammoni hal qilish uchun suhbat orqali yondashish ma’quldir.',
      category: 'GENERAL',
    },
    {
      korean: '추진하다',
      uzbek: 'amalga oshirmoq, ilgari surmoq',
      hanja: '推進--',
      pos: 'verb',
      level: 5,
      exampleKo: '정부는 새로운 일자리 창출 정책을 강력히 추진하고 있다.',
      exampleUz: 'Hukumat yangi ish o‘rinlari yaratish siyosatini faol amalga oshirmoqda.',
      category: 'ACADEMIC',
    },
    {
      korean: '다양성',
      uzbek: 'xilma-xillik',
      hanja: '多樣性',
      pos: 'noun',
      level: 4,
      exampleKo: '문화적 다양성을 존중하는 태도가 필요하다.',
      exampleUz: 'Madaniy xilma-xillikni hurmat qiladigan munosabat zarur.',
      category: 'CULTURE',
    },
    {
      korean: '효율적',
      uzbek: 'samarali',
      hanja: '效率的',
      pos: 'noun',
      level: 4,
      exampleKo: '시간을 효율적으로 관리해야 목표를 달성할 수 있다.',
      exampleUz: 'Vaqtni samarali boshqarsagina maqsadga erishish mumkin.',
      category: 'GENERAL',
    },
    {
      korean: '환경오염',
      uzbek: 'atrof-muhit ifloslanishi',
      hanja: '環境汚染',
      pos: 'noun',
      level: 3,
      exampleKo: '플라스틱 쓰레기는 심각한 환경오염을 유발한다.',
      exampleUz: 'Plastik chiqindilar jiddiy atrof-muhit ifloslanishiga olib keladi.',
      category: 'SCIENCE',
    },
    {
      korean: '현상',
      uzbek: 'hodisa, fenomen',
      hanja: '現象',
      pos: 'noun',
      level: 4,
      exampleKo: '저출산 현상은 사회적인 큰 문제로 대두되었다.',
      exampleUz: 'Tug‘ilish darajasining pasayishi hodisasi katta ijtimoiy muammo sifatida yuzaga chiqdi.',
      category: 'SOCIETY',
    },
    {
      korean: '유지하다',
      uzbek: 'saqlab turmoq, davom ettirmoq',
      hanja: '維持--',
      pos: 'verb',
      level: 3,
      exampleKo: '건강을 유지하기 위해 매일 규칙적으로 운동한다.',
      exampleUz: 'Salomatlikni saqlash uchun har kuni muntazam ravishda sport bilan shug‘ullanaman.',
      category: 'HEALTH',
    },
    {
      korean: '예측하다',
      uzbek: 'oldindan aytmoq, taxmin qilmoq',
      hanja: '豫測--',
      pos: 'verb',
      level: 4,
      exampleKo: '전문가들은 내년 경제 성장률을 긍정적으로 예측했다.',
      exampleUz: 'Mutaxassislar keyingi yilgi iqtisodiy o‘sish sur’atini ijobiy baholashdi.',
      category: 'ACADEMIC',
    },
    {
      korean: '반영하다',
      uzbek: 'aks ettirmoq',
      hanja: '反映--',
      pos: 'verb',
      level: 4,
      exampleKo: '이 소설은 당시의 사회적 현실을 잘 반영하고 있다.',
      exampleUz: 'Ushbu roman o‘sha davrdagi ijtimoiy voqelikni yaxshi aks ettiradi.',
      category: 'CULTURE',
    },
  ];

  for (const v of vocabList) {
    const vocab = await prisma.topikVocab.upsert({
      where: { korean: v.korean },
      update: {},
      create: v,
    });

    // Create default review log for user
    await prisma.vocabReviewLog.upsert({
      where: {
        userId_vocabId: {
          userId: user.id,
          vocabId: vocab.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        vocabId: vocab.id,
        repetitions: 1,
        intervalDays: 1,
        easeFactor: 2.5,
        nextReviewDate: new Date(),
      },
    });
  }

  // 5. TOPIK Grammar Database
  const grammarList = [
    {
      pattern: '-기 마련이다',
      meaningUz: '...bo‘lishi tabiiy / muqarrar',
      level: 4,
      explanation: 'Har qanday ish yoki harakat tabiiy qonuniyat sifatida sodir bo‘lishini ifodalaydi.',
      usageNote: 'Faqat fe’l va sifatlarga qo‘shiladi. Doimiy haqiqat yoki kutilgan natijalarda qo‘llaniladi.',
      category: 'NATURAL_RESULT',
      examplesJson: JSON.stringify([
        { ko: '시간이 지나면 상처는 아물기 마련이다.', uz: 'Vaqt o‘tsa, jarohat bitishi tabiiydir.' },
        { ko: '노력하지 않으면 실패하기 마련이다.', uz: 'Mehnat qilinmasa, mag‘lubiyatga uchrash muqarrardir.' },
      ]),
      practiceJson: JSON.stringify([
        {
          question: '사람은 누구나 나이가 들면 건강이 약해(      ).',
          options: ['지기 마련이다', '질 뿐만 아니라', '지는 셈이다', '지도록 하다'],
          answer: '지기 마련이다',
          explanation: 'Yosh o‘tishi bilan sog‘liq zaiflashishi tabiiy holat bo‘lgani uchun "-기 마련이다" to‘g‘ri javob.',
        },
      ]),
    },
    {
      pattern: '-(으)ㄹ 뿐만 아니라',
      meaningUz: 'nafaqat ..., balki ... ham',
      level: 4,
      explanation: 'Oldingi faktga qo‘shimcha ravishda boshqa bir holat yoki xususiyat ham mavjudligini bildiradi.',
      usageNote: 'Otlar bilan "뿐만 아니라", fe’l/sifatlar bilan "-(으)ㄹ 뿐만 아니라" ishlatiladi.',
      category: 'ADDITION',
      examplesJson: JSON.stringify([
        { ko: '그는 영어를 잘할 뿐만 아니라 한국어도 유창하다.', uz: 'U nafaqat ingliz tilini, balki koreys tilini ham ravon biladi.' },
        { ko: '이 음식은 맛이 좋을 뿐만 아니라 건강에도 유익하다.', uz: 'Bu taom nafaqat mazali, balki sog‘liq uchun ham foydalidir.' },
      ]),
      practiceJson: JSON.stringify([
        {
          question: '이 스마트폰은 디자인이 예쁠 (      ) 기능도 뛰어나다.',
          options: ['뿐만 아니라', '느라고', '자마자', '기 마련이다'],
          answer: '뿐만 아니라',
          explanation: 'Chiroyli dizaynga qo‘shimcha ravishda kuchli funksiyalarni ham qo‘shgan holda ta’riflayapti.',
        },
      ]),
    },
    {
      pattern: '-느라고',
      meaningUz: '... sababli / ... deb (salbiy natija)',
      level: 3,
      explanation: 'Biror harakat bilan band bo‘lish oqibatida boshqa bir ishni bajara olmaganlik yoki salbiy oqibat kelib chiqqanini ifodalaydi.',
      usageNote: 'Faqat harakat fe’llariga qo‘shiladi. Orqasidan odatda salbiy yoki qiyin vaziyat keladi.',
      category: 'CAUSE',
      examplesJson: JSON.stringify([
        { ko: '어젯밤 시험공부를 하느라고 잠을 거의 못 잤다.', uz: 'Kecha imtihonga tayyorlanaman deb deyarli uxlay olmadim.' },
        { ko: '이사 준비를 하느라고 정신이 없었다.', uz: 'Ko‘chishga tayyorgarlik ko‘raman deb hushim joyida emas edi.' },
      ]),
      practiceJson: JSON.stringify([
        {
          question: '친구와 통화를 (      ) 지하철을 놓쳤다.',
          options: ['하느라고', '하자마자', '하기 마련이라', '하는 셈이라'],
          answer: '하느라고',
          explanation: 'Telefon orqali gaplashish bilan band bo‘lib, metroga ulgura olmaganini ifodalaydi.',
        },
      ]),
    },
  ];

  for (const g of grammarList) {
    await prisma.topikGrammar.upsert({
      where: { pattern: g.pattern },
      update: {},
      create: g,
    });
  }

  // 6. TOPIK Writing Prompts (51, 52, 53, 54)
  const prompts = [
    {
      promptNumber: 51,
      title: 'Xat va e’lon to‘ldirish ( 실용문 빈칸 채우기 )',
      description: 'Rasmiy e’lon yoki xatdagi (ㄱ) va (ㄴ) bo‘shliqlariga mos keladigan so‘z birikmalarini yozing.',
      instructions: 'Qisqa va xushmuomala rasmiy uslubda (하십시오체 / 합니다) yozing.',
      sampleAnswer: 'ㄱ: 참석해 주시기 바랍니다\nㄴ: 연락을 주시면 감사하겠습니다',
      rubricJson: JSON.stringify({ grammar: 5, context: 5, total: 10 }),
    },
    {
      promptNumber: 52,
      title: 'Ilmiy/ma’rifiy matn bo‘shliq to‘ldirish ( 설명문 빈칸 채우기 )',
      description: 'Mantiqiy bog‘liqlik va qonuniyatni ifodalovchi (ㄱ) va (ㄴ) jumlalarini yozing.',
      instructions: 'Xolis ilmiy uslubda (한다체) yozing.',
      sampleAnswer: 'ㄱ: 온도가 낮아지기 때문이다\nㄴ: 부피가 줄어들게 된다',
      rubricJson: JSON.stringify({ logic: 5, grammar: 5, total: 10 }),
    },
    {
      promptNumber: 53,
      title: 'Grafik va diagramma tahlili inshosi (200-300 so‘z)',
      description: 'Berilgan statistik ma’lumotlar, sabablar va istiqbolni izchil matn shaklida ifodalang.',
      instructions: 'Faqat keltirilgan faktlarga asoslaning, shaxsiy fikr qo‘shmang.',
      sampleAnswer: '최근 10년간 1인 가구의 비율이 급격히 증가한 것으로 나타났다...',
      rubricJson: JSON.stringify({ content: 12, structure: 10, language: 8, total: 30 }),
    },
    {
      promptNumber: 54,
      title: 'Katta mavzuli insho (600-700 so‘z)',
      description: 'Zamonaviy jamiyatdagi ijtimoiy yoki falsafiy mavzu bo‘yicha 3 ta yo‘naltiruvchi savolga javob bering.',
      instructions: 'Kirish, asosiy qism va xulosadan iborat mantiqiy strukturaga ega bo‘lsin.',
      sampleAnswer: '현대 사회에서 인공지능의 발전은 우리의 삶을 혁신적으로 변화시키고 있다...',
      rubricJson: JSON.stringify({ logic: 20, structure: 15, expression: 15, total: 50 }),
    },
  ];

  for (const p of prompts) {
    const existing = await prisma.writingPrompt.findFirst({
      where: { promptNumber: p.promptNumber },
    });
    if (!existing) {
      await prisma.writingPrompt.create({ data: p });
    }
  }

  // 7. TOPIK Reading & Listening
  const readingEx = await prisma.topikReading.findFirst();
  if (!readingEx) {
    await prisma.topikReading.create({
      data: {
        title: '환경 보호와 경제 성장의 조화',
        level: 4,
        passage:
          '환경 보호와 경제 성장은 흔히 상충되는 것으로 여겨져 왔다. 그러나 최근에는 친환경 기술 개발을 통해 두 가지 목표를 동시에 달성하려는 시도가 늘고 있다. 녹색 산업에 대한 투자는 새로운 일자리를 창출하고 지속 가능한 발전을 가능하게 한다.',
        questionType: 'MAIN_IDEA',
        questionsJson: JSON.stringify([
          {
            id: 'r1',
            question: '이 글의 중심 생각으로 가장 알맞은 것을 고르십시오.',
            options: [
              '환경 보호는 경제 성장을 저해한다.',
              '친환경 기술을 통해 환경과 경제의 동시 발전이 가능하다.',
              '녹색 산업 투자는 아직 이르다.',
              '일자리 창출을 위해 환경 규제를 완화해야 한다.',
            ],
            answer: '친환경 기술을 통해 환경과 경제의 동시 발전이 가능하다.',
            explanation: 'Matnda atrof-muhit va iqtisodiyot yangi texnologiyalar vositasida birga rivojlanishi mumkinligi ta’kidlangan.',
          },
        ]),
      },
    });
  }

  // 8. Core Habits
  const habits = [
    { name: 'Koreys tili 50 ta so‘z takrorlash', category: 'STUDY', frequency: 'DAILY', color: '#8b5cf6' },
    { name: 'Ertalabki rejalashtirish (LIFEOS)', category: 'DISCIPLINE', frequency: 'DAILY', color: '#6366f1' },
    { name: 'Kunlik xarajatlarni qayd etish', category: 'FINANCE', frequency: 'DAILY', color: '#10b981' },
    { name: 'Kamida 7 soat sifatli uyqu', category: 'HEALTH', frequency: 'DAILY', color: '#3b82f6' },
  ];

  for (const h of habits) {
    const existing = await prisma.habit.findFirst({
      where: { userId: user.id, name: h.name },
    });
    if (!existing) {
      const habit = await prisma.habit.create({
        data: {
          userId: user.id,
          name: h.name,
          category: h.category,
          frequency: h.frequency,
          color: h.color,
          currentStreak: 4,
          bestStreak: 12,
        },
      });

      // Add completions for past few days
      const today = new Date();
      for (let i = 0; i < 3; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        await prisma.habitCompletion.upsert({
          where: {
            habitId_date: {
              habitId: habit.id,
              date: dateStr,
            },
          },
          update: {},
          create: {
            habitId: habit.id,
            userId: user.id,
            date: dateStr,
            completed: true,
          },
        });
      }
    }
  }

  // 9. Goals
  const existingGoal = await prisma.goal.findFirst({
    where: { userId: user.id, title: "TOPIK II 5-daraja sertifikatini olish" },
  });
  if (!existingGoal) {
    await prisma.goal.create({
      data: {
        userId: user.id,
        title: "TOPIK II 5-daraja sertifikatini olish",
        description: "210+ ball to'plash va Janubiy Koreyada magistratura grantini yutish",
        category: "TOPIK",
        timeframe: "MONTHLY",
        priority: "HIGH",
        progress: 65,
        targetDate: new Date('2026-10-18T00:00:00Z'),
        milestones: {
          create: [
            { title: "2000 ta akademik so'z bazasini yakunlash", isCompleted: true },
            { title: "53-savol diagramma inshosini 15 daqiqada yozish", isCompleted: true },
            { title: "Kamida 5 ta to'liq sinov imtihoni (Mock) topshirish", isCompleted: false },
          ],
        },
      },
    });
  }

  // 10. Today Tasks
  const todayStr = new Date().toISOString().slice(0, 10);
  const tasks = [
    {
      title: "TOPIK 51-52 mashqlarini tahlil qilish",
      startTime: "07:30",
      endTime: "08:30",
      priority: "HIGH",
      category: "STUDY",
      status: "COMPLETED",
      completedAt: new Date(),
    },
    {
      title: "Asosiy loyiha ustida ishlash (Sprint)",
      startTime: "10:00",
      endTime: "13:00",
      priority: "URGENT",
      category: "WORK",
      status: "COMPLETED",
      completedAt: new Date(),
    },
    {
      title: "Koreys tili lug'atlarini takrorlash (SM-2)",
      startTime: "19:30",
      endTime: "20:30",
      priority: "HIGH",
      category: "STUDY",
      status: "IN_PROGRESS",
    },
    {
      title: "Haftalik byudjet va xarajatlar tahlili",
      startTime: "21:00",
      endTime: "21:45",
      priority: "MEDIUM",
      category: "FINANCE",
      status: "PENDING",
    },
  ];

  for (const t of tasks) {
    const existing = await prisma.task.findFirst({
      where: { userId: user.id, title: t.title },
    });
    if (!existing) {
      await prisma.task.create({
        data: {
          userId: user.id,
          title: t.title,
          startTime: t.startTime,
          endTime: t.endTime,
          priority: t.priority,
          category: t.category,
          status: t.status,
          scheduledDate: new Date(),
          completedAt: t.completedAt,
        },
      });
    }
  }

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
