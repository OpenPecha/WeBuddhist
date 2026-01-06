import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import { getThreads, deleteThread } from "../services/threadService";

const LIMIT = 10;

export const useThreads = (
  email: string | undefined,
  application: string = "webuddhist",
) => {
  const queryClient = useQueryClient();

  const threadsQuery = useInfiniteQuery(
    ["threads", email],
    ({ pageParam = 0 }) =>
      getThreads({
        email: email!,
        application,
        skip: pageParam,
        limit: LIMIT,
      }),
    {
      enabled: !!email,
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage, allPages) => {
        const totalFetched = allPages.length * LIMIT;
        return totalFetched < lastPage.total ? totalFetched : undefined;
      },
    },
  );

  const deleteMutation = useMutation(deleteThread, {
    onSuccess: () => {
      queryClient.invalidateQueries(["threads", email]);
    },
    onError: (error) => {
      console.error("Failed to delete thread:", error);
    },
  });

  return {
    threads: threadsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    total: threadsQuery.data?.pages[0]?.total ?? 0,
    isLoading: threadsQuery.isLoading,
    isFetchingNextPage: threadsQuery.isFetchingNextPage,
    hasNextPage: threadsQuery.hasNextPage,
    fetchNextPage: threadsQuery.fetchNextPage,
    deleteThread: deleteMutation.mutate,
    isDeleting: deleteMutation.isLoading,
  };
};
