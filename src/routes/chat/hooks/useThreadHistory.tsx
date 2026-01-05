import { useQuery } from "react-query";
import { getThreadById } from "../services/threadService";

interface UseThreadHistoryOptions {
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useThreadHistory = (
  threadId: string | undefined,
  options: UseThreadHistoryOptions = {},
) => {
  const { enabled = true, onSuccess, onError } = options;

  const query = useQuery(["thread", threadId], () => getThreadById(threadId!), {
    enabled: !!threadId && threadId !== "new" && enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    cacheTime: 0,
    retry: 1,
    onSuccess,
    onError: (error: any) => {
      console.error("Failed to fetch thread history:", error);
      onError?.(error);
    },
  });

  return {
    threadHistory: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
