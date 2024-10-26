type BasicSuccessReturn<T = unknown> = {
  success: true;
  data: T;
  message: string;
};

type BasicErrorReturn = {
  success: false;
  message: string;
};

export type BasicReturn<T = unknown> = BasicSuccessReturn<T> | BasicErrorReturn;

export type JobSubmission = {
  id: number;
  user_id: number;
  company: string;
  title: string;
  recruiter_link: string;
  location: string;
  link: string;
  pdf_path: string;
};
