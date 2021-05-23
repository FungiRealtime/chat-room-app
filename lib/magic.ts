import { Magic } from "magic-sdk";

let createMagic = () => {
  return (
    typeof window != "undefined" &&
    new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!)
  );
};

let magic = createMagic() as Magic;

export { magic };
