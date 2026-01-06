import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import axiosInstance from "@/config/axios-config";

const LIMIT = 10;

export const getThreads = async (params: any) => {
  const { email, application, skip = 0, limit = 10 } = params;
  const { data } = await axiosInstance.get("/threads", {
    params: { email, application, skip, limit },
  });
  return data;
};

export const deleteThread = async (threadId: string): Promise<void> => {
  await axiosInstance.delete(`/threads/${threadId}`);
};

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
    refetch: threadsQuery.refetch,
  };
};
