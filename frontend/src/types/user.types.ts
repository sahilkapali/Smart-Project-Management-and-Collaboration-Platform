export interface User {
  _id: string;
  first_Name: string;
  last_Name: string;
  email: string;
  role: string;
  profile_image?: {
    path: string;
    public_id: string;
  };
}