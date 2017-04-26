export interface Job {
  id: string;
  name: string;
  status: string;
  policy: string;
  startTime: number;
  endTime: number;
  runTime: number;
  nextRun: number;
  latestRun: number;
  service: string;
  duration: number;
  source: string;
  target: string;
  isCompleted: boolean;
  graphData: number[];
  previousRuns: Object[];
}
