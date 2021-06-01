export function randomAvatarColor() {
  let letters = "BCDEF".split("");
  let color = "#";

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }

  return color;
}

export function createNicknameFromEmail(email: string) {
  return email.split("@")[0];
}
