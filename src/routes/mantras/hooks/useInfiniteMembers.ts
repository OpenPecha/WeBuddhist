import { useEffect } from "react";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import type { PaginatedMembersResult } from "../types.ts";
import { MEMBERS_PAGE_SIZE } from "../api/accumulatorApi.ts";

type UseInfiniteMembersOptions<T> = {
  queryKey: (string | number)[];
  fetchPage: (
    skip: number,
    limit: number,
  ) => Promise<PaginatedMembersResult<T>>;
  enabled?: boolean;
};

export const useInfiniteMembers = <T>({
  queryKey,
  fetchPage,
  enabled = true,
}: UseInfiniteMembersOptions<T>) => {
  const membersQuery = useInfiniteQuery(
    queryKey,
    ({ pageParam = 0 }) => fetchPage(pageParam, MEMBERS_PAGE_SIZE),
    {
      enabled,
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage, allPages) => {
        const totalFetched = allPages.reduce(
          (sum, page) => sum + page.items.length,
          0,
        );
        return totalFetched < lastPage.total ? totalFetched : undefined;
      },
    },
  );

  const members = membersQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const total = membersQuery.data?.pages[0]?.total ?? 0;
  const { hasNextPage, isFetchingNextPage, fetchNextPage, isLoading, error } =
    membersQuery;

  const { ref: sentinelRef, inView: isBottomSentinelVisible } = useInView({
    threshold: 0.1,
    rootMargin: "80px",
  });

  useEffect(() => {
    if (isBottomSentinelVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isBottomSentinelVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    members,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    sentinelRef,
  };
};
