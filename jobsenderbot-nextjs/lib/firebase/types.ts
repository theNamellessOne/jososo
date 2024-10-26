export type UserInfo = {
  email: string;
  name: string;
  isTrial: boolean;
  linkedinConnected: boolean;
  subscriptionValidTo: number;
  customerId: string;
};

export type UserData = {
  uid: string;
} & UserInfo;
