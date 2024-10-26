"use server";

import { type SearchConfigSchemaType } from "@/app/(features)/dashboard";
import { convert } from "@catalystic/json-to-yaml";
import { type BasicReturn } from "@/app/types";
import { getSqliteUserByEmail } from "./get-sqlite-user-by-email";
import { relativeDirPath } from "./index";

export const saveSearchConfig = async (
  email: string,
  data: SearchConfigSchemaType,
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

    const transformSearchConfig = (data: SearchConfigSchemaType) => {
      const locations = data.locations?.map((location) => location.name);
      const positions = data.positions?.map((position) => position.name);
      const titleBlacklist = data.title_blacklist?.map((title) => title.name);
      const companyBlacklist = data.company_blacklist?.map(
        (company) => company.name,
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

    const transformedData = transformSearchConfig(data);

    const yaml = convert(transformedData);

    const filePath = path.join(
      process.cwd(),
      relativeDirPath + `/${userId}/` + "/config.yaml",
    );

    const dir = path.dirname(filePath);

    fs.mkdirSync(dir, { recursive: true });

    fs.writeFile(filePath, yaml, {}, function (err: any) {
      if (err) throw err;
      console.log("It's saved!");
    });
    return {
      success: true,
      message: "Config saved successfully",
      data: undefined,
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};
