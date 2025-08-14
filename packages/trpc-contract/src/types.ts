// It defines the context type used in tRPC routers

export interface Context {
  db: string; // Replace with actual database connection type
  jwtUtils: {
    sign: (userId: string, email: string) => string;
  };
  user?: any; // Optional, if logged in
};

// generic response type for API responses
export interface Response <T>  {
  status: number;
  message: string;
  data: T,
};

export interface LoginResponse {
  user: User,
  token: string
}

export interface User {
  id: number,
  email: string,
  name: string
}