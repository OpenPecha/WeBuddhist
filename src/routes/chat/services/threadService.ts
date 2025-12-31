import axiosInstance from "@/config/axios-config";

export interface Thread {
  id: string;
  title: string;
}

export interface ThreadsResponse {
  data: Thread[];
  total: number;
}

export interface GetThreadsParams {
  email: string;
  application: string;
  skip?: number;
  limit?: number;
}

export const getThreads = async (
  params: GetThreadsParams,
): Promise<ThreadsResponse> => {
  const { email, application, skip = 0, limit = 10 } = params;
  const { data } = await axiosInstance.get("/threads", {
    params: { email, application, skip, limit },
  });
  return data;
};

export const deleteThread = async (threadId: string): Promise<void> => {
  await axiosInstance.delete(`/threads/${threadId}`);
};
