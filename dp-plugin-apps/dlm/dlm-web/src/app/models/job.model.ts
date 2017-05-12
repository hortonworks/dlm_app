export interface Job {
  runTime: number;
  nextRun: number;
  duration: number;
  isCompleted: boolean;
  graphData: number[];
  transferred: number;
  previousRuns: Object[];

  id: string;
  policyId: string;
  name: string;
  type: string;
  executionType: string;
  user: string;
  status: string;
  startTime: string;
  endTime: string;
  trackingInfo: string;
  message: string;
}
