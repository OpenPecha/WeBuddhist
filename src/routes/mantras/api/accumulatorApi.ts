import axiosInstance from "../../../config/axios-config.ts";
import type {
  AuthorGroupMembersListResponse,
  GroupAccumulatorDetailDTO,
  GroupAccumulatorMembersResponse,
  GroupAccumulatorsResponse,
  PaginatedMembersResult,
  PublicAccumulatorsResponse,
  PublicAuthorGroupDetailDTO,
  PublicAuthorGroupListResponse,
  GroupAccumulatorMemberDTO,
  MemberProfileDTO,
} from "../types.ts";

const MEMBERS_PAGE_SIZE = 20;

export async function fetchPresetAccumulators(
  language: string,
  limit = 50,
): Promise<PublicAccumulatorsResponse> {
  const { data } = await axiosInstance.get<PublicAccumulatorsResponse>(
    "/api/v1/accumulators/presets",
    { params: { language, limit, skip: 0 } },
  );
  return data;
}

export async function fetchPublicGroups(
  language: string,
  limit = 50,
  skip = 0,
): Promise<PublicAuthorGroupListResponse> {
  const { data } = await axiosInstance.get<PublicAuthorGroupListResponse>(
    "/api/v1/author/groups",
    { params: { language, limit, skip, group_type: "COMMUNITY" } },
  );
  return data;
}

export async function fetchPublicGroupDetail(
  groupId: string,
  language: string,
): Promise<PublicAuthorGroupDetailDTO> {
  const { data } = await axiosInstance.get<PublicAuthorGroupDetailDTO>(
    `/api/v1/author/groups/${groupId}`,
    { params: { language } },
  );
  return data;
}

export async function fetchGroupAccumulators(
  groupId: string,
  limit = 50,
): Promise<GroupAccumulatorsResponse> {
  const { data } = await axiosInstance.get<GroupAccumulatorsResponse>(
    `/api/v1/group-accumulators/${groupId}/accumulators`,
    { params: { limit, skip: 0 } },
  );
  return data;
}

export async function fetchGroupAccumulatorDetail(
  groupAccumulatorId: string,
): Promise<GroupAccumulatorDetailDTO> {
  const { data } = await axiosInstance.get<GroupAccumulatorDetailDTO>(
    `/api/v1/group-accumulators/${groupAccumulatorId}`,
  );
  return data;
}

export async function fetchGroupMembersPage(
  groupId: string,
  skip: number,
  limit = MEMBERS_PAGE_SIZE,
): Promise<PaginatedMembersResult<MemberProfileDTO>> {
  const { data } = await axiosInstance.get<AuthorGroupMembersListResponse>(
    `/api/v1/author/groups/${groupId}/members`,
    { params: { skip, limit } },
  );
  return { items: data.list, total: data.total_members };
}

export async function fetchGroupAccumulatorMembersPage(
  groupAccumulatorId: string,
  skip: number,
  limit = MEMBERS_PAGE_SIZE,
): Promise<PaginatedMembersResult<GroupAccumulatorMemberDTO>> {
  const { data } = await axiosInstance.get<GroupAccumulatorMembersResponse>(
    `/api/v1/group-accumulators/${groupAccumulatorId}/members`,
    { params: { skip, limit, sort_by: "total" } },
  );
  return { items: data.members, total: data.total };
}

export { MEMBERS_PAGE_SIZE };
