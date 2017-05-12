import { DoughnutChartData } from 'components/doughnut-chart';

export interface ResourceChartData {
  clusters: DoughnutChartData;
  policies: DoughnutChartData;
  jobs: DoughnutChartData;
};
