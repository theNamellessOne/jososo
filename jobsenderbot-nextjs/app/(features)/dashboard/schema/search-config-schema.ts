import { z } from "zod";

export const searchConfigSchema = z.object({
  remote: z.boolean(),
  distance: z.coerce.number().min(0).max(100),
  locations: z.array(z.object({ name: z.string() })).min(1),

  job_applicants_threshold: z.object({
    min_aplicants: z.coerce.number().min(0).optional(),
    max_aplicants: z.coerce.number().min(0).optional(),
  }),

  apply_once_at_company: z.boolean(),
  date: z.object({
    "all time": z.boolean(),
    month: z.boolean(),
    week: z.boolean(),
    "24 hours": z.boolean(),
  }),
  experienceLevel: z.object({
    internship: z.boolean(),
    entry: z.boolean(),
    associate: z.boolean(),
    "mid-senior level": z.boolean(),
    director: z.boolean(),
    executive: z.boolean(),
  }),

  jobTypes: z.object({
    "full-time": z.boolean(),
    contract: z.boolean(),
    "part-time": z.boolean(),
    temporary: z.boolean(),
    internship: z.boolean(),
    other: z.boolean(),
    volunteer: z.boolean(),
  }),
  positions: z.array(z.object({ name: z.string() })).min(1),

  title_blacklist: z.array(z.object({ name: z.string() })),
  company_blacklist: z.array(z.object({ name: z.string() })),
});

export type SearchConfigSchemaType = z.infer<typeof searchConfigSchema>;
