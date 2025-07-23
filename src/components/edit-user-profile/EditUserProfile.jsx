import { useState } from "react";
import { Button, Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import "./EditUserProfile.scss";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../config/axios-config.js";
import { useTranslate } from "@tolgee/react";

const EditUserProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslate();


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
      <Form onSubmit={ handleSubmit } className="textalign">
        <Tabs defaultActiveKey="personalDetails" id="edit-profile-tabs" className="mb-4">
          {/* Personal Details Tab */ }
          <Tab eventKey="personalDetails" title={ t("profile.personal_details") }>
            <Row className="p-3">
              <Col md={ 6 }>
                <Form.Group controlId="formFirstName">
                  <Form.Label>{ t("sign_up.form.first_name") }</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstname"
                    value={ formData.firstname }
                    onChange={ handleChange }
                    placeholder={ t("profile.enter-your-first-name") }
                  />
                </Form.Group>
              </Col>
              <Col md={ 6 }>
                <Form.Group controlId="formLastName">
                  <Form.Label>{ t("sign_up.form.last_name") }</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastname"
                    value={ formData.lastname }
                    onChange={ handleChange }
                    placeholder={ t("profile.enter-your-last-name") }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="p-3">
              <Col md={ 6 }>
                <Form.Group controlId="formTitle">
                  <Form.Label>{ t("topic.admin.title") }</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={ formData.title }
                    onChange={ handleChange }
                    placeholder={ t("profile.enter-your-title") }
                  />
                </Form.Group>
              </Col>
              <Col md={ 6 }>
                <Form.Group controlId="formOrganization">
                  <Form.Label>{ t("edit_profile.organization") }</Form.Label>
                  <Form.Control
                    type="text"
                    name="organization"
                    value={ formData.organization }
                    onChange={ handleChange }
                    placeholder={ t("profile.enter-your-organization") }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="p-3">
              <Col md={ 6 }>
                <Form.Group controlId="formLocation">
                  <Form.Label>{ t("edit_profile.location") }</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={ formData.location }
                    onChange={ handleChange }
                    placeholder={ t("profile.enter-your-location") }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-2 align-items-center p-3">
              <Form.Group controlId="formEducation">
                <Form.Label>{ t("edit_profile.education_info") }</Form.Label>
                { formData.educations.map((edu, index) => (
                  <div className="form-education" key={ index }>
                    <Col md={ 12 } className="position-relative">
                      <Form.Control
                        type="text"
                        value={ edu }
                        onChange={ (e) => handleEducationChange(index, e.target.value) }
                        placeholder={ t("profile.enter-your-education") }
                      />
                      { index !== 0 && (
                        <button
                          type="button"
                          className="remove-icon"
                          onClick={ () => {
                            const updatedEducation = formData.educations.filter((_, i) => i !== index);
                            setFormData({ ...formData, educations: updatedEducation });
                          } }
                        >
                          ✕
                        </button>
                      ) }
                    </Col>
                  </div>
                )) }
                <Button
                  variant="outline-dark"
                  size="sm"
                  onClick={ addEducation }
                  className="btn-add p-3"
                >
                  {t("edit_profile.line_add")}
                 </Button>
              </Form.Group>
            </Row>


            <Row className="p-3">
              <Form.Group controlId="formAboutMe">
                <Form.Label>{ t("edit_profile.about_me") }</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={ 3 }
                  name="about_me"
                  value={ formData.about_me }
                  onChange={ handleChange }
                  placeholder={ t("profile.tell-us-about-yourself") }
                />
              </Form.Group>
            </Row>
          </Tab>

          {/* Contact Details Tab */ }
          <Tab eventKey="contactDetails" title={ t("profile.contact_details") }>
            <Row className="p-3">
              { formData.social_profiles.map((profile) => (
                <Col md={ 6 } key={ profile.account } className=" p-3">
                  <Form.Group controlId={ `form${ profile.account }` }>
                    <Form.Label>{ t(`common.${ profile.account }`) }</Form.Label>
                    <Form.Control
                      type="text"
                      value={ profile.url }
                      onChange={ (e) => handleSocialProfileChange(profile.account, e.target.value) }
                      placeholder={ t(`profile.enter-your-${ profile.account }`) }
                    />
                  </Form.Group>
                </Col>
              )) }
            </Row>
          </Tab>
        </Tabs>

        <div className="form-buttons">
          <Button className="btn-cancel" type="button" onClick={ () => navigate(-1) }>
            { t("common.button.cancel") }
          </Button>
          <Button className="btn-submit" type="submit">
            { t("common.button.save") }
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditUserProfile;
