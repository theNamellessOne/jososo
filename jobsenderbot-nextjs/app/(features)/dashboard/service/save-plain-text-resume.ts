"use server";

import { type ResumeConfigSchemaType } from "@/app/(features)/dashboard";
import { convert } from "@catalystic/json-to-yaml";
import { type BasicReturn } from "@/app/types";
import { getSqliteUserByEmail } from "./get-sqlite-user-by-email";
import { relativeDirPath } from "./index";

export const savePlainTextResume = async (
  email: string,
  data: ResumeConfigSchemaType,
): Promise<BasicReturn<undefined>> => {
  try {
    const userId = await getSqliteUserByEmail(email);

    if (!userId) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const fs = require("fs");
    const path = require("path");

    const transformSearchConfig = (data: ResumeConfigSchemaType) => {
      const experienceDetails = data.experience_details?.map((experience) => ({
        ...experience,
        skills_acquired: experience.skills_acquired?.map(
          (skill) => skill.skill,
        ),
      }));
      const certifications = data.certifications?.map(
        (certification) => certification!.name,
      );
      const interests = data.interests?.map((interest) => interest!.name);

      const self_identification = Object.fromEntries(
        Object.entries(data.self_identification!).map(([key, value]) => [
          key,
          typeof value === "boolean" ? (value ? "Yes" : "No") : value,
        ]),
      );

      const legal_authorization = Object.fromEntries(
        Object.entries(data.legal_authorization!).map(([key, value]) => [
          key,
          typeof value === "boolean" ? (value ? "Yes" : "No") : value,
        ]),
      );

      const work_preferences = Object.fromEntries(
        Object.entries(data.work_preferences!).map(([key, value]) => [
          key,
          typeof value === "boolean" ? (value ? "Yes" : "No") : value,
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

    const transformedData = transformSearchConfig(data);

    const yaml = convert(transformedData);

    const filePath = path.join(
      process.cwd(),
      relativeDirPath + `/${userId}/` + "/plain_text_resume.yaml",
    );

    const dir = path.dirname(filePath);

    fs.mkdirSync(dir, { recursive: true });

    fs.writeFile(filePath, yaml, {}, function (err: any) {
      if (err) throw err;
      console.log("It's saved!");
    });
    return {
      success: true,
      message: "Resume saved successfully",
      data: undefined,
    };
  } catch {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};
