import "../user-profile/UserProfile.scss";
import { useQuery } from "react-query";
import axiosInstance from "../../config/axios-config.js";
import { useTranslate } from "@tolgee/react";
import SheetListing from "../user-profile/tabs/sheet-listing/SheetListing.jsx";
import { BsFileEarmark, BsLinkedin, BsTwitter, BsFacebook, BsYoutube, BsEnvelope } from "react-icons/bs";
import { useParams } from "react-router-dom";
import { getEarlyReturn } from "../../utils/helperFunctions.jsx";


export const fetchAuthorInfo = async (username) => {
  const { data } = await axiosInstance.get(`/api/v1/user/${username}`);
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
console.log(authorInfo)
  const earlyReturn = getEarlyReturn({ isLoading: authorInfoIsLoading, error: authorInfoError, t });
  if (earlyReturn) return earlyReturn; 

  const renderBasicInfo = () => (
    <>
      <h2 className="profile-name">
        {authorInfo?.firstname + " " + authorInfo?.lastname}
      </h2>
      <p className="profile-job-title">{authorInfo?.title}</p>
    </>
  );

  const renderProfileDetails = () => (
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



  const renderFollowersInfo = () => (
    <div className="followers">
      <span className="number-followers">
        {authorInfo?.followers} {t("common.followers")}
      </span>
      <span className="number-following">
        {authorInfo?.following} {t("common.following")}
      </span>
    </div>
  );

  const renderSocialLinks = (socialProfiles) => {
    const socialIcons = {
      linkedin: { icon: BsLinkedin, color: "#0A66C2" },
      "x.com": { icon: BsTwitter, color: "#1DA1F2" },
      facebook: { icon: BsFacebook, color: "#4267B2" },
      youtube: { icon: BsYoutube, color: "#FF0000" },
      email: { icon: BsEnvelope, color: "#FF0000" },
    };

    const profilesWithUrls = socialProfiles.filter(profile => profile.url && profile.url.trim() !== '');

    return (
      <div className="social-links">
        {profilesWithUrls.map((profile) => {
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

  const renderProfileLeftSection = () => {
    return (
      <div className="profile-left">
        {renderBasicInfo()}
        {renderProfileDetails()}
        {renderFollowersInfo()}
        {renderSocialLinks(authorInfo?.social_profiles)}
      </div>
    );
  };

  const renderProfileImage = () => (
    <div className="profile-image-container">
      <img src={authorInfo.avatar_url} alt="Profile" className="profile-image" />
    </div>
  );

  const renderProfileRightSection = () => (
    <div className="profile-right">
    <div className="profile-picture">
      {authorInfo?.avatar_url ? renderProfileImage() : <>hi</>}
    </div>
    </div>
  );

  const renderSection1 = () => (
    <div className="section1">
      {renderProfileLeftSection()}
      {renderProfileRightSection()}
    </div>
  );

  const renderTabsContainer = () => (
    <div className="tabs-container">
      <div>
      <button className="nav-link">
      <BsFileEarmark />
      {t("profile.tab.stories")}
    </button>
      <hr />
      </div>
      <div className="tab-content">
        <SheetListing userInfo={authorInfo} />
      </div>
    </div>
  );

  const renderSection2 = () => (
    <div className="section2 listtitle">{renderTabsContainer()}</div>
  );

  const renderMainProfile = () => (
    <div className="webuddhist-user-profile">
      {renderSection1()}
      {renderSection2()}
    </div>
  );

  const renderProfileContent = () => (
    <div className="user-profile listtitle">
      {renderMainProfile()}
    </div>
  );

  return (
    <>
      {!authorInfoIsLoading ? (
        renderProfileContent()
      ) : (
        <p className="listsubtitle">{t("common.loading")}</p>
      )}
    </>
  );
};

export default AuthorProfile;
