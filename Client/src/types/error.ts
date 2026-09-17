export interface ErrorResponse {
  title: string;
  errors?: Record<string, string[]>;
}
