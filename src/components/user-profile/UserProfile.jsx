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
      case "sheets":
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

  const renderSocialLinks = (socialProfiles) => {
    const socialIcons = {
      linkedin: { icon: BsLinkedin, color: "#0A66C2" },
      "x.com": { icon: BsTwitter, color: "#1DA1F2" },
      facebook: { icon: BsFacebook, color: "#4267B2" },
      youtube: { icon: BsYoutube, color: "#FF0000" },
      email: { icon: BsEnvelope, color: "#FF0000" },
    };

    return (
      <div className="social-links">
        { socialProfiles.map((profile) => {
          const { icon: Icon, color } = socialIcons[profile.account] || {};
          return Icon ? (
            <a
              key={profile.account}
              href={profile.account === "email" ? "mailto:" + profile.url : profile.url}
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

  return (
    <>
      {!userInfoIsLoading ? (
        <div className="user-profile listtitle">
          <div className="pecha-user-profile">
            <div className="section1">
              <div className="profile-left">
                <h2 className="profile-name">
                  {userInfo?.firstname + " " + userInfo?.lastname}
                </h2>
                <p className="profile-job-title">{userInfo?.title}</p>
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
                        {userInfo.educations.reduce(
                          (acc, curr) => acc + " " + curr
                        )}
                      </span>{" "}
                      <span className="separator">·</span>
                    </>
                  ) : (
                    <></>
                  )}
                </p>
                <div className="actions-row">
                  <button
                    className="edit-profile-btn"
                    onClick={handleEditProfile}
                  >
                    {t("profile.edit_profile")}
                  </button>
                  <button className="settings-btn">
                    <span className="icon">⚙️</span> {t("profile.setting")}
                  </button>
                  <button onClick={handleLogout} className="logout-text">
                    {t("profile.log_out")}
                  </button>
                </div>
                <div className="followers">
                  <span className="number-followers">
                    {userInfo?.followers} {t("common.followers")}
                  </span>
                  <span className="number-following">
                    {userInfo?.following} {t("common.following")}
                  </span>
                </div>
                {userInfo?.social_profiles?.length > 0 &&
                  renderSocialLinks(userInfo?.social_profiles)}
              </div>
              <div className="profile-right">
                <div className="profile-picture">
                  {userInfo?.avatar_url ? (
                    <div className="profile-image-container">
                      <img
                        src={userInfo.avatar_url}
                        alt="Profile"
                        className="profile-image"
                      />
                      <div className="edit-overlay" data-testid="edit-overlay">
                        <FaEdit onClick={handleEditImageClick} />
                      </div>
                    </div>
                  ) : (
                    <button
                      className="add-picture-btn"
                      onClick={handleEditImageClick}
                    >
                      {t("profile.picture.add_picture")}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="section2 listtitle">
              <div className="tabs-container">
                <div className="nav-tabs">
                  <button className={`nav-link ${ activeTab === "sheets" ? "active" : "" }`} onClick={() => handleTabClick("sheets")}>
                    <BsFileEarmark />
                    {t("profile.tab.sheets")}
                  </button>
                  <button className={`nav-link ${ activeTab === "collections" ? "active" : "" }`} onClick={() => handleTabClick("collections")}>
                    <BsStack />
                    {t("profile.tab.collection")}
                  </button>
                  <button className={`nav-link ${ activeTab === "notes" ? "active" : "" }`} onClick={() => handleTabClick("notes")}>
                    <BsPencil /> {t("user_profile.notes")}
                  </button>
                  <button className={`nav-link ${ activeTab === "tracker" ? "active" : "" }`} onClick={() => handleTabClick("tracker")}>
                    <BsReception4 />
                    {t("profile.buddhish_text_tracker")}
                  </button>
                </div>
                <div className="tab-content">{renderTabContent()}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="listsubtitle">{t("common.loading")}</p>
      )}
      {isImageUploadModalOpen &&
        createPortal(
          <ImageUploadModal
            onClose={handleCloseImageUploadModal}
            onUpload={handleImageUpload}
            isCameFromProfile={true}
          />,
          document.body
        )}
    </>
  );
};

export default UserProfile;
