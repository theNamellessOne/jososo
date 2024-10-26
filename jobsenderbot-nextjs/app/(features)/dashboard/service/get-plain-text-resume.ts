"use server";

import { type ResumeConfigSchemaType } from "@/app/(features)/dashboard";
import { type BasicReturn } from "@/app/types";
import * as yaml from "js-yaml";
import { getSqliteUserByEmail } from "./get-sqlite-user-by-email";
import { relativeDirPath } from "./dirconsts";
import { transformResumeConfig } from "./yaml-transformer";

export const getPlainTextResume = async (
  email: string,
): Promise<BasicReturn<ResumeConfigSchemaType>> => {
  try {
    const userId = await getSqliteUserByEmail(email);

    if (!userId) {
      return {
        success: false,
        message: "Please connect your linkedIn account first",
      };
    }

    const fs = require("fs");
    const path = require("path");

    const inputFile = path.join(
      process.cwd(),
      relativeDirPath + `/${userId}/` + "/plain_text_resume.yaml",
    );

    if (!fs.existsSync(inputFile)) {
      return {
        success: false,
        message: "Resume not found",
      };
    }

    const data = yaml.load(fs.readFileSync(inputFile, { encoding: "utf-8" }));

    return {
      success: true,
      message: "Config loaded successfully",
      data: transformResumeConfig(data),
    };
  } catch {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};
