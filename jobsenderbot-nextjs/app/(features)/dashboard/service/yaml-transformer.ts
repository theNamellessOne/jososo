export const transformResumeConfig = (data: any) => {
  const util = require("util");
  console.log(
    util.inspect(data, { showHidden: false, depth: null, colors: true }),
  );

  const experienceDetails = data.experience_details?.map((experience: any) => ({
    ...experience,
    skills_acquired: experience.skills_acquired?.map((skill: string) => ({
      skill,
    })),
    key_responsibilities: experience.key_responsibilities?.map(
      (responsibility: string) => ({
        responsibility,
      }),
    ),
  }));

  const certifications = data.certifications?.map((certification: string) => ({
    name: certification,
  }));

  const interests = data.interests?.map((interest: string) => ({
    name: interest,
  }));

  const self_identification = Object.fromEntries(
    Object.entries(data.self_identification!).map(([key, value]) => [
      key,
      value === "Yes" ? true : value === "No" ? false : value,
    ]),
  );

  const legal_authorization = Object.fromEntries(
    Object.entries(data.legal_authorization!).map(([key, value]) => [
      key,
      value === "Yes" ? true : value === "No" ? false : value,
    ]),
  );

  const work_preferences = Object.fromEntries(
    Object.entries(data.work_preferences!).map(([key, value]) => [
      key,
      value === "Yes" ? true : value === "No" ? false : value,
    ]),
  );

  return {
    ...data,
    experience_details: experienceDetails,
    certifications,
    interests,
    self_identification,
    legal_authorization,
    work_preferences,
  };
};
