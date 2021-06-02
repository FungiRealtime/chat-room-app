import { PrismaClient } from "@prisma/client";
import { createNicknameFromEmail } from "../src/server/utils/users";

let prisma = new PrismaClient();

async function main() {
  let emails = [
    "Ivah_Little20@gmail.com",
    "Jacky_Skiles62@yahoo.com",
    "Karen_Mante@hotmail.com",
    "Murl.Robel68@gmail.com",
    "Zaria42@yahoo.com",
    "Kira.Spencer64@yahoo.com",
    "Waino_Klein39@hotmail.com",
    "Ulices_Stamm@yahoo.com",
    "Santina.Bayer17@gmail.com",
    "Paris.Kuphal@gmail.com",
    "Geovanni97@yahoo.com",
    "Madonna.Buckridge@yahoo.com",
    "Mariane.Schulist@yahoo.com",
    "Ellis93@hotmail.com",
    "Desiree.DuBuque39@hotmail.com",
    "Kristin14@yahoo.com",
    "Delmer49@hotmail.com",
    "Mallory.Barrows@gmail.com",
    "Carolanne59@gmail.com",
    "Emmanuel_Farrell@yahoo.com",
    "Charley37@hotmail.com",
    "Cullen.Reinger18@yahoo.com",
    "Electa62@yahoo.com",
    "Giovanni_Wehner@hotmail.com",
    "Isaac.Erdman@hotmail.com",
    "Kelley_Sanford66@yahoo.com",
    "Monica_Robel42@gmail.com",
    "Vernon49@hotmail.com",
    "Bryana56@yahoo.com",
    "Nikita_Wiegand16@hotmail.com",
    "Hazle_Terry@hotmail.com",
    "Clarabelle_Waelchi@hotmail.com",
    "Wilhelm.Howell12@yahoo.com",
    "Sebastian57@gmail.com",
  ];

  await Promise.all(
    emails.map((email) =>
      prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          nickname: createNicknameFromEmail(email),
        },
      })
    )
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
