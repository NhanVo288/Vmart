import { baseApi } from './baseApi';

export interface ContactMessageRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  message: string;
}

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation<ContactMessageResponse, ContactMessageRequest>({
      query: (body) => ({
        url: '/contact',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSendContactMessageMutation } = contactApi;
