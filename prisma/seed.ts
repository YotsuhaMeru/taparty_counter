import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(process.cwd(), 'data.json');
  if (!fs.existsSync(dataPath)) {
    console.log('data.json not found, skipping migration.');
    return;
  }

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);

  console.log(`Found ${data.users.length} users to migrate.`);

  for (const user of data.users) {
    console.log(`Migrating user: ${user.username} (${user.id})`);

    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        username: user.username,
        currentChallenge: user.currentChallenge,
      },
      create: {
        id: user.id,
        username: user.username,
        currentChallenge: user.currentChallenge,
      },
    });

    for (const device of user.devices) {
      console.log(`  Migrating device: ${device.credentialID}`);
      await prisma.authenticatorDevice.upsert({
        where: { credentialID: device.credentialID },
        update: {
          credentialPublicKey: device.credentialPublicKey,
          counter: device.counter,
          transports: device.transports,
          userId: user.id,
        },
        create: {
          credentialID: device.credentialID,
          credentialPublicKey: device.credentialPublicKey,
          counter: device.counter,
          transports: device.transports,
          userId: user.id,
        },
      });
    }
  }

  console.log('Migration completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
