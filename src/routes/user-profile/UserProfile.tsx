import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import {
  BsEnvelope,
  BsFacebook,
  BsLinkedin,
  BsTwitter,
  BsYoutube,
} from "react-icons/bs";
import { MapPin, GraduationCap, Users, UserPlus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import axiosInstance from "../../config/axios-config.ts";
import SheetListing from "./tabs/sheet-listing/SheetListing.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import TwoColumnLayout from "@/components/layout/TwoColumnLayout.tsx";

type SocialProfile = {
  account: string;
  url: string;
};

export const fetchUserInfo = async (username?: string) => {
  const endpoint = username
    ? `/api/v1/users/${username}`
    : "/api/v1/users/info";
  const { data } = await axiosInstance.get(endpoint);
  return data;
};

const UserProfile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const isOwnProfile = !username;
  const {
    data: userInfo,
    isLoading: userInfoIsLoading,
    refetch: userInfoRefetch,
  } = useQuery(
    ["userInfo", username ?? "self"],
    () => fetchUserInfo(username),
    {
      refetchOnWindowFocus: false,
      retry: false,
    },
  );
  const { t } = useTranslate();
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);

  const handleEditImageClick = () => {
    setIsImageUploadModalOpen(true);
  };

  const handleImageUpload = async () => {
    try {
      await userInfoRefetch();
      setIsImageUploadModalOpen(false);
    } catch (error) {
      console.error("Error refreshing user info:", error);
      alert("Image uploaded but failed to refresh. Please reload the page.");
    }
  };

  const handleCloseImageUploadModal = () => {
    setIsImageUploadModalOpen(false);
  };

  const handleEditProfile = () => {
    if (!isOwnProfile) return;
    navigate("/edit-profile", { state: { userInfo } });
  };

  const education = userInfo?.educations?.length
    ? userInfo.educations.join(" ")
    : "";
  const initials =
    `${userInfo?.firstname?.[0] ?? ""}${userInfo?.lastname?.[0] ?? ""}`.toUpperCase();

  const socialIcons = {
    linkedin: { icon: BsLinkedin, color: "#454545" },
    "x.com": { icon: BsTwitter, color: "#454545" },
    facebook: { icon: BsFacebook, color: "#454545" },
    youtube: { icon: BsYoutube, color: "#454545" },
    email: { icon: BsEnvelope, color: "#454545" },
  };

  const socialProfiles: SocialProfile[] = (() => {
    const rawProfiles =
      (userInfo?.social_profiles as SocialProfile[] | undefined) ?? [];

    if (!rawProfiles.length) {
      return userInfo?.email ? [{ account: "email", url: userInfo.email }] : [];
    }

    const withUrls = rawProfiles.filter(
      (profile: SocialProfile) => profile.url && profile.url.trim() !== "",
    );
    const hasEmailProfile = withUrls.some(
      (profile: SocialProfile) => profile.account === "email",
    );

    if (!hasEmailProfile && userInfo?.email) {
      withUrls.push({ account: "email", url: userInfo.email });
    }

    return withUrls;
  })();

  return (
    <TwoColumnLayout
      containerClassName="min-h-screen"
      stackOrder="sidebar-first"
      main={
        userInfoIsLoading ? (
          <div className="flex items-center max-w-2xl space-y-4 mx-auto pt-10 justify-center px-6 py-24">
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">
                {t("common.loading")}
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4 pt-10">
            <SheetListing userInfo={userInfo} isOwnProfile={isOwnProfile} />
          </div>
        )
      }
      sidebar={
        <div>
          <div className="relative mx-auto flex items-center justify-center md:block">
            <Avatar className="size-24">
              <AvatarImage
                src={userInfo?.avatar_url}
                alt="avatar"
                className="object-cover"
              />
              <AvatarFallback className="text-lg border font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-1 flex-col mt-2 items-center gap-3 text-center md:items-start md:text-left">
            <div className="space-y-2 w-full">
              <h1 className="text-lg font-medium text-foreground">
                {userInfo?.firstname} {userInfo?.lastname}
              </h1>
              <div className="flex items-start flex-col text-start ">
                {userInfo?.title && (
                  <span className="text-sm text-muted-foreground capitalize">
                    {userInfo.title}
                  </span>
                )}
                {userInfo?.organization && (
                  <span className="text-sm text-muted-foreground capitalize">
                    {userInfo.organization}
                  </span>
                )}
              </div>

              <div className="flex items-center">
                <Badge variant="secondary" className="p-0">
                  <Users
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {userInfo?.followers}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("common.followers")}
                  </span>
                </Badge>
                <Badge variant="secondary">
                  <UserPlus
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {userInfo?.following}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("common.following")}
                  </span>
                </Badge>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  {userInfo?.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="capitalize">{userInfo.location}</span>
                    </div>
                  )}
                  {education && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span className="capitalize">{education}</span>
                    </div>
                  )}
                </div>

                {socialProfiles.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {socialProfiles.map((profile: SocialProfile) => {
                      const iconEntry =
                        socialIcons[
                          profile.account as keyof typeof socialIcons
                        ];
                      const Icon = iconEntry?.icon;

                      return (
                        <a
                          key={profile.account}
                          href={
                            profile.account === "email"
                              ? `mailto:${profile.url}`
                              : profile.url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={profile.account}
                          className="group relative flex h-10 w-10 items-center justify-center rounded-full border bg-background transition-all hover:scale-110  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Icon
                            className="h-4 w-4 transition-colors"
                            style={{ color: iconEntry.color }}
                          />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {userInfo?.about_me && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                <div className=" my-2 h-px bg-linear-to-r from-transparent via-border to-transparent" />

                {userInfo.about_me}
              </p>
            )}
          </div>
          {isOwnProfile && (
            <Button
              variant="outline"
              className=" mt-2 w-full"
              onClick={handleEditProfile}
            >
              {t("profile.edit_profile")}
            </Button>
          )}
        </div>
      }
    />
  );
};

export default UserProfile;
