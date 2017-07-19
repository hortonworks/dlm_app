export interface ProgressState {
  requestId: string;
  isInProgress: boolean;
  success: boolean;
  error?: boolean;
  errorMessage?: any;
  [key: string]: any;
};
