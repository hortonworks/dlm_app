export interface JobTrackingInfo {
  jobId: string;
  numMapTasks: number;
  bytesCopied: number;
  filesCopies: number;
  timeTaken: number;
}
