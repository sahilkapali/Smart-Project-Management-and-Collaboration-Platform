export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}