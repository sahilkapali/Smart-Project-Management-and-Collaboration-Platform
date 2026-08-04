export interface RegisterUserInput {
  first_Name: string;
  last_Name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}