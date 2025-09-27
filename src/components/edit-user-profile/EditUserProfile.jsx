import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./EditUserProfile.scss";
import { useMutation } from "react-query";
import axiosInstance from "../../config/axios-config.js";
import { useTranslate } from "@tolgee/react";

const EditUserProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslate();

  const [activeTab, setActiveTab] = useState("personalDetails");

  const userInfo = location.state?.userInfo || {};


  const getSocialProfileUrl = (account) => {
    if (!userInfo.social_profiles) return "";
    const profile = userInfo.social_profiles.find(p => p.account === account);
    return profile ? profile.url : "";
  };

  const updateProfileMutation = useMutation(async (updateProfileData) => {
      const response = await axiosInstance.post("/api/v1/users/info", updateProfileData)
      return response.data;
    },
    {
      onSuccess: (data) => {
        navigate("/profile")
      }
    }
  )

  // Initialize state with default values or data from userInfo
  const [formData, setFormData] = useState({
    firstname: userInfo.firstname || "",
    lastname: userInfo.lastname || "",
    title: userInfo.title || "",
    organization: userInfo.organization || "",
    location: userInfo.location || "",
    educations: userInfo.educations?.length > 0 ? userInfo.educations : [""],
    about_me: userInfo.about_me || "",
    avatar_url: userInfo.avatar_url || "",
    social_profiles: [
      { account: "email", url: getSocialProfileUrl("email") || userInfo.email || "" },
      { account: "x.com", url: getSocialProfileUrl("x.com") },
      { account: "linkedin", url: getSocialProfileUrl("linkedin") },
      { account: "facebook", url: getSocialProfileUrl("facebook") },
      { account: "youtube", url: getSocialProfileUrl("youtube") },
    ],
  });

  // Handle input change for simple fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle education changes
  const handleEducationChange = (index, value) => {
    const updatedEducation = [...formData.educations];
    updatedEducation[index] = value;
    setFormData({ ...formData, educations: updatedEducation });
  };

  const addEducation = () => {
    setFormData({ ...formData, educations: [...formData.educations, ""] });
  };

  const removeEducation = (indexToRemove) => {
    const updatedEducation = formData.educations.filter((_, i) => i !== indexToRemove);
    setFormData({ ...formData, educations: updatedEducation });
  };

  // Handle social profile changes
  const handleSocialProfileChange = (account, value) => {
    const updatedProfiles = formData.social_profiles.map((profile) =>
      profile.account === account ? { ...profile, url: value } : profile
    );
    setFormData({ ...formData, social_profiles: updatedProfiles });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutateAsync(formData)
  };

  const renderTabNavigation = () => (
    <div className="nav-tabs">
      <button type="button" className={`nav-link ${ activeTab === "personalDetails" ? "active" : "" }`} onClick={() => setActiveTab("personalDetails")}>
        {t("profile.personal_details")}
        </button>
      <button type="button" className={`nav-link ${ activeTab === "contactDetails" ? "active" : "" }`} onClick={() => setActiveTab("contactDetails")}>
        {t("profile.contact_details")}
      </button>
    </div>
  );

  const renderNameFields = () => {
    const nameFields = [
      { name: 'firstname', labelKey: 'sign_up.form.first_name', placeholderKey: 'profile.enter-your-first-name' },
      { name: 'lastname', labelKey: 'sign_up.form.last_name', placeholderKey: 'profile.enter-your-last-name' }
    ];

    return (
      <div className="row">
        {nameFields.map((field) => (
          <div className="col" key={field.name}>
            <div className="form-group">
              <label htmlFor={`form${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`}>
                {t(field.labelKey)}
              </label>
              <input 
                id={`form${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`}
                className="form-control" 
                type="text" 
                name={field.name} 
                value={formData[field.name]} 
                onChange={handleChange} 
                placeholder={t(field.placeholderKey)}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };
  const renderTitleOrgFields = () => {
    const titleOrgFields = [
      { name: 'title', labelKey: 'topic.admin.title', placeholderKey: 'profile.enter-your-title' },
      { name: 'organization', labelKey: 'edit_profile.organization', placeholderKey: 'profile.enter-your-organization' }
    ];

    return (
      <div className="row">
        {titleOrgFields.map((field) => (
          <div className="col" key={field.name}>
            <div className="form-group">
              <label htmlFor={`form${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`}>
                {t(field.labelKey)}
              </label>
              <input 
                id={`form${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`}
                className="form-control" 
                type="text" 
                name={field.name} 
                value={formData[field.name]} 
                onChange={handleChange} 
                placeholder={t(field.placeholderKey)}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };
  const renderLocationField = () => (
      <div className="row">
        <div className="col">
          <div className="form-group">
            <label htmlFor="formLocation">{t("edit_profile.location")}</label>
            <input id="formLocation" className="form-control" type="text" name="location" value={formData.location} onChange={handleChange} placeholder={t("profile.enter-your-location")}/>
          </div>
        </div>
      </div>
    );
  const renderEducationSection = () => (
      <div className="row">
        <div className="form-group">
          <label htmlFor="formEducation">
            {t("edit_profile.education_info")}
          </label>
          {formData.educations.map((edu, index) => (
            <div className="form-education" key={index}> 
              <div className="col">
                <input className="form-control" type="text" value={edu} onChange={(e) => handleEducationChange(index, e.target.value)} placeholder={t("profile.enter-your-education")}/>
                {index !== 0 && (
                  <button
                    type="button"
                    className="remove-icon"
                    onClick={() => {
                      removeEducation(index);
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" className="add-education-btn" onClick={addEducation}>
            {t("edit_profile.line_add")}
          </button>
        </div>
      </div>
    );
    const renderAboutMeField = () => (
      <div className="row">
        <div className="form-group">
          <label htmlFor="formAboutMe">{t("edit_profile.about_me")}</label>
          <textarea id="formAboutMe" className="form-control" rows={3} name="about_me" value={formData.about_me} onChange={handleChange} placeholder={t("profile.tell-us-about-yourself")}/>
        </div>
      </div>
  );
  const renderPersonalDetailsFields = () => (
    <div className="tab-panel">
      {renderNameFields()}
      {renderTitleOrgFields()}
      {renderLocationField()}
      {renderEducationSection()}
      {renderAboutMeField()}
    </div>
  );
  const renderContactDetailsFields = () => (
    <div className="tab-panel">
      <div className="row">
        {formData.social_profiles.map((profile) => (
          <div className="col" key={profile.account}>
            <div className="form-group">
              <label htmlFor={`form${profile.account}`}>
                {t(`common.${profile.account}`)}
              </label>
              <input
                id={`form${profile.account}`}
                className="form-control"
                type="text"
                value={profile.url}
                onChange={(e) =>
                  handleSocialProfileChange(profile.account, e.target.value)
                }
                placeholder={t(`profile.enter-your-${profile.account}`)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => (
    <div className="tab-content">
      {activeTab === "personalDetails" && renderPersonalDetailsFields()}
      {activeTab === "contactDetails" && renderContactDetailsFields()}
    </div>
  );

  const renderFormButtons = () => (
    <div className="form-buttons">
      <button className="cancel-btn" type="button" onClick={() => navigate(-1)}>
        {t("common.button.cancel")}
      </button>
      <button className="submit-btn" type="submit">
        {t("common.button.save")}
      </button>
    </div>
  );

  return (
    <div className="edit-user-profile listtitle">
      <h2>{t("edit_profile.header")}</h2>
      <hr />
      <form onSubmit={handleSubmit} className="textalign">
        <div className="custom-tabs">
          {renderTabNavigation()}
          {renderTabContent()}
        </div>
        {renderFormButtons()}
      </form>
    </div>
  );
};

export default EditUserProfile;
