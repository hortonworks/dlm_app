export interface JobTrackingInfo {
  jobId: string;
  totalMapTasks: number;
  completedMapTasks: number;
  numMapTasks: number;
  bytesCopied: number;
  filesCopies: number;
  timeTaken: number;
}
