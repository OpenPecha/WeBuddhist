import "../user-profile/UserProfile.scss";
import { useQuery } from "react-query";
import axiosInstance from "../../config/axios-config.js";
import { useTranslate } from "@tolgee/react";
import SheetListing from "../user-profile/tabs/sheet-listing/SheetListing.jsx";
import { BsFileEarmark, BsLinkedin, BsTwitter, BsFacebook, BsYoutube, BsEnvelope } from "react-icons/bs";
import { useParams } from "react-router-dom";
import { getEarlyReturn } from "../../utils/helperFunctions.jsx";
import noImageUrl from "../../assets/noprofile.jpg";

export const fetchAuthorInfo = async (username) => {
  const { data } = await axiosInstance.get(`/api/v1/users/${username}`);
  return data;
};

const AuthorProfile = () => {
  const { username } = useParams();
  const {
    data: authorInfo,
    isLoading: authorInfoIsLoading,
    error: authorInfoError,
  } = useQuery("userInfo", () => fetchAuthorInfo(username), { retry:false,refetchOnWindowFocus: false });
  const { t } = useTranslate();
  const earlyReturn = getEarlyReturn({ isLoading: authorInfoIsLoading, error: authorInfoError, t });
  if (earlyReturn) return earlyReturn; 

  const renderAuthorBasicInfo = () => (
    <>
      <h2 className="profile-name">
        {authorInfo?.firstname + " " + authorInfo?.lastname}
      </h2>
      <p className="profile-job-title">{authorInfo?.title}</p>
    </>
  );

  const renderAuthorProfileDetails = () => (
    <p className="profile-details">
      {authorInfo?.location && (
        <>
          <span className="location">{authorInfo?.location}</span>
          <span className="separator">·</span>
        </>
      )}
        {authorInfo?.educations?.length ? (
        <>
          <span className="degree">
            {authorInfo.educations.reduce((acc, curr) => acc + " " + curr)}
          </span>{" "}
          <span className="separator">·</span>
        </>
      ) : (
        <></>
      )}
    </p>
  );



  const renderAuthorFollowersInfo = () => (
    <div className="followers">
      <span className="number-followers">
        {authorInfo?.followers} {t("common.followers")}
      </span>
      <span className="number-following">
        {authorInfo?.following} {t("common.following")}
      </span>
    </div>
  );

  const renderAuthorSocialLinks = (socialProfiles) => {
    const socialIcons = {
      linkedin: { icon: BsLinkedin, color: "#4a4a4a" },
      "x.com": { icon: BsTwitter, color: "#4a4a4a" },
      facebook: { icon: BsFacebook, color: "#4a4a4a" },
      youtube: { icon: BsYoutube, color: "#4a4a4a" },
      email: { icon: BsEnvelope, color: "#4a4a4a" },
    };

    const profilesWithUrls = socialProfiles.filter(profile => profile.url && profile.url.trim() !== '');
    const hasEmail = profilesWithUrls.some(profile => profile.account === "email");
    if (!hasEmail && authorInfo?.email) {
      profilesWithUrls.push({ account: "email", url: authorInfo.email });
    }
    const profilesToDisplay = profilesWithUrls;

    return (
      <div className="social-links">
        {profilesToDisplay.map((profile) => {
          const { icon: Icon, color } = socialIcons[profile.account] || {};
          return Icon ? (
            <a
              key={profile.account}
              href={
                profile.account === "email"
                  ? "mailto:" + profile.url
                  : profile.url
              }
              target="_blank"
              rel="noopener noreferrer"
              aria-label={profile.account}
            >
              <Icon style={{ color }} />
            </a>
          ) : null;
        })}
      </div>
    );
  };

  const renderAuthorProfileLeftSection = () => {
    return (
      <div className="profile-left">
        {renderAuthorBasicInfo()}
        {renderAuthorProfileDetails()}
        {renderAuthorFollowersInfo()}
        {renderAuthorSocialLinks(authorInfo?.social_profiles)}
      </div>
    );
  };

  const renderAuthorProfileImage = () => (
    <div className="profile-image-container">
      <img src={authorInfo.avatar_url} onError={(e) => {e.target.onerror = null; e.target.src = noImageUrl;}} alt="Profile" className="profile-image" />
    </div>
  );

  const renderAuthorProfileRightSection = () => (
    <div className="profile-right">
    <div className="profile-picture">
       {renderAuthorProfileImage()}
    </div>
    </div>
  );

  const renderAuthorSection1 = () => (
    <div className="section1">
      {renderAuthorProfileLeftSection()}
      {renderAuthorProfileRightSection()}
    </div>
  );

  const renderAuthorTabsContainer = () => (
    <div className="tabs-container">
      <div>
      <button className="nav-sheet ">
      <BsFileEarmark />
      {t("profile.tab.stories")}
    </button>
      </div>
      <div className="tab-content">
        <SheetListing userInfo={authorInfo} />
      </div>
    </div>
  );

  const renderAuthorSection2 = () => (
    <div className="section2 listtitle">{renderAuthorTabsContainer()}</div>
  );

  const renderAuthorMainProfile = () => (
    <div className="webuddhist-user-profile">
      {renderAuthorSection1()}
      {renderAuthorSection2()}
    </div>
  );

  const renderAuthorProfileContent = () => (
    <div className="user-profile listtitle">
      {renderAuthorMainProfile()}
    </div>
  );

  return (
    <>
      {!authorInfoIsLoading ? (
        renderAuthorProfileContent()
      ) : (
        <p className="listsubtitle">{t("common.loading")}</p>
      )}
    </>
  );
};

export default AuthorProfile;
