// It defines the context type used in tRPC routers
export type Context = {
  db: String; // Replace with actual database connection type
  user?: { id: string; email: string }; // Optional, if logged in
};
