import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking and adding test users (without deleting existing data)...');
  
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  // 检查并添加学生用户
  const existingStudent = await prisma.user.findUnique({
    where: { email: 'student@shiji.com' },
  });
  
  if (!existingStudent) {
    const studentUser = await prisma.user.create({
      data: {
        email: 'student@shiji.com',
        password: hashedPassword,
        name: '李同学',
        role: 'STUDENT',
        school: '诗迹中学',
        grade: '高一',
      },
    });
    console.log(`✅ Created student user: ${studentUser.email} (password: 123456)`);
  } else {
    console.log(`ℹ️ Student user already exists: ${existingStudent.email}`);
  }
  
  // 检查并添加教师用户
  const existingTeacher = await prisma.user.findUnique({
    where: { email: 'teacher@shiji.com' },
  });
  
  if (!existingTeacher) {
    const teacherUser = await prisma.user.create({
      data: {
        email: 'teacher@shiji.com',
        password: hashedPassword,
        name: '王老师',
        role: 'TEACHER',
        school: '诗迹中学',
        subject: '语文',
      },
    });
    console.log(`✅ Created teacher user: ${teacherUser.email} (password: 123456)`);
  } else {
    console.log(`ℹ️ Teacher user already exists: ${existingTeacher.email}`);
  }
  
  console.log('\n🎉 Done! All existing data preserved.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
