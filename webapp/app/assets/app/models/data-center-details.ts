import {Host} from './host';
import {NameNodeInfo} from './name-node-info';
export class DataCenterDetails {
    hosts: Host[] = [];
    nameNodeInfo: NameNodeInfo[];
    loadAvg: number;
    numClusters: number;
}