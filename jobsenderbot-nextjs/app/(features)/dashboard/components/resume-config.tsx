"use client";

import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resumeConfigSchema,
  type ResumeConfigSchemaType,
} from "@/app/(features)/dashboard";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MinusCircle, PlusCircle, Save } from "lucide-react";
import { LoadingOverlay } from "@/components/loading-overlay";
import { toast } from "sonner";
import { savePlainTextResume } from "../service/save-plain-text-resume";
import { useEffect, useState } from "react";
import { getPlainTextResume } from "../service/get-plain-text-resume";
import { useAuth } from "../../auth";
import * as pdfjsLib from "pdfjs-dist";
import { resumeProcessByGpt } from "../service/resume_process_by_gpt";
import { BlockingError } from "@/components/blocking-error";

type Props = {
  defaultValues: ResumeConfigSchemaType | undefined;
};

export const ResumeConfig = (props: Props) => {
  const form = useForm<ResumeConfigSchemaType>({
    resolver: zodResolver(resumeConfigSchema),
    defaultValues: props.defaultValues ?? {
      personal_information: {
        name: "",
        surname: "",
        date_of_birth: "",
        country: "",
        city: "",
        zip_code: "",
        address: "",
        phone_prefix: "",
        phone: "",
        email: "",
        github: "",
        linkedin: "",
      },

      education_details: [],
      experience_details: [],
      projects: [],
      achievements: [],
      certifications: [],
      languages: [],
      interests: [],

      availability: {
        notice_period: "",
      },

      salary_expectations: {
        salary_range_usd: "",
      },

      self_identification: {
        gender: "",
        pronouns: "",
        veteran: false,
        disability: false,
        ethnicity: "",
      },

      legal_authorization: {
        eu_work_authorization: false,
        us_work_authorization: false,
        requires_us_visa: false,
        requires_us_sponsorship: false,
        requires_eu_visa: false,
        legally_allowed_to_work_in_eu: false,
        legally_allowed_to_work_in_us: false,
        requires_eu_sponsorship: false,
        canada_work_authorization: false,
        requires_canada_visa: false,
        legally_allowed_to_work_in_canada: false,
        requires_canada_sponsorship: false,
        uk_work_authorization: false,
        requires_uk_visa: false,
        legally_allowed_to_work_in_uk: false,
        requires_uk_sponsorship: false,
      },

      work_preferences: {
        remote_work: false,
        in_person_work: false,
        open_to_relocation: false,
        willing_to_complete_assessments: false,
        willing_to_undergo_drug_tests: false,
        willing_to_undergo_background_checks: false,
      },
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const { user, hasValidSubscription } = useAuth();

  const [blockingError, setBlockingError] = useState<string | null>(null);

  useEffect(() => {
    if (blockingError) return;
    if (hasValidSubscription) return;

    setBlockingError("Seems like you don't have a subscription");
  }, [hasValidSubscription]);

  useEffect(() => {
    setLoading(true);
    getPlainTextResume(user?.email!)
      .then((response) => {
        if (response.success) {
          form.reset(response.data);
          return;
        }

        if (response.message === "Resume not found") {
          return;
        }

        if (response.message === "Please connect your linkedIn account first") {
          setBlockingError(response.message);
          return;
        }

        !response.success && toast.error(response.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: ResumeConfigSchemaType) => {
    const response = await savePlainTextResume(user.email, data);

    response.success
      ? toast.success(response.message)
      : toast.error(response.message);
  };

  const handlePdfResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files) {
      return;
    }

    const file = event.target.files[0];

    if (file && file.type === "application/pdf") {
      const reader = new FileReader();

      pdfjsLib.GlobalWorkerOptions.workerSrc =
        window.location.origin + "/pdf.worker.min.mjs";

      reader.onload = function (e) {
        const arrayBuffer = e.target!.result;

        // Load the PDF using pdfjs
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer! });

        loadingTask.promise.then((pdf: any) => {
          const textPromises = [];

          // Loop through each page and extract text
          for (let i = 1; i <= pdf.numPages; i++) {
            textPromises.push(
              pdf.getPage(i).then((page: any) => {
                return page.getTextContent().then((textContent: any) => {
                  // Extract text
                  const text = textContent.items
                    .map((item: any) => item.str)
                    .join(" ");
                  return text;
                });
              }),
            );
          }

          setLoading(true);
          // Combine all page texts into a single string
          Promise.all(textPromises).then((texts) => {
            const fullText = texts.join("\n");

            resumeProcessByGpt(fullText)
              .then((response) => {
                if (response.success) {
                  form.reset(response.data);
                } else {
                  toast.error(response.message);
                }
              })
              .finally(() => {
                setLoading(false);
              });
          });
        });
      };

      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  return (
    <div className="flex flex-col gap-5 relative p-2">
      {blockingError && (
        <BlockingError>
          <div
            className={
              "flex flex-col gap-5 items-center justify-center sticky top-64 mt-64"
            }
          >
            <div
              className={
                "bg-background rounded-md p-4 flex gap-5 items-center px-5 font-semibold"
              }
            >
              <span className={"text-xl "}>🔒</span>
              <span>{blockingError}</span>
            </div>
          </div>
          <div className={"text-transparent"}>.</div>
        </BlockingError>
      )}

      {(isSubmitting || loading) && <LoadingOverlay className={"fixed"} />}
      <form
        className="flex flex-row gap-5 items-center justify-between"
        onSubmit={(e) => {
          e.preventDefault();

          if (!isValid) {
            form.trigger();
            toast.error("Please fill all the required fields");
            return;
          }

          return form.handleSubmit(handleSubmit)();
        }}
      >
        <CardHeader className={"px-0"}>
          <CardTitle>Resume Configuration</CardTitle>
          <CardDescription>
            configure every aspect of your resume
          </CardDescription>
        </CardHeader>

        <Button disabled={isSubmitting} type="submit">
          <Save className="size-4 mr-2" />
          Save
        </Button>
      </form>
      <FormProvider {...form}>
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
            <CardDescription>
              Upload your resume PDF file to prefill form fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept="application/pdf"
              onChange={handlePdfResumeUpload}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col lg:flex-row gap-5 ">
          <div className="flex flex-col gap-5 lg:w-3/5">
            <PersonalInformation />
            <EducationDetails />
            <ExperienceDetails />
            <Projects />
          </div>
          <div className="flex flex-col gap-5 lg:w-2/5">
            <General />
            <Achievements />
            <Certifications />
            <Languages />
            <Interests />
            <LegalAuthorization />
            <WorkPreferences />
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

const PersonalInformation = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          your personal information that will be used to generate your CV
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <FormField
          label="Name"
          name="personal_information.name"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="Surname"
          name="personal_information.surname"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="Date of Birth"
          name="personal_information.date_of_birth"
          register={(field) => {
            return (
              <Input
                type="date"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="Country"
          name="personal_information.country"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="City"
          name="personal_information.city"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="Zip Code"
          name="personal_information.zip_code"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="Address"
          name="personal_information.address"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="Phone Prefix"
          name="personal_information.phone_prefix"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="Phone"
          name="personal_information.phone"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="Email"
          name="personal_information.email"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="Github"
          name="personal_information.github"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="LinkedIn"
          name="personal_information.linkedin"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />
      </CardContent>
    </Card>
  );
};

const EducationDetails = () => {
  const form = useFormContext<ResumeConfigSchemaType>();
  const educationDetails = useFieldArray({
    name: "education_details",
    control: form.control,
  });

  useEffect(() => {
    form.register("education_details");
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education Details</CardTitle>
        <CardDescription>
          your education details that will be used to generate your CV
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Card>
          <CardContent
            className="flex flex-col gap-5 pt-6"
            key={educationDetails.fields.length}
          >
            {educationDetails.fields.length === 0 && (
              <CardDescription>No education details added yet</CardDescription>
            )}

            <p className={"text-red-500 font-medium"}>
              {form.formState.errors.education_details?.message}
            </p>

            {educationDetails.fields.map((_, index) => (
              <div key={index} className="flex flex-col gap-5">
                <div className="flex flex-row items-center justify-between">
                  <p className="font-medium leading-none">
                    Education {index + 1}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => educationDetails.remove(index)}
                  >
                    <MinusCircle className={"size-4"} />
                  </Button>
                </div>

                <FormField
                  label="Education Level"
                  name={`education_details[${index}].education_level`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />

                <FormField
                  label="Institution"
                  name={`education_details[${index}].institution`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />

                <FormField
                  label="Field of Study"
                  name={`education_details[${index}].field_of_study`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />

                <FormField
                  label="Final Evaluation Grade"
                  name={`education_details[${index}].final_evaluation_grade`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />

                <FormField
                  label="Start Year"
                  name={`education_details[${index}].start_date`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />

                <FormField
                  label="End Year"
                  name={`education_details[${index}].year_of_completion`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className={"w-full"}
              onClick={() =>
                educationDetails.append({
                  education_level: "",
                  institution: "",
                  field_of_study: "",
                  final_evaluation_grade: "",
                  start_date: "",
                  year_of_completion: "",
                })
              }
            >
              <PlusCircle className={"mr-2 size-4"} /> Add Education
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
};

const ExperienceDetails = () => {
  const form = useFormContext<ResumeConfigSchemaType>();
  const experienceDetails = useFieldArray({
    name: "experience_details",
    control: form.control,
  });

  useEffect(() => {
    form.register("experience_details");
  }, []);

  const error = form.formState.errors.experience_details?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experience Details</CardTitle>
        <CardDescription>
          your previous work experience that will be used to generate your CV
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Card>
          <CardContent
            className="flex flex-col gap-5 pt-6"
            key={experienceDetails.fields.length}
          >
            {experienceDetails.fields.length === 0 && (
              <CardDescription>No experience details added yet</CardDescription>
            )}

            {error && <p className={"text-red-500 font-medium"}>{error}</p>}

            {experienceDetails.fields.map((_, index) => (
              <div key={index} className="flex flex-col gap-5">
                <div className="flex flex-row items-center justify-between">
                  <p className="font-medium leading-none">
                    Experience {index + 1}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => experienceDetails.remove(index)}
                  >
                    <MinusCircle className={"size-4"} />
                  </Button>
                </div>

                <FormField
                  label="Position"
                  name={`experience_details[${index}].position`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />

                <FormField
                  label="Company"
                  name={`experience_details[${index}].company`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />

                <FormField
                  label="Employment Period"
                  name={`experience_details[${index}].employment_period`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />

                <FormField
                  label="Location"
                  name={`experience_details[${index}].location`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />

                <FormField
                  label="Industry"
                  name={`experience_details[${index}].industry`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />

                <KeyResponsibilities idx={index} />
                <SkillsAcquired idx={index} />
              </div>
            ))}
          </CardContent>

          <CardFooter>
            <Button
              variant="outline"
              className={"w-full"}
              onClick={() =>
                experienceDetails.append({
                  position: "",
                  company: "",
                  employment_period: "",
                  location: "",
                  industry: "",
                  key_responsibilities: [],
                  skills_acquired: [],
                })
              }
            >
              <PlusCircle className={"mr-2 size-4"} /> Add Experience
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
};

const KeyResponsibilities = (props: { idx: number }) => {
  const form = useFormContext<ResumeConfigSchemaType>();
  const keyResponsibilities = useFieldArray({
    name: `experience_details.${props.idx}.key_responsibilities`,
    control: form.control,
  });

  useEffect(() => {
    form.register(`experience_details.${props.idx}.key_responsibilities`);
  }, []);

  const error =
    form.formState.errors.experience_details?.[props.idx]?.key_responsibilities
      ?.message;

  return (
    <Card>
      <CardContent
        className="flex flex-col gap-5 pt-6"
        key={keyResponsibilities.fields.length}
      >
        {keyResponsibilities.fields.length === 0 && (
          <CardDescription>No key responsibilities added yet</CardDescription>
        )}

        {error && <p className={"text-red-500 font-medium"}>{error}</p>}

        {keyResponsibilities.fields.map((_, index) => (
          <div key={index} className="flex flex-col gap-5">
            <div className="flex flex-row items-center justify-between">
              <p className="font-medium leading-none">
                Responsibility {index + 1}
              </p>
              <Button
                variant="outline"
                size="icon"
                onClick={() => keyResponsibilities.remove(index)}
              >
                <MinusCircle className={"size-4"} />
              </Button>
            </div>

            <FormField
              label=""
              name={`experience_details[${props.idx}].key_responsibilities[${index}].responsibility`}
              register={(field) => {
                return (
                  <Input
                    type="text"
                    value={field.value}
                    onChange={field.onChange}
                  />
                );
              }}
            />
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className={"w-full"}
          onClick={() =>
            keyResponsibilities.append({
              responsibility: "",
            })
          }
        >
          <PlusCircle className={"mr-2 size-4"} /> Add Key Responsibility
        </Button>
      </CardFooter>
    </Card>
  );
};

const SkillsAcquired = (props: { idx: number }) => {
  const form = useFormContext<ResumeConfigSchemaType>();
  const skillsAcquired = useFieldArray({
    name: `experience_details.${props.idx}.skills_acquired`,
    control: form.control,
  });

  useEffect(() => {
    form.register(`experience_details.${props.idx}.skills_acquired`);
  }, []);

  const error =
    form.formState.errors.experience_details?.[props.idx]?.skills_acquired
      ?.message;

  return (
    <Card>
      <CardContent
        className="flex flex-col gap-5 pt-6"
        key={skillsAcquired.fields.length}
      >
        {skillsAcquired.fields.length === 0 && (
          <CardDescription>No skills acquired added yet</CardDescription>
        )}

        {error && <p className={"text-red-500 font-medium"}>{error}</p>}

        {skillsAcquired.fields.map((_, index) => (
          <div key={index} className="flex flex-col gap-5">
            <div className="flex flex-row items-center justify-between">
              <p className="font-medium leading-none">Skill {index + 1}</p>
              <Button
                variant="outline"
                size="icon"
                onClick={() => skillsAcquired.remove(index)}
              >
                <MinusCircle className={"size-4"} />
              </Button>
            </div>

            <FormField
              label=""
              name={`experience_details[${props.idx}].skills_acquired[${index}].skill`}
              register={(field) => {
                return (
                  <Input
                    type="text"
                    value={field.value}
                    onChange={field.onChange}
                  />
                );
              }}
            />
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className={"w-full"}
          onClick={() =>
            skillsAcquired.append({
              skill: "",
            })
          }
        >
          <PlusCircle className={"mr-2 size-4"} /> Add Skill
        </Button>
      </CardFooter>
    </Card>
  );
};

const Achievements = () => {
  const form = useFormContext<ResumeConfigSchemaType>();
  const achievements = useFieldArray({
    name: "achievements",
    control: form.control,
  });

  useEffect(() => {
    form.register("achievements");
  }, []);

  const error = form.formState.errors.achievements?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          your achievements that will be used to generate your CV
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Card>
          <CardContent
            className="flex flex-col gap-5 pt-6"
            key={achievements.fields.length}
          >
            {achievements.fields.length === 0 && (
              <CardDescription>No achievements added yet</CardDescription>
            )}

            {error && <p className={"text-red-500 font-medium"}>{error}</p>}

            {achievements.fields.map((_, index) => (
              <div key={index} className="flex flex-col gap-5">
                <div className="flex flex-row items-center justify-between">
                  <p className="font-medium leading-none">
                    Achievement {index + 1}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => achievements.remove(index)}
                  >
                    <MinusCircle className={"size-4"} />
                  </Button>
                </div>

                <FormField
                  label="Name"
                  name={`achievements[${index}].name`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />

                <FormField
                  label="Description"
                  name={`achievements[${index}].description`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className={"w-full"}
              onClick={() =>
                achievements.append({
                  name: "",
                  description: "",
                })
              }
            >
              <PlusCircle className={"mr-2 size-4"} /> Add Achievement
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
};

const Certifications = () => {
  const form = useFormContext<ResumeConfigSchemaType>();
  const certifications = useFieldArray({
    name: "certifications",
    control: form.control,
  });

  useEffect(() => {
    form.register("certifications");
  }, []);

  const error = form.formState.errors.certifications?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certifications</CardTitle>
        <CardDescription>
          your certifications that will be used to generate your CV
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Card>
          <CardContent
            className="flex flex-col gap-5 pt-6"
            key={certifications.fields.length}
          >
            {certifications.fields.length === 0 && (
              <CardDescription>No certifications added yet</CardDescription>
            )}

            {error && <p className={"text-red-500 font-medium"}>{error}</p>}

            {certifications.fields.map((_, index) => (
              <div key={index} className="flex flex-col gap-5">
                <div className="flex flex-row items-center justify-between">
                  <p className="font-medium leading-none">
                    Certification {index + 1}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => certifications.remove(index)}
                  >
                    <MinusCircle className={"size-4"} />
                  </Button>
                </div>

                <FormField
                  label=""
                  name={`certifications[${index}].name`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className={"w-full"}
              onClick={() =>
                certifications.append({
                  name: "",
                })
              }
            >
              <PlusCircle className={"mr-2 size-4"} /> Add Certification
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
};

const Languages = () => {
  const form = useFormContext<ResumeConfigSchemaType>();
  const languages = useFieldArray({
    name: "languages",
    control: form.control,
  });

  useEffect(() => {
    form.register("languages");
  }, []);

  const error = form.formState.errors.languages?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Languages</CardTitle>
        <CardDescription>
          your languages that will be used to generate your CV
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Card>
          <CardContent
            className="flex flex-col gap-5 pt-6"
            key={languages.fields.length}
          >
            {languages.fields.length === 0 && (
              <CardDescription>No languages added yet</CardDescription>
            )}

            {error && <p className={"text-red-500 font-medium"}>{error}</p>}

            {languages.fields.map((_, index) => (
              <div key={index} className="flex flex-col gap-5">
                <div className="flex flex-row items-center justify-between">
                  <p className="font-medium leading-none">
                    Language {index + 1}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => languages.remove(index)}
                  >
                    <MinusCircle className={"size-4"} />
                  </Button>
                </div>

                <FormField
                  label="Language"
                  name={`languages[${index}].language`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />

                <FormField
                  label="Proficiency"
                  name={`languages[${index}].proficiency`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className={"w-full"}
              onClick={() =>
                languages.append({
                  language: "",
                  proficiency: "",
                })
              }
            >
              <PlusCircle className={"mr-2 size-4"} /> Add Language
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
};

const Interests = () => {
  const form = useFormContext<ResumeConfigSchemaType>();
  const interests = useFieldArray({
    name: "interests",
    control: form.control,
  });

  useEffect(() => {
    form.register("interests");
  }, []);

  const error = form.formState.errors.interests?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interests</CardTitle>
        <CardDescription>
          your interests that will be used to generate your CV
        </CardDescription>
      </CardHeader>
      <CardContent
        className="flex flex-col gap-5"
        key={interests.fields.length}
      >
        <Card>
          <CardContent className="flex flex-col gap-5 pt-6">
            {interests.fields.length === 0 && (
              <CardDescription>No interests added yet</CardDescription>
            )}

            {error && <p className={"text-red-500 font-medium"}>{error}</p>}

            {interests.fields.map((_, index) => (
              <div key={index} className="flex flex-col gap-5">
                <div className="flex flex-row items-center justify-between">
                  <p className="font-medium leading-none">
                    Interest {index + 1}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => interests.remove(index)}
                  >
                    <MinusCircle className={"size-4"} />
                  </Button>
                </div>

                <FormField
                  label=""
                  name={`interests[${index}].name`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className={"w-full"}
              onClick={() => interests.append({ name: "" })}
            >
              <PlusCircle className={"mr-2 size-4"} /> Add Interest
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
};

const Projects = () => {
  const form = useFormContext<ResumeConfigSchemaType>();
  const projects = useFieldArray({
    name: "projects",
    control: form.control,
  });

  useEffect(() => {
    form.register("projects");
  }, []);

  const error = form.formState.errors.projects?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>
          your projects that will be used to generate your CV
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Card>
          <CardContent
            className="flex flex-col gap-5 pt-6"
            key={projects.fields.length}
          >
            {projects.fields.length === 0 && (
              <CardDescription>No projects added yet</CardDescription>
            )}

            {error && <p className={"text-red-500 font-medium"}>{error}</p>}

            {projects.fields.map((_, index) => (
              <div key={index} className="flex flex-col gap-5">
                <div className="flex flex-row items-center justify-between">
                  <p className="font-medium leading-none">
                    Project {index + 1}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => projects.remove(index)}
                  >
                    <MinusCircle className={"size-4"} />
                  </Button>
                </div>

                <FormField
                  label="Name"
                  name={`projects[${index}].name`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />

                <FormField
                  label="Description"
                  name={`projects[${index}].description`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />

                <FormField
                  label="Link"
                  name={`projects[${index}].link`}
                  register={(field) => {
                    return (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className={"w-full"}
              onClick={() =>
                projects.append({
                  name: "",
                  description: "",
                  link: "",
                })
              }
            >
              <PlusCircle className={"mr-2 size-4"} /> Add Project
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
};

const General = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>
          your general information that will be used to generate your CV
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <FormField
          label="Gender"
          name="self_identification.gender"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="Pronouns"
          name="self_identification.pronouns"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label={"Veteran"}
          name={"self_identification.veteran"}
          controlPosition="beforeLabel"
          register={(field) => {
            return (
              <Checkbox
                className={"mr-2 inline-block translate-y-[3px]"}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label={"Disability"}
          name={"self_identification.disability"}
          controlPosition="beforeLabel"
          register={(field) => {
            return (
              <Checkbox
                className={"mr-2 inline-block translate-y-[3px]"}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="Ethnicity"
          name="self_identification.ethnicity"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="Availability"
          name="availability.notice_period"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="Salary Expectations"
          name="salary_expectations.salary_range_usd"
          description="What is the salary range you expect to receive (USD)? Note: use xx - yy format"
          register={(field) => {
            return (
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />
      </CardContent>
    </Card>
  );
};

const LegalAuthorization = () => {
  const legalAuthorization = [
    {
      label: "EU Work Authorization",
      name: "legal_authorization.eu_work_authorization",
    },
    {
      label: "US Work Authorization",
      name: "legal_authorization.us_work_authorization",
    },
    {
      label: "Requires US Visa",
      name: "legal_authorization.requires_us_visa",
    },
    {
      label: "Requires US Sponsorship",
      name: "legal_authorization.requires_us_sponsorship",
    },
    {
      label: "Requires EU Visa",
      name: "legal_authorization.requires_eu_visa",
    },
    {
      label: "Legally Allowed to Work in EU",
      name: "legal_authorization.legally_allowed_to_work_in_eu",
    },
    {
      label: "Legally Allowed to Work in US",
      name: "legal_authorization.legally_allowed_to_work_in_us",
    },
    {
      label: "Requires EU Sponsorship",
      name: "legal_authorization.requires_eu_sponsorship",
    },
    {
      label: "Canada Work Authorization",
      name: "legal_authorization.canada_work_authorization",
    },
    {
      label: "Requires Canada Visa",
      name: "legal_authorization.requires_canada_visa",
    },
    {
      label: "Legally Allowed to Work in Canada",
      name: "legal_authorization.legally_allowed_to_work_in_canada",
    },
    {
      label: "Requires Canada Sponsorship",
      name: "legal_authorization.requires_canada_sponsorship",
    },
    {
      label: "UK Work Authorization",
      name: "legal_authorization.uk_work_authorization",
    },
    {
      label: "Requires UK Visa",
      name: "legal_authorization.requires_uk_visa",
    },
    {
      label: "Legally Allowed to Work in UK",
      name: "legal_authorization.legally_allowed_to_work_in_uk",
    },
    {
      label: "Requires UK Sponsorship",
      name: "legal_authorization.requires_uk_sponsorship",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legal Authorization</CardTitle>
        <CardDescription>
          your legal authorization that will be used to generate your CV
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className={"flex flex-col gap-1"}>
          <p
            className={
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            }
          >
            Job Types
          </p>
          <span className={"text-muted-foreground text-sm"}>
            What kind of jobs do you want to search for?
          </span>

          <div className="h-2"></div>

          {legalAuthorization.map((la) => (
            <FormField
              label={la.label}
              name={la.name}
              controlPosition="beforeLabel"
              register={(field) => {
                return (
                  <Checkbox
                    className={"mr-2 inline-block translate-y-[3px]"}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                );
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const WorkPreferences = () => {
  const preferences = [
    {
      label: "Remote",
      name: "work_preferences.remote_work",
    },
    {
      label: "In Person",
      name: "work_preferences.in_person_work",
    },
    {
      label: "Open to Relocation",
      name: "work_preferences.open_to_relocation",
    },
    {
      label: "Willing to Complete Assessments",
      name: "work_preferences.willing_to_complete_assessments",
    },
    {
      label: "Willing to Undergo Drug Tests",
      name: "work_preferences.willing_to_undergo_drug_tests",
    },
    {
      label: "Willing to Undergo Background Checks",
      name: "work_preferences.willing_to_undergo_background_checks",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Preferences</CardTitle>
        <CardDescription>
          what kind of work do you want to search for?
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className={"flex flex-col gap-1"}>
          {preferences.map((pref) => (
            <FormField
              label={pref.label}
              name={pref.name}
              controlPosition="beforeLabel"
              register={(field) => {
                return (
                  <Checkbox
                    className={"mr-2 inline-block translate-y-[3px]"}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                );
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
