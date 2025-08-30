// It defines the context type used in tRPC routers

export interface Services {
	jwtUtils: {
		sign: (userId: number, email: string) => string;
	};
	auth: {
		signUp: (name: string, email: string, password: string) => Promise<any>;
		signIn: (email: string, password: string) => Promise<any>;
	};
}

export interface Context {
	db: any; // Replace with actual database connection type
	services: Services;
	userToken?: any; // Optional, if logged in
}

// generic response type for API responses
export interface Response<T> {
	status: number;
	message: string;
	data: T;
}

export interface LoginResponse {
	user: User;
	token: string;
}

export interface User {
	id: number;
	email: string;
	name: string;
}
