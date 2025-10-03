import "./AuthorProfile.scss";
import { useQuery } from "react-query";
import axiosInstance from "../../config/axios-config.js";
import { useTranslate } from "@tolgee/react";
import SheetListing from "./tabs/sheet-listing/SheetListing.jsx";
import { BsFileEarmark, BsLinkedin, BsTwitter, BsFacebook, BsYoutube, BsEnvelope } from "react-icons/bs";


export const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get("/api/v1/users/info");
  return data;
};

const AuthorProfile = () => {
  const {
    data: userInfo,
    isLoading: userInfoIsLoading,
  } = useQuery("userInfo", fetchUserInfo, { refetchOnWindowFocus: false });
  const { t } = useTranslate();

  const renderBasicInfo = () => (
    <>
      <h2 className="profile-name">
        {userInfo?.firstname + " " + userInfo?.lastname}
      </h2>
      <p className="profile-job-title">{userInfo?.title}</p>
    </>
  );

  const renderProfileDetails = () => (
    <p className="profile-details">
      {userInfo?.location && (
        <>
          <span className="location">{userInfo?.location}</span>
          <span className="separator">·</span>
        </>
      )}
      {userInfo?.educations?.length ? (
        <>
          <span className="degree">
            {userInfo.educations.reduce((acc, curr) => acc + " " + curr)}
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
        {userInfo?.followers} {t("common.followers")}
      </span>
      <span className="number-following">
        {userInfo?.following} {t("common.following")}
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
        {renderSocialLinks(userInfo?.social_profiles)}
      </div>
    );
  };

  const renderProfileImage = () => (
    <div className="profile-image-container">
      <img src={userInfo.avatar_url} alt="Profile" className="profile-image" />
    </div>
  );

  const renderProfileRightSection = () => (
    <div className="profile-right">
    <div className="profile-picture">
      {userInfo?.avatar_url ? renderProfileImage() : <>hi</>}
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
      <button className={`nav-link`}>
      <BsFileEarmark />
      {t("profile.tab.stories")}
    </button>
      </div>
      <div className="tab-content">
        <SheetListing userInfo={userInfo} />
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
      {!userInfoIsLoading ? (
        renderProfileContent()
      ) : (
        <p className="listsubtitle">{t("common.loading")}</p>
      )}
    </>
  );
};

export default AuthorProfile;
