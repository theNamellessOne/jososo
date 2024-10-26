import {
  Header,
  NoSubscriptionAlert,
  SubmissionReport,
} from "@/app/(features)/dashboard/components";
import {
  SearchConfig,
  ResumeConfig,
  getSearchConfig,
} from "@/app/(features)/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPlainTextResume } from "../service/get-plain-text-resume";
import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { authConfig } from "@/lib";

export default async function () {
  const tokens = await getTokens(cookies(), authConfig);

  const searchConfigResponse = await getSearchConfig(
    tokens!.decodedToken.email!,
  );
  const plainTextResumeResponse = await getPlainTextResume(
    tokens!.decodedToken.email!,
  );

  return (
    <div>
      <Header />
      <NoSubscriptionAlert />

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="search-config">Search Configuration</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <SubmissionReport />
        </TabsContent>

        <TabsContent value="search-config">
          <SearchConfig
            defaultValues={
              searchConfigResponse.success
                ? searchConfigResponse.data
                : undefined
            }
          />
        </TabsContent>

        <TabsContent value="resume">
          <ResumeConfig
            defaultValues={
              plainTextResumeResponse.success
                ? plainTextResumeResponse.data
                : undefined
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
