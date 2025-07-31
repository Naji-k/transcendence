// It defines the context type used in tRPC routers

export type Context = {
  db: String; // Replace with actual database connection type
  jwtUtils: {
    sign: (userId: string, email: string) => string;
  };
  user?: any; // Optional, if logged in
};

// generic response type for API responses
export type Response<T = unknown> = {
  status: number;
  message: string;
  data?: T;
};
