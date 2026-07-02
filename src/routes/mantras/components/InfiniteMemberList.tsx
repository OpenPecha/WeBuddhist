import { useTranslate } from "@tolgee/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getMemberInitials } from "../utils/groupUtils.ts";

type MemberRowProps = {
  fullname: string;
  username?: string | null;
  avatarUrl?: string | null;
  subtitle?: string | null;
};

const MemberRow = ({
  fullname,
  username,
  avatarUrl,
  subtitle,
}: MemberRowProps) => {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-amber-50 bg-white px-4 py-3">
      <Avatar className="size-10 border border-amber-100">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback className="bg-amber-50 text-sm text-amber-800">
          {getMemberInitials(fullname)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{fullname}</p>
        {(username || subtitle) && (
          <p className="truncate text-sm text-gray-500">
            {subtitle ?? `@${username}`}
          </p>
        )}
      </div>
    </li>
  );
};

type InfiniteMemberListProps = {
  members: MemberRowProps[];
  total: number;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  sentinelRef: (node?: Element | null) => void;
  emptyMessage: string;
};

export const InfiniteMemberList = ({
  members,
  total,
  isLoading,
  isFetchingNextPage,
  sentinelRef,
  emptyMessage,
}: InfiniteMemberListProps) => {
  const { t } = useTranslate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 px-6 py-10 text-center text-gray-600">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        {t("mantras.showing_members", "Showing {count} of {total} members", {
          count: members.length,
          total,
        })}
      </p>
      <ul className="space-y-2">
        {members.map((member, index) => (
          <MemberRow
            key={`${member.fullname}-${member.username ?? index}`}
            {...member}
          />
        ))}
      </ul>
      <div ref={sentinelRef} className="h-1" aria-hidden="true" />
      {isFetchingNextPage && (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      )}
    </div>
  );
};

export default MemberRow;
