import "./UserProfile.scss";
import { Tab, Tabs } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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

  const renderSocialLinks = (socialProfiles) => {
    const socialIcons = {
      linkedin: { class: "bi bi-linkedin", color: "#0A66C2" },
      "x.com": { class: "bi bi-twitter", color: "#1DA1F2" },
      facebook: { class: "bi bi-facebook", color: "#4267B2" },
      youtube: { class: "bi bi-youtube", color: "#FF0000" },
      email: { class: "bi bi-envelope", color: "#FF0000" },
    };

    return (
      <div
        className="social-links"
        style={ {
          marginTop: "15px",
          display: "flex",
          gap: "10px",
        } }
      >
        { socialProfiles.map((profile) => {
          const icon = socialIcons[profile.account] || {};
          return (
            <a
              key={ profile.account }
              href={ profile.account === "email" ? "mailto:" + profile.url : profile.url }
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ profile.account }
            >
              <i
                className={ icon.class }
                style={ { fontSize: "20px", color: icon.color } }
              ></i>
            </a>
          );
        }) }
      </div>
    );
  }

  return (
    <>
      { !userInfoIsLoading ?
        <div className="user-profile listtitle">
          <div className="pecha-user-profile">
            <div className="section1">
              <div className="profile-left">
                <h2 className="profile-name">{ userInfo?.firstname + " " + userInfo?.lastname }</h2>
                <p className="profile-job-title">{ userInfo?.title }</p>
                <p className="profile-details">
                  { userInfo?.location && <><span className="location">{ userInfo?.location }</span> <span
                    className="separator">·</span></> }
                  { userInfo?.educations?.length ? <><span
                    className="degree">{ userInfo.educations.reduce((acc, curr) => acc + " " + curr) }</span> <span
                    className="separator">·</span></> : <></> }
                </p>
                <div className="actions-row">
                  <button className="edit-profile-btn"
                          onClick={ handleEditProfile }>{ t("profile.edit_profile") }</button>
                  <button className="settings-btn">
                    <span className="icon">⚙️</span> { t("profile.setting") }
                  </button>
                  <button onClick={ handleLogout } className="logout-text">{ t("profile.log_out") }</button>
                </div>
                <div className="followers">
                  <span className="number-followers">{ userInfo?.followers } { t("common.followers") }</span>
                  <span className="number-following">{ userInfo?.following } { t("common.following") }</span>
                </div>
                { userInfo?.social_profiles?.length > 0 && renderSocialLinks(userInfo?.social_profiles) }
              </div>
              <div className="profile-right">
                <div className="profile-picture">
                  { userInfo?.avatar_url ? (
                    <div className="profile-image-container">
                      <img src={ userInfo.avatar_url } alt="Profile" className="profile-image" />
                      <div className="edit-overlay" data-testid="edit-overlay">
                        <FaEdit onClick={handleEditImageClick} />
                      </div>
                    </div>
                  ) : (

                    <button className="add-picture-btn" onClick={handleEditImageClick}>
                      { t("profile.picture.add_picture") }
                    </button>
                  ) }
                </div>
              </div>
            </div>

            <div className="section2 listtitle">
              <Tabs defaultActiveKey="sheets" id="user-profile-tabs" className="mb-3">
                <Tab eventKey="sheets" title={<><i className="bi bi-file-earmark"></i> { t("profile.tab.sheets") }</>}>
                  <SheetListing userInfo={userInfo} />
                </Tab>
                <Tab eventKey="collections" title={<><i className="bi bi-stack"></i> { t("profile.tab.collection") }</>}>
                  <CollectionsTab />
                </Tab>
                <Tab eventKey="notes" title={<><i className="bi bi-pencil"></i> { t("user_profile.notes") }</>}>
                  <Notes />
                </Tab>
                <Tab eventKey="tracker" title={<><i className="bi bi-reception-4"></i> { t("profile.buddhish_text_tracker") }</>}>
                  <BuddhistTracker />
                </Tab>
              </Tabs>
            </div>
            
          </div>
        </div>
        : <p className="listsubtitle">{t("common.loading")}</p> }
        {isImageUploadModalOpen && createPortal(
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
