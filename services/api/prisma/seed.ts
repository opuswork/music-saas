import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, BlockType, AssetType, PracticeType, Category, Level } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// .env 로드
dotenv.config({ path: path.join(__dirname, '../.env') });

// datasource (단수형!)로 수정하여 DB URL 주입
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL as string }),
});


// prisma/seed.ts (Partial update)

async function seedMajorScalesLesson(courseId: string) {
  console.log('Creating Major Scales Lesson...');
  
  const lesson = await prisma.lesson.create({
    data: {
      title: 'Major Scales',
      orderIndex: 2,
      courseId: courseId,
    },
  });

  // 1. 연습 세션을 먼저 따로 생성합니다 (에러 추적을 위해)
  const practice = await createMajorScalePractice(lesson.id);
  console.log('Practice Session created:', practice.id);

  // 2. 이제 블록들을 생성합니다.
  await prisma.lessonBlock.createMany({
    data: [
      {
        lessonId: lesson.id,
        type: BlockType.TEXT,
        orderIndex: 1,
        content: `## Introduction\nA major scale is an ordered collection of seven pitch classes...`,
      },
      {
        lessonId: lesson.id,
        type: BlockType.PRACTICE_TOOL,
        orderIndex: 2,
        practiceId: practice.id, // 위에서 만든 ID 사용
      },
      {
        lessonId: lesson.id,
        type: BlockType.MUSIC_SCORE,
        orderIndex: 3,
        content: "C Major Scale Score",
        // assetId가 필요하다면 여기서 연결
      }
    ]
  });
  
  console.log('✅ Major Scales Blocks created successfully!');
}

async function main() {
  console.log('Cleanup existing data...');
  // 외래 키 제약 조건 때문에 삭제 순서가 중요합니다 (하위 -> 상위)
  await prisma.lessonBlock.deleteMany({});
  await prisma.practiceSession.deleteMany({});
  await prisma.lessonAsset.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({}); 

  console.log('Seeding new data...');

  // 1. 강사 생성 (이 코드가 강의 생성보다 위에 와야 합니다!)
  const instructor = await prisma.user.create({
    data: {
      email: 'teacher@musicapp.com',
      passwordHash: 'hashed_password',
      firstName: 'Alex',
      lastName: 'Piano',
      role: 'INSTRUCTOR',
    },
  });

  // 2. 강의 생성
  const course = await prisma.course.create({
    data: {
      title: 'Piano Basics 101',
      description: 'Learn the fundamentals of piano positioning.',
      category: Category.PIANO,
      level: Level.BEGINNER,
      instructorId: instructor.id, // 이제 정상적으로 참조 가능합니다.
    },
  });

  // 3. Major Scales 레슨 함수 호출
  await seedMajorScalesLesson(course.id);

  // 4. 추가 레슨 (Introduction) 생성
  const lesson = await prisma.lesson.create({
    data: {
      title: 'Introduction to the C Major Scale',
      orderIndex: 1,
      courseId: course.id,
    },
  });

  // 5. 블록 생성 (모델명 오타 확인: lessonBlock -> lessonBlock)
  await prisma.lessonBlock.create({
    data: {
      lessonId: lesson.id,
      type: BlockType.TEXT,
      orderIndex: 1,
      content: "## Welcome!\nToday we are learning the **C Major Scale**.",
    },
  });

  // 6. 연습 세션 생성 (스키마에 title이 없다면 제거하거나 추가 필요)
  const practice = await prisma.practiceSession.create({
    data: {
      lessonId: lesson.id,
      title: "Play C Major", // 에러나면 스키마 확인 필요
      instructions: "Play C4, E4, and G4 simultaneously.",
      type: PracticeType.MIDI_MATCH,
      correctData: { 
        requiredNotes: ["C4", "E4", "G4"]
      },
    },
  });

  // 연습용 연습 도구 블록 추가
  await prisma.lessonBlock.create({
    data: {
      lessonId: lesson.id,
      type: BlockType.PRACTICE_TOOL,
      orderIndex: 2,
      practiceId: practice.id,
    },
  });

  console.log('Seed successful!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

async function createMajorScalePractice(lessonId: string) {
  return prisma.practiceSession.create({
    data: {
      lessonId,
      title: 'C Major Scale Pattern',
      instructions: 'Play the C major scale from C4 to C5.',
      type: PracticeType.MIDI_MATCH,
      correctData: {
        requiredNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
        mode: 'scale',
      },
    },
  });
}
