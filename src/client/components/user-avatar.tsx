import { UserStatus } from ".prisma/client";
import clsx from "clsx";

type UserAvatarProps = {
  avatarColor: string;
  nickname: string;
  status?: UserStatus;
  displayStatus?: boolean;
};

let DARK = "#111827";

export function UserAvatar({
  avatarColor,
  nickname,
  status,
  displayStatus,
}: UserAvatarProps) {
  return (
    <div
      className="relative uppercase rounded-full text-sm min-h-8 h-8 min-w-8 w-8 flex items-center justify-center"
      style={{ backgroundColor: avatarColor, color: DARK }}
    >
      {nickname.slice(0, 2)}

      {displayStatus && (
        <div className="absolute -right-0.5 -bottom-0.5 bg-[#000000] w-3 h-3 rounded-full flex items-center justify-center">
          <div
            className={clsx(
              "w-2.5 h-2.5 rounded-full",

              status === UserStatus.ONLINE
                ? "bg-green-500"
                : status === UserStatus.IDLE
                ? "bg-red-700"
                : null
            )}
          />
          <span className="sr-only">
            {status === "ONLINE" ? "Online" : "Idle"}
          </span>
        </div>
      )}
    </div>
  );
}
