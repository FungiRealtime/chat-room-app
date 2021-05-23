import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

async function main() {
  let roomsNames: string[] = ["The Programmer's Hangout", "Neko", "Chill"];

  await Promise.all(
    roomsNames.map(async (roomName) => {
      return prisma.room.upsert({
        where: { name: roomName },
        update: {},
        create: {
          name: roomName,
          owner: {
            create: {
              email: "yo@gabrielmendezc.com",
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
