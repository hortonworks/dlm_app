export interface JobTrackingInfo {
  jobId: string;
  totalMapTasks: number;
  completedMapTasks: number;
  numMapTasks: number;
  bytesCopied: number;
  filesCopied: number;
  timeTaken: number;
}
