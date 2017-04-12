import {DiskStats} from './disk-stats';

export class Host {
    name: string;
    clusterName: string;
    ambariHost: string;
    dataCenter: string;
    hostState: string;
    hostStatus: string;
    ip: string;
    cpu: number;
    diskStats: DiskStats[];
}