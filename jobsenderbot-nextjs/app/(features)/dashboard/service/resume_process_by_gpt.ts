"use server";

import { type BasicReturn } from "@/app/types";
import { ResumeConfigSchemaType } from "../schema";
import { transformResumeConfig } from "./yaml-transformer";
import * as yaml from "js-yaml";

const secretKey = process.env.OPENAI_API_KEY;

if (!secretKey) {
  process.exit("OPENAI_API_KEY is not set");
}

export const resumeProcessByGpt = async (
  resumeTextContent: string,
): Promise<BasicReturn<ResumeConfigSchemaType>> => {
  try {
    const systemMsg = `
        You are an assistant that rewrites resumes into a specific format. You must include all information from the original resume without leaving anything out. If any field in the standard format does not have corresponding data in the original resume, write "NO DATA" in that field, unless this is an "[Yes/No]" field that write "No". If the original resume contains atypical or additional information, display it in the format of the standard.

        The required format is as follows:

        personal_information:
          name: "[Your Name]"
          surname: "[Your Surname]"
          date_of_birth: "[Your Date of Birth]"
          country: "[Your Country]"
          city: "[Your City]"
          address: "[Your Address]"
          zip_code: "[Your zip code]"
          phone_prefix: "[Your Phone Prefix]"
          phone: "[Your Phone Number]"
          email: "[Your Email Address]"
          github: "[Your GitHub Profile URL]"
          linkedin: "[Your LinkedIn Profile URL]"

        education_details:
          - education_level: "[Your Education Level]"
            institution: "[Your Institution]"
            field_of_study: "[Your Field of Study]"
            final_evaluation_grade: "[Your Final Evaluation Grade]"
            start_date: "[Start Date]"
            year_of_completion: "[Year of Completion]"

        experience_details:
          - position: "[Your Position]"
            company: "[Company Name]"
            employment_period: "[Employment Period]"
            location: "[Location]"
            industry: "[Industry]"
            key_responsibilities:
              - "[Responsibility Description]"
              - "[Responsibility Description]"
              - "[Responsibility Description]"
            skills_acquired:
              - "[Skill]"
              - "[Skill]"
              - "[Skill]"

  projects:
  - name: "[Project Name]"
    description: "[Project Description]"
    link: "[Project Link]"

achievements:
  - name: "[Achievement Name]"
    description: "[Achievement Description]"

certifications:
  - "[Certification Name]"

languages:
  - language: "[Language]"
    proficiency: "[Proficiency Level]"

interests:
  - "[Interest]"

availability:
  notice_period: "[Notice Period]"

salary_expectations:
  salary_range_usd: "[Salary Range]"

self_identification:
  gender: "[Gender]"
  pronouns: "[Pronouns]"
  veteran: "[Yes/No]"
  disability: "[Yes/No]"
  ethnicity: "[Ethnicity]"

legal_authorization:
  eu_work_authorization: "[Yes/No]"
  us_work_authorization: "[Yes/No]"
  requires_us_visa: "[Yes/No]"
  requires_us_sponsorship: "[Yes/No]"
  requires_eu_visa: "[Yes/No]"
  legally_allowed_to_work_in_eu: "[Yes/No]"
  legally_allowed_to_work_in_us: "[Yes/No]"
  requires_eu_sponsorship: "[Yes/No]"
  canada_work_authorization: "[Yes/No]"
  requires_canada_visa: "[Yes/No]"
  legally_allowed_to_work_in_canada: "[Yes/No]"
  requires_canada_sponsorship: "[Yes/No]"
  uk_work_authorization: "[Yes/No]"
  requires_uk_visa: "[Yes/No]"
  legally_allowed_to_work_in_uk: "[Yes/No]"
  requires_uk_sponsorship: "[Yes/No]"

work_preferences:
  remote_work: "[Yes/No]"
  in_person_work: "[Yes/No]"
  open_to_relocation: "[Yes/No]"
  willing_to_complete_assessments: "[Yes/No]"
  willing_to_undergo_drug_tests: "[Yes/No]"
  willing_to_undergo_background_checks: "[Yes/No]"
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: resumeTextContent },
        ],
      }),
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();

    const message = json.choices[0].message.content
      .replace("yaml", "")
      .replace("`", "");

    return {
      success: true,
      message: "Success",
      data: transformResumeConfig(yaml.load(message)),
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error processing resume",
    };
  }
};
