import { baseApi } from './baseApi';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AuthenticationResult,
  UserInfo,
  AddressDto,
} from '../types/account';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/account/login',
        method: 'POST',
        body,
      }),
    }),

    register: builder.mutation<AuthenticationResult, RegisterRequest>({
      query: (body) => ({
        url: '/account/register',
        method: 'POST',
        body,
      }),
    }),

    getUserInfo: builder.query<UserInfo, void>({
      query: () => '/account/user-info',
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/account/logout',
        method: 'POST',
      }),
    }),

    updateAddress: builder.mutation<AddressDto, AddressDto>({
      query: (body) => ({
        url: '/account/address',
        method: 'POST',
        body,
      }),
    }),

    getAddress: builder.query<AddressDto, void>({
      query: () => '/account/address',
    }),

    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: '/account/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation<
      { message: string },
      { email: string; token: string; newPassword: string }
    >({
      query: (body) => ({
        url: '/account/reset-password',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUserInfoQuery,
  useLazyGetUserInfoQuery,
  useLogoutMutation,
  useUpdateAddressMutation,
  useGetAddressQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
