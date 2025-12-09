import { useState, type ChangeEvent, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import axiosInstance from "../../config/axios-config.ts";
import { useTranslate } from "@tolgee/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const EditUserProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslate();

  const userInfo = location.state?.userInfo || {};

  const getSocialProfileUrl = (account: string) => {
    if (!userInfo.social_profiles) return "";
    const profile = userInfo.social_profiles.find(
      (p: any) => p.account === account,
    );
    return profile ? profile.url : "";
  };

  const updateProfileMutation = useMutation(
    async (updateProfileData) => {
      const response = await axiosInstance.post(
        "/api/v1/users/info",
        updateProfileData,
      );
      return response.data;
    },
    {
      onSuccess: () => {
        navigate("/profile");
      },
    },
  );
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
      {
        account: "email",
        url: getSocialProfileUrl("email") || userInfo.email || "",
      },
      { account: "x.com", url: getSocialProfileUrl("x.com") },
      { account: "linkedin", url: getSocialProfileUrl("linkedin") },
      { account: "facebook", url: getSocialProfileUrl("facebook") },
      { account: "youtube", url: getSocialProfileUrl("youtube") },
    ],
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEducationChange = (index: number, value: string) => {
    const updatedEducation = [...formData.educations];
    updatedEducation[index] = value;
    setFormData({ ...formData, educations: updatedEducation });
  };

  const addEducation = () => {
    setFormData({ ...formData, educations: [...formData.educations, ""] });
  };

  const removeEducation = (indexToRemove: number) => {
    const updatedEducation = formData.educations.filter(
      (_: any, i: number) => i !== indexToRemove,
    );
    setFormData({ ...formData, educations: updatedEducation });
  };

  const handleSocialProfileChange = (account: string, value: string) => {
    const updatedProfiles = formData.social_profiles.map((profile) =>
      profile.account === account ? { ...profile, url: value } : profile,
    );
    setFormData({ ...formData, social_profiles: updatedProfiles });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProfileMutation.mutateAsync(formData as any);
  };

  return (
    <div className="mx-auto max-w-5xl min-h-screen px-4 py-8">
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-start text-foreground">
            {t("edit_profile.header")}
          </h2>
          <Separator />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="personalDetails" className="space-y-4">
            <TabsList className="w-full justify-start gap-2 bg-muted/60">
              <TabsTrigger value="personalDetails" className="px-4 py-2">
                {t("profile.personal_details")}
              </TabsTrigger>
              <TabsTrigger value="contactDetails" className="px-4 py-2">
                {t("profile.contact_details")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personalDetails" className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    name: "firstname",
                    labelKey: "sign_up.form.first_name",
                    placeholderKey: "profile.enter-your-first-name",
                  },
                  {
                    name: "lastname",
                    labelKey: "sign_up.form.last_name",
                    placeholderKey: "profile.enter-your-last-name",
                  },
                ].map((field) => (
                  <label
                    key={field.name}
                    className="space-y-2 text-start w-full"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {t(field.labelKey)}
                    </span>
                    <input
                      id={`form${field.name}`}
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleChange}
                      placeholder={t(field.placeholderKey)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </label>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    name: "title",
                    labelKey: "topic.admin.title",
                    placeholderKey: "profile.enter-your-title",
                  },
                  {
                    name: "organization",
                    labelKey: "edit_profile.organization",
                    placeholderKey: "profile.enter-your-organization",
                  },
                ].map((field) => (
                  <label
                    key={field.name}
                    className="space-y-2 text-start w-full"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {t(field.labelKey)}
                    </span>
                    <input
                      id={`form${field.name}`}
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleChange}
                      placeholder={t(field.placeholderKey)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </label>
                ))}
              </div>

              <div className="space-y-2 text-start w-full">
                <label className="text-sm font-medium text-foreground">
                  {t("edit_profile.location")}
                </label>
                <input
                  id="formLocation"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={t("profile.enter-your-location")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-3 text-start w-full">
                <span className="text-sm font-medium text-foreground">
                  {t("edit_profile.education_info")}
                </span>
                <div className="space-y-3">
                  {formData.educations.map((edu: any, index: number) => (
                    <div key={index} className="flex gap-3">
                      <input
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        type="text"
                        value={edu}
                        onChange={(e) =>
                          handleEducationChange(index, e.target.value)
                        }
                        placeholder={t("profile.enter-your-education")}
                      />
                      {index !== 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="shrink-0 text-destructive hover:text-destructive"
                          onClick={() => removeEducation(index)}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEducation}
                  >
                    {t("edit_profile.line_add")}
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-start w-full">
                <label className="text-sm font-medium text-foreground">
                  {t("edit_profile.about_me")}
                </label>
                <textarea
                  id="formAboutMe"
                  name="about_me"
                  rows={3}
                  value={formData.about_me}
                  onChange={handleChange}
                  placeholder={t("profile.tell-us-about-yourself")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </TabsContent>

            <TabsContent value="contactDetails" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {formData.social_profiles.map((profile) => (
                  <label
                    key={profile.account}
                    className="space-y-2 text-start w-full"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {t(`common.${profile.account}`)}
                    </span>
                    <input
                      id={`form${profile.account}`}
                      value={profile.url}
                      onChange={(e) =>
                        handleSocialProfileChange(
                          profile.account,
                          e.target.value,
                        )
                      }
                      placeholder={t(`profile.enter-your-${profile.account}`)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </label>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              {t("common.button.cancel")}
            </Button>
            <Button type="submit">{t("common.button.save")}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserProfile;
