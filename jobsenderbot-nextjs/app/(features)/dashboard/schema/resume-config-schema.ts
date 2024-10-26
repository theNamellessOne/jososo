import { z } from "zod";

export const resumeConfigSchema = z.object({
  personal_information: z.object({
    name: z.string().min(1),
    surname: z.string().min(1),
    date_of_birth: z.string().min(1),
    country: z.string().min(1),
    city: z.string().min(1),
    zip_code: z.string().min(1),
    address: z.string().min(1),
    phone_prefix: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email(),
    github: z.string().url().optional(),
    linkedin: z.string().url(),
  }),

  education_details: z
    .array(
      z.object({
        education_level: z.string().min(1),
        institution: z.string().min(1),
        field_of_study: z.string().min(1),
        final_evaluation_grade: z.string().min(1),
        year_of_completion: z.string().min(1),
        start_date: z.string().min(1),
      }),
    )
    .min(1),

  experience_details: z
    .array(
      z.object({
        position: z.string().min(1),
        company: z.string().min(1),
        employment_period: z.string().min(1),
        location: z.string().min(1),
        industry: z.string().min(1),
        key_responsibilities: z
          .array(
            z.object({
              responsibility: z.string().min(1),
            }),
          )
          .min(1),
        skills_acquired: z
          .array(
            z.object({
              skill: z.string().min(1),
            }),
          )
          .min(1),
      }),
    )
    .min(1),

  projects: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        link: z.string().min(1),
      }),
    )
    .min(0),

  achievements: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .min(0),

  certifications: z
    .array(
      z.object({
        name: z.string().min(1),
      }),
    )
    .min(0),

  languages: z
    .array(
      z.object({
        language: z.string().min(1),
        proficiency: z.string().min(1),
      }),
    )
    .min(0),

  interests: z
    .array(
      z.object({
        name: z.string().min(0),
      }),
    )
    .min(1),

  availability: z.object({
    notice_period: z.string().min(1),
  }),

  salary_expectations: z.object({
    salary_range_usd: z
      .string()
      .min(1)
      .refine(
        (value) => {
          const parts = value.split("-");

          if (parts.length !== 2) return false;

          if (isNaN(parts[0] as any) || isNaN(parts[1] as any)) return false;

          return true;
        },
        {
          message: "Please enter a valid salary range",
        },
      ),
  }),

  self_identification: z
    .object({
      gender: z.string().optional(),
      pronouns: z.string().optional(),
      veteran: z.boolean().optional(),
      disability: z.boolean().optional(),
      ethnicity: z.string().optional(),
    })
    .optional(),

  legal_authorization: z
    .object({
      eu_work_authorization: z.boolean().optional(),
      us_work_authorization: z.boolean().optional(),
      requires_us_visa: z.boolean().optional(),
      requires_us_sponsorship: z.boolean().optional(),
      requires_eu_visa: z.boolean().optional(),
      legally_allowed_to_work_in_eu: z.boolean().optional(),
      legally_allowed_to_work_in_us: z.boolean().optional(),
      requires_eu_sponsorship: z.boolean().optional(),
      canada_work_authorization: z.boolean().optional(),
      requires_canada_visa: z.boolean().optional(),
      legally_allowed_to_work_in_canada: z.boolean().optional(),
      requires_canada_sponsorship: z.boolean().optional(),
      uk_work_authorization: z.boolean().optional(),
      requires_uk_visa: z.boolean().optional(),
      legally_allowed_to_work_in_uk: z.boolean().optional(),
      requires_uk_sponsorship: z.boolean().optional(),
    })
    .optional(),

  work_preferences: z
    .object({
      remote_work: z.boolean().optional(),
      in_person_work: z.boolean().optional(),
      open_to_relocation: z.boolean().optional(),
      willing_to_complete_assessments: z.boolean().optional(),
      willing_to_undergo_drug_tests: z.boolean().optional(),
      willing_to_undergo_background_checks: z.boolean().optional(),
    })
    .optional(),
});

export type ResumeConfigSchemaType = z.infer<typeof resumeConfigSchema>;
