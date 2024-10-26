"use client";

import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getSearchConfig,
  saveSearchConfig,
  searchConfigSchema,
  type SearchConfigSchemaType,
} from "@/app/(features)/dashboard";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BadgeInputField } from "@/app/(features)/dashboard/components";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { LoadingOverlay } from "@/components/loading-overlay";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import { BlockingError } from "@/components/blocking-error";

type Props = {
  defaultValues?: SearchConfigSchemaType;
};

export const SearchConfig = (props: Props) => {
  const form = useForm<SearchConfigSchemaType>({
    mode: "all",
    resolver: zodResolver(searchConfigSchema),
    defaultValues: props.defaultValues ?? {
      remote: false,
      distance: 0,

      locations: [],

      job_applicants_threshold: {
        min_aplicants: undefined,
        max_aplicants: undefined,
      },
      apply_once_at_company: false,

      date: {
        "all time": false,
        month: false,
        week: false,
        "24 hours": false,
      },

      experienceLevel: {
        internship: false,
        entry: false,
        associate: false,
        "mid-senior level": false,
        director: false,
        executive: false,
      },

      jobTypes: {
        "full-time": false,
        contract: false,
        "part-time": false,
        temporary: false,
        internship: false,
        other: false,
        volunteer: false,
      },

      positions: [],

      title_blacklist: [],
      company_blacklist: [],
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const { user, hasValidSubscription } = useAuth();

  const [blockingError, setBlockingError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (blockingError) return;
    if (hasValidSubscription) return;

    setBlockingError("Seems like you don't have a subscription");
  }, [hasValidSubscription]);

  useEffect(() => {
    setLoading(true);
    getSearchConfig(user?.email!)
      .then((response) => {
        if (response.success) {
          form.reset(response.data);
          return;
        }

        if (response.message === "Config not found") {
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

  const handleSubmit = async (data: SearchConfigSchemaType) => {
    if (!isValid) return form.trigger();

    const response = await saveSearchConfig(user.email, data);

    response.success
      ? toast.success(response.message)
      : toast.error(response.message);
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
      {(loading || isSubmitting) && <LoadingOverlay className={"fixed"} />}
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
          <CardTitle>Search Configuration</CardTitle>
          <CardDescription>
            configure every aspect of your search
          </CardDescription>
        </CardHeader>

        <Button disabled={isSubmitting} type="submit">
          <Save className="size-4 mr-2" />
          Save
        </Button>
      </form>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(console.log)}>
          <div className="flex flex-col lg:flex-row gap-5 ">
            <div className="flex flex-col gap-5 lg:w-3/5">
              <GeneralPreferences />
              <LocationPreferences />
            </div>
            <div className="flex flex-col gap-5 lg:w-2/5">
              <Blacklist />
              <Other />
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

const LocationPreferences = () => {
  const form = useFormContext<SearchConfigSchemaType>();
  const locations = useFieldArray({
    name: "locations",
    control: form.control,
  });

  useEffect(() => {
    form.register("locations");
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location preferences</CardTitle>
        <CardDescription>
          where jobsenderbot will be looking for your dream job
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <FormField
          label="Remote"
          name="remote"
          controlPosition="beforeLabel"
          description="Whether you want to search for remote jobs"
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
          label="Distance"
          name="distance"
          description="How far away from your current location you want to search"
          register={(field) => {
            return (
              <div className="relative">
                <Input
                  type="number"
                  className="input input-bordered w-full"
                  value={field.value}
                  onChange={field.onChange}
                />
                <span className="absolute right-8 top-0 bottom-0 flex items-center justify-center text-sm text-muted-foreground">
                  mi
                </span>
              </div>
            );
          }}
        />

        <BadgeInputField
          label="Locations"
          name="locations"
          description="Where you want to search for jobs. Note: use `,` to separate"
          items={locations.fields.map((pos) => pos.name)}
          removeItem={locations.remove}
          appendItem={(name) => locations.append({ name })}
        />
      </CardContent>
    </Card>
  );
};

const GeneralPreferences = () => {
  const form = useFormContext<SearchConfigSchemaType>();
  const positions = useFieldArray({
    name: "positions",
    control: form.control,
  });

  useEffect(() => {
    form.register("positions");
  }, []);

  const jobTypes = [
    {
      label: "Fulltime",
      description: "Whether you want to search for fulltime jobs",
      name: "jobTypes.full-time",
    },

    {
      label: "Contract",
      description: "Whether you want to search for contract jobs",
      name: "jobTypes.contract",
    },

    {
      label: "Part-time",
      description: "Whether you want to search for part-time jobs",
      name: "jobTypes.part-time",
    },

    {
      label: "Temporary",
      description: "Whether you want to search for temporary jobs",
      name: "jobTypes.temporary",
    },

    {
      label: "Internship",
      description: "Whether you want to search for internship jobs",
      name: "jobTypes.internship",
    },

    {
      label: "Volunteer",
      description: "Whether you want to search for volunteer jobs",
      name: "jobTypes.volunteer",
    },

    {
      label: "Other",
      description: "Whether you want to search for other jobs",
      name: "jobTypes.other",
    },
  ];

  const experienceLevels = [
    {
      label: "Internship",
      name: "experienceLevel.internship",
    },
    {
      label: "Entry",
      name: "experienceLevel.entry",
    },
    {
      label: "Associate",
      name: "experienceLevel.associate",
    },
    {
      label: "Mid-Senior Level",
      name: "experienceLevel.mid-senior level",
    },
    {
      label: "Director",
      name: "experienceLevel.director",
    },
    {
      label: "Executive",
      name: "experienceLevel.executive",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>General preferences</CardTitle>
        <CardDescription>
          what kind of jobs do you want to search for?
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

          {jobTypes.map((jobType) => (
            <FormField
              label={jobType.label}
              name={jobType.name}
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

        <div className={"flex flex-col gap-1"}>
          <p
            className={
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            }
          >
            Experience Levels
          </p>
          <span className={"text-muted-foreground text-sm"}>
            What experience levels do you want to search for?
          </span>

          <div className="h-2"></div>

          {experienceLevels.map((expLvl) => (
            <FormField
              label={expLvl.label}
              name={expLvl.name}
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

        <BadgeInputField
          label="Positions"
          name="positions"
          description="What positions do you want to search for? Note: use `,` to separate"
          items={positions.fields.map((pos) => pos.name)}
          removeItem={positions.remove}
          appendItem={(name) => positions.append({ name })}
        />
      </CardContent>
    </Card>
  );
};

const Blacklist = () => {
  const form = useFormContext<SearchConfigSchemaType>();

  const titleBlacklist = useFieldArray({
    name: "title_blacklist",
    control: form.control,
  });

  const companyBlacklist = useFieldArray({
    name: "company_blacklist",
    control: form.control,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blacklist</CardTitle>
        <CardDescription>
          what jobs do you want to exclude from the search results?
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <BadgeInputField
          label="Title blacklist"
          name="titleBlacklist"
          description="What titles do you want to exclude from the search results? Note: use `,` to separate"
          items={titleBlacklist.fields.map((pos) => pos.name)}
          removeItem={titleBlacklist.remove}
          appendItem={(name) => titleBlacklist.append({ name })}
        />

        <BadgeInputField
          label="Company blacklist"
          name="companyBlacklist"
          description="What companies do you want to exclude from the search results? Note: use `,` to separate"
          items={companyBlacklist.fields.map((pos) => pos.name)}
          removeItem={companyBlacklist.remove}
          appendItem={(name) => companyBlacklist.append({ name })}
        />
      </CardContent>
    </Card>
  );
};

const Other = () => {
  const dates = [
    {
      label: "All Time",
      name: "date.all time",
    },
    {
      label: "Month",
      name: "date.month",
    },
    {
      label: "Week",
      name: "date.week",
    },
    {
      label: "24 Hours",
      name: "date.24 hours",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Other</CardTitle>
        <CardDescription>
          what other preferences do you want to set?
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <FormField
          label="Only apply once at company"
          name="apply_once_at_company"
          controlPosition="beforeLabel"
          description="Whether you want to search for remote jobs"
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
          label="Min applicants"
          name="job_applicants_threshold.min_aplicants"
          description="What is the minimum number of applicants of the job you want to search for?"
          register={(field) => {
            return (
              <Input
                type="number"
                className="input input-bordered w-full"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <FormField
          label="Max applicants"
          name="job_applicants_threshold.max_aplicants"
          description="What is the maximum number of applicants of the job you want to search for?"
          register={(field) => {
            return (
              <Input
                type="number"
                className="input input-bordered w-full"
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <div className={"flex flex-col gap-1"}>
          <p
            className={
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            }
          >
            Dates
          </p>
          <span className={"text-muted-foreground text-sm"}>
            how old search results should be?
          </span>

          {dates.map((date) => (
            <FormField
              label={date.label}
              name={date.name}
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
