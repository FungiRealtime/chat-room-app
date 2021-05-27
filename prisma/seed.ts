import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

async function main() {
  let user = await prisma.user.upsert({
    where: { email: "yo@gabrielmendezc.com" },
    update: {},
    create: {
      email: "yo@gabrielmendezc.com",
    },
  });

  let roomsNames: string[] = ["The Programmer's Hangout", "Neko", "Chill"];

  await Promise.all(
    roomsNames.map(async (roomName) => {
      return prisma.room.create({
        data: {
          name: roomName,
          creator: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    })
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
