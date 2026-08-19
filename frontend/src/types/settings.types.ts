export interface AppSettings {
  language: string;

  timezone: string;

  dateFormat: string;

  notifications: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    weeklyDigest: boolean;
    securityAlerts: boolean;
  };

  privacy: {
    profileVisibility: "public" | "team" | "private";
    allowIndexing: boolean;
    shareAnalytics: boolean;
  };
}
