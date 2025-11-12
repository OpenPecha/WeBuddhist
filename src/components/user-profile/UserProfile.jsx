import "./UserProfile.scss";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import axiosInstance from "../../config/axios-config.js";
import { useTranslate } from "@tolgee/react";
import { ACCESS_TOKEN, LOGGED_IN_VIA, REFRESH_TOKEN } from "../../utils/constants.js";
import { useAuth } from "../../config/AuthContext.jsx";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { createPortal } from "react-dom";
import ImageUploadModal from "../sheets/local-components/modals/image-upload-modal/ImageUploadModal.jsx";
import SheetListing from "./tabs/sheet-listing/SheetListing.jsx";
import CollectionsTab from "./tabs/collections/CollectionsTab.jsx";
import Notes from "./tabs/notes/Notes.jsx";
import BuddhistTracker from "./tabs/buddhist-tracker/BuddhistTracker.jsx";
import { BsFileEarmark, BsStack, BsPencil, BsReception4, BsLinkedin, BsTwitter, BsFacebook, BsYoutube, BsEnvelope } from "react-icons/bs";


export const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get("/api/v1/users/info");
  return data;
};

const UserProfile = () => {
  const navigate = useNavigate();
  const {
    data: userInfo,
    isLoading: userInfoIsLoading,
    refetch: userInfoRefetch
  } = useQuery("userInfo", fetchUserInfo, { refetchOnWindowFocus: false });
  const { t } = useTranslate();
  const { isLoggedIn, logout: pechaLogout } = useAuth();
  const { isAuthenticated, logout } = useAuth0();
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("sheets");
  const handleEditImageClick = () => {
    setIsImageUploadModalOpen(true);
  };

  const handleImageUpload = async (imageUrl, fileName) => {
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
    navigate("/edit-profile", { state: { userInfo } });
  };

  const handleLogout = (e) => {
    e.preventDefault()
    localStorage.removeItem(LOGGED_IN_VIA);
    sessionStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN)
    isLoggedIn && pechaLogout()
    isAuthenticated && logout({
      logoutParams: {
        returnTo: window.location.origin + "/collections",
      },
    });
  }

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case "stories":
        return <SheetListing userInfo={userInfo} />;
      case "collections":
        return <CollectionsTab />;
      case "notes":
        return <Notes />;
      case "tracker":
        return <BuddhistTracker />;
      default:
        return <SheetListing userInfo={userInfo} />;
    }
  };

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
          <span className="location">{userInfo?.location}</span>{" "}
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

  const renderEditProfileButton = () => (
    <button className="edit-profile-btn" onClick={handleEditProfile}>
      {t("profile.edit_profile")}
    </button>
  );

  const renderSettingsButton = () => (
    <button className="settings-btn">
      <span className="icon">⚙️</span> {t("profile.setting")}
    </button>
  );

  const renderLogoutButton = () => (
    <button onClick={handleLogout} className="logout-text">
      {t("profile.log_out")}
    </button>
  );

  const renderActionButtons = () => (
    <div className="actions-row">
      {renderEditProfileButton()}
      {/* {renderSettingsButton()} */}
      {renderLogoutButton()}
    </div>
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
      linkedin: { icon: BsLinkedin, color: "#4a4a4a" },
      "x.com": { icon: BsTwitter, color: "#4a4a4a" },
      facebook: { icon: BsFacebook, color: "#4a4a4a" },
      youtube: { icon: BsYoutube, color: "#4a4a4a" },
      email: { icon: BsEnvelope, color: "#4a4a4a" },
    };

    const profilesWithUrls = socialProfiles.filter(profile => profile.url && profile.url.trim() !== '');

    const hasEmail = profilesWithUrls.some(profile => profile.account === "email");
    if (!hasEmail && userInfo?.email) {
      profilesWithUrls.push({ account: "email", url: userInfo.email });
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

  const renderProfileLeftSection = () => {
    return (
      <div className="profile-left">
        {renderBasicInfo()}
        {renderProfileDetails()}
        {renderActionButtons()}
        {renderFollowersInfo()}
        {renderSocialLinks(userInfo?.social_profiles)}
      </div>
    );
  };

  const renderProfileImage = () => (
    <div className="profile-image-container">
      <img src={userInfo.avatar_url} alt="Profile" className="profile-image" />
      <div className="edit-overlay" data-testid="edit-overlay">
        <FaEdit onClick={handleEditImageClick} />
      </div>
    </div>
  );

  const renderAddPictureButton = () => (
    <button className="add-picture-btn" onClick={handleEditImageClick}>
      {t("profile.picture.add_picture")}
    </button>
  );

  const renderProfilePicture = () => (
    <div className="profile-picture">
      {userInfo?.avatar_url ? renderProfileImage() : renderAddPictureButton()}
    </div>
  );

  const renderProfileRightSection = () => (
    <div className="profile-right">{renderProfilePicture()}</div>
  );

  const renderSection1 = () => (
    <div className="section1">
      {renderProfileLeftSection()}
      {renderProfileRightSection()}
    </div>
  );

  const renderTabButton = (tabKey, icon, labelKey) => (
    <button
      className={`nav-link ${activeTab === tabKey ? "active" : ""}`}
      onClick={() => handleTabClick(tabKey)}
    >
      {icon}
      {t(labelKey)}
    </button>
  );

  const renderNavTabs = () => {
    const tabsConfig = [
      {
        key: "stories",
        icon: <BsFileEarmark />,
        labelKey: "profile.tab.stories",
      },
      {
        key: "collections",
        icon: <BsStack />,
        labelKey: "profile.tab.collection",
      },
      { key: "notes", icon: <BsPencil />, labelKey: "user_profile.notes" },
      {
        key: "tracker",
        icon: <BsReception4 />,
        labelKey: "profile.buddhish_text_tracker",
      },
    ];

    return (
      <div className="nav-tabs">
        {tabsConfig.filter(tab => tab.key !== "collections" && tab.key !== "tracker" && tab.key !== "notes")
          .map((tab) =>
            renderTabButton(tab.key, tab.icon, tab.labelKey)
        )}
      </div>
    );
  };

  const renderTabsContainer = () => (
    <div className="tabs-container">
      {renderNavTabs()}
      <div className="tab-content">{renderTabContent()}</div>
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

  const renderImageUploadModal = () =>
    isImageUploadModalOpen &&
    createPortal(
      <ImageUploadModal
        onClose={handleCloseImageUploadModal}
        onUpload={handleImageUpload}
        isCameFromProfile={true}
      />,
      document.body
    );

  return (
    <>
      {!userInfoIsLoading ? (
        renderProfileContent()
      ) : (
        <p className="listsubtitle">{t("common.loading")}</p>
      )}
      {renderImageUploadModal()}
    </>
  );
};

export default UserProfile;
