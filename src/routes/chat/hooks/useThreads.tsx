import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import axiosInstance from "@/config/axios-config";

const LIMIT = 10;

export const getThreads = async (params: any) => {
  const { application, skip = 0, limit = 10 } = params;
  const { data } = await axiosInstance.get("/threads", {
    params: { application, skip, limit },
  });
  return data;
};

export const deleteThread = async (threadId: string): Promise<void> => {
  await axiosInstance.delete(`/threads/${threadId}`);
};

export const useThreads = (application: string = "webuddhist") => {
  const queryClient = useQueryClient();

  const threadsQuery = useInfiniteQuery(
    ["threads"],
    ({ pageParam = 0 }) =>
      getThreads({
        application,
        skip: pageParam,
        limit: LIMIT,
      }),
    {
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage, allPages) => {
        const totalFetched = allPages.length * LIMIT;
        return totalFetched < lastPage.total ? totalFetched : undefined;
      },
    },
  );

  const deleteMutation = useMutation(deleteThread, {
    onSuccess: () => {
      queryClient.invalidateQueries(["threads"]);
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
