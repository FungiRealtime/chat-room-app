import React from "react";
import type { UserStatus } from ".prisma/client";
import { UserAvatar } from "./user-avatar";

type SidebarUserProps = {
  user: {
    id: string;
    nickname: string;
    status: UserStatus;
    avatarColor: string;
  };
};

export function SidebarUser({ user }: SidebarUserProps) {
  return (
    <div className="flex space-x-3 items-center">
      <UserAvatar
        avatarColor={user.avatarColor}
        nickname={user.nickname}
        status={user.status}
        displayStatus
      />

      {/* User info */}
      <div className="flex-1">
        <span className="text-sm break-all">{user.nickname}</span>
      </div>
    </div>
  );
}
