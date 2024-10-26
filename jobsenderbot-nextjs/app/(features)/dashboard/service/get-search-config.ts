"use server";

import { type SearchConfigSchemaType } from "@/app/(features)/dashboard";
import { type BasicReturn } from "@/app/types";
import * as yaml from "js-yaml";
import { getSqliteUserByEmail } from "./get-sqlite-user-by-email";
import { relativeDirPath } from "./dirconsts";

export const getSearchConfig = async (
  email: string,
): Promise<BasicReturn<SearchConfigSchemaType>> => {
  try {
    const userId = await getSqliteUserByEmail(email);
    console.log(userId);

    if (!userId) {
      return {
        success: false,
        message: "Please connect your linkedIn account first",
      };
    }

    const fs = require("fs");
    const path = require("path");

    const transformSearchConfig = (data: any) => {
      const locations = data.locations?.map((location: string) => ({
        name: location,
      }));
      const positions = data.positions?.map((position: string) => ({
        name: position,
      }));
      const titleBlacklist = data.title_blacklist?.map((title: string) => ({
        name: title,
      }));
      const companyBlacklist = data.company_blacklist?.map(
        (company: string) => ({ name: company }),
      );

      const llm_model_type = "openai";
      const llm_model = "gpt-3.5-turbo";

      return {
        ...data,
        locations,
        positions,
        title_blacklist: titleBlacklist,
        company_blacklist: companyBlacklist,
        llm_model_type,
        llm_model,
      };
    };

    const inputFile = path.join(
      process.cwd(),
      relativeDirPath + `/${userId}/` + "/config.yaml",
    );

    if (!fs.existsSync(inputFile)) {
      return {
        success: false,
        message: "Config not found",
      };
    }

    const data = yaml.load(fs.readFileSync(inputFile, { encoding: "utf-8" }));

    return {
      success: true,
      message: "Config loaded successfully",
      data: transformSearchConfig(data),
    };
  } catch {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};
