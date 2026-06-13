import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking database users...');
  console.log('=' .repeat(60));
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true,
      school: true,
      grade: true,
      subject: true,
    },
  });
  
  if (users.length === 0) {
    console.log('❌ No users found in the database!');
    console.log('\n💡 You may want to:');
    console.log('   1. Register a new account');
    console.log('   2. Or run: npx tsx prisma/add-test-users.ts');
  } else {
    console.log(`✅ Found ${users.length} user(s) in the database:\n`);
    
    users.forEach((user, index) => {
      const isHash = user.password.startsWith('$2a$') || 
                    user.password.startsWith('$2b$') || 
                    user.password.startsWith('$2y$');
      
      console.log(`👤 User ${index + 1}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password type: ${isHash ? '🔒 bcrypt hash' : '📝 plain text'}`);
      if (user.school) console.log(`   School: ${user.school}`);
      if (user.grade) console.log(`   Grade: ${user.grade}`);
      if (user.subject) console.log(`   Subject: ${user.subject}`);
      console.log('');
    });
  }
  
  console.log('=' .repeat(60));
  console.log('💡 Hint: Make sure your backend server is restarted to apply code changes!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
