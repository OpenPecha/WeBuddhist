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
      { account: "email", url: userInfo.email || "" },
      { account: "x.com", url: userInfo["x.com"] || "" },
      { account: "linkedin", url: userInfo.linkedIn || "" },
      { account: "facebook", url: userInfo.facebook || "" },
      { account: "youtube", url: userInfo.youtube || "" },
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

  return (
    <div className="edit-user-profile listtitle">
      <h2>{t("edit_profile.header")}</h2>
      <hr />
      <form onSubmit={handleSubmit} className="textalign">
        <div className="custom-tabs">
          <div className="nav-tabs">
            <button
              type="button"
              className={`nav-link ${
                activeTab === "personalDetails" ? "active" : ""
              }`}
              onClick={() => setActiveTab("personalDetails")}
            >
              {t("profile.personal_details")}
            </button>
            <button
              type="button"
              className={`nav-link ${
                activeTab === "contactDetails" ? "active" : ""
              }`}
              onClick={() => setActiveTab("contactDetails")}
            >
              {t("profile.contact_details")}
            </button>
          </div>

          <div className="tab-content">
            {/* Personal Details Tab */}
            {activeTab === "personalDetails" && (
              <div className="tab-panel">
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="formFirstName">
                        {t("sign_up.form.first_name")}
                      </label>
                      <input
                        id="formFirstName"
                        className="form-control"
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        placeholder={t("profile.enter-your-first-name")}
                      />
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="formLastName">
                        {t("sign_up.form.last_name")}
                      </label>
                      <input
                        id="formLastName"
                        className="form-control"
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        placeholder={t("profile.enter-your-last-name")}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="formTitle">
                        {t("topic.admin.title")}
                      </label>
                      <input
                        id="formTitle"
                        className="form-control"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder={t("profile.enter-your-title")}
                      />
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="formOrganization">
                        {t("edit_profile.organization")}
                      </label>
                      <input
                        id="formOrganization"
                        className="form-control"
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        placeholder={t("profile.enter-your-organization")}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="formLocation">
                        {t("edit_profile.location")}
                      </label>
                      <input
                        id="formLocation"
                        className="form-control"
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder={t("profile.enter-your-location")}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="form-group">
                    <label htmlFor="formEducation">
                      {t("edit_profile.education_info")}
                    </label>
                    {formData.educations.map((edu, index) => (
                      <div className="form-education" key={index}>
                        <div className="col">
                          <input
                            className="form-control"
                            type="text"
                            value={edu}
                            onChange={(e) =>
                              handleEducationChange(index, e.target.value)
                            }
                            placeholder={t("profile.enter-your-education")}
                          />
                          {index !== 0 && (
                            <button
                              type="button"
                              className="remove-icon"
                              onClick={() => {
                                const updatedEducation =
                                  formData.educations.filter(
                                    (_, i) => i !== index
                                  );
                                setFormData({
                                  ...formData,
                                  educations: updatedEducation,
                                });
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline-dark btn-sm btn-add p-3"
                      onClick={addEducation}
                    >
                      {t("edit_profile.line_add")}
                    </button>
                  </div>
                </div>

                <div className="row">
                  <div className="form-group">
                    <label htmlFor="formAboutMe">
                      {t("edit_profile.about_me")}
                    </label>
                    <textarea
                      id="formAboutMe"
                      className="form-control"
                      rows={3}
                      name="about_me"
                      value={formData.about_me}
                      onChange={handleChange}
                      placeholder={t("profile.tell-us-about-yourself")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Details Tab */}
            {activeTab === "contactDetails" && (
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
                            handleSocialProfileChange(
                              profile.account,
                              e.target.value
                            )
                          }
                          placeholder={t(
                            `profile.enter-your-${profile.account}`
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-buttons">
          <button
            className="btn btn-cancel"
            type="button"
            onClick={() => navigate(-1)}
          >
            {t("common.button.cancel")}
          </button>
          <button className="btn btn-submit" type="submit">
            {t("common.button.save")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserProfile;
