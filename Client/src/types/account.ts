export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  isSuccess: boolean;
  email?: string;
  errors?: string[];
}

export interface AuthenticationResult {
  isSuccess: boolean;
  email?: string;
  errors?: string[];
}

export interface UserInfo {
  email: string;
  userName: string;
  roles: string[];
}

export interface AddressDto {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}
