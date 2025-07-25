import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = 'admin123'; // bisa dari ENV untuk keamanan
  const hashedPassword = await bcrypt.hash(password, 10);

  // Cek apakah admin sudah ada
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: 'admin@hisam.ac.id',
        username: 'admin',
        name: 'Admin Sistem',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    console.log('✅ Admin user created!');
  } else {
    console.log('ℹ️ Admin already exists, skipped seeding.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
